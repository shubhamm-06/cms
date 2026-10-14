"use client";

import { AlertTriangle, CheckCircle2, ChevronDown, Download, FileText, FileUp, Info, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useActionState, useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { importPropertiesCsvAction, type PropertyImportActionState } from "@/src/features/properties/property-import-actions";
import {
  isCsvFileName,
  PROPERTY_IMPORT_DEMO_CSV,
  PROPERTY_IMPORT_FILE_NAME,
  PROPERTY_IMPORT_HEADERS,
  PROPERTY_IMPORT_LISTING_GROUPS,
  PROPERTY_IMPORT_MAX_BYTES,
  PROPERTY_IMPORT_MAX_ROWS,
  validatePropertyImportCsv,
  type PropertyImportOwner,
  type PropertyImportPreviewRow,
  type PropertyImportValidation,
} from "@/src/features/properties/property-import";
import { cn } from "@/src/lib/utils/cn";

const initialActionState: PropertyImportActionState = { ok: false };

const resultTone = {
  duplicate: "amber",
  invalid: "destructive",
  ready: "green",
} as const;

function resultLabel(result: PropertyImportPreviewRow["result"]) {
  if (result === "ready") return "Ready";
  if (result === "duplicate") return "Duplicate";
  return "Invalid";
}

const websiteTone = {
  hidden: "neutral",
  "hidden-draft": "amber",
  published: "green",
} as const;

const websiteLabel = {
  hidden: "Hidden",
  "hidden-draft": "Hidden with draft data",
  published: "Published",
} as const;

function downloadDemoCsv() {
  const blob = new Blob(["\uFEFF", PROPERTY_IMPORT_DEMO_CSV], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = PROPERTY_IMPORT_FILE_NAME;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function SummaryTile({ label, tone = "neutral", value }: { label: string; tone?: "neutral" | "green" | "amber" | "red"; value: number }) {
  const styles = {
    amber: "border-yellow-100 bg-[var(--amber-soft)]",
    green: "border-green-100 bg-[var(--green-soft)]",
    neutral: "border-[var(--border)] bg-white",
    red: "border-red-100 bg-red-50",
  };

  return (
    <div className={cn("rounded-xl border px-3 py-3 shadow-[0_8px_18px_rgba(34,34,34,0.03)]", styles[tone])}>
      <div className="text-xl font-bold tabular-nums text-[var(--foreground)]">{value}</div>
      <div className="mt-1 text-xs font-semibold text-[#5f5b55]">{label}</div>
    </div>
  );
}

function RequirementGroup({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white/80 p-3">
      <div className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{title}</div>
      <ul className="mt-2 grid gap-1.5 text-sm leading-5 text-[#4f4943]">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-[var(--brand)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeaderChip({ header }: { header: string }) {
  return (
    <span className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs font-semibold text-[#4f4943]">
      {header}
    </span>
  );
}

function ImportDialogContent({
  existingPropertyNames,
  existingPropertySlugs,
  onClose,
  profiles,
}: {
  existingPropertyNames: string[];
  existingPropertySlugs: string[];
  onClose: () => void;
  profiles: PropertyImportOwner[];
}) {
  const router = useRouter();
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [fileError, setFileError] = useState("");
  const [preview, setPreview] = useState<PropertyImportValidation | null>(null);
  const [showActionFeedback, setShowActionFeedback] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [actionState, formAction, pending] = useActionState(importPropertiesCsvAction, initialActionState);

  const displayedActionResult = showActionFeedback && !pending ? actionState.result : undefined;
  const visibleRows = displayedActionResult?.rows || preview?.rows || [];
  const summary = useMemo(() => {
    if (displayedActionResult) {
      return {
        duplicateRows: displayedActionResult.skippedDuplicates,
        invalidRows: displayedActionResult.skippedInvalid,
        readyRows: displayedActionResult.inserted,
        totalRows: displayedActionResult.totalProcessed,
      };
    }
    return preview?.summary;
  }, [displayedActionResult, preview?.summary]);
  const invalidRowCount = visibleRows.filter((row) => row.result === "invalid").length;
  const publishedWithoutImagesCount = visibleRows.filter((row) => row.warnings.length > 0).length;
  const hasBlockingErrors = Boolean(fileError || preview?.error || invalidRowCount > 0);
  const hasImportableRows = Boolean(preview && preview.rows.length > 0 && preview.summary.readyRows > 0 && csvText && fileName);
  const canConfirmImport = hasImportableRows && !hasBlockingErrors && !pending;

  useEffect(() => {
    if (!actionState.ok || !actionState.result || actionState.result.inserted === 0) return;
    router.refresh();
  }, [actionState.ok, actionState.result, router]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, pending]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileError("");
    setPreview(null);
    setCsvText("");
    setFileName("");
    setFileSize(0);
    setShowActionFeedback(false);
    setExpandedRows(new Set());

    if (!file) return;

    if (!isCsvFileName(file.name)) {
      setFileError("Upload a .csv file.");
      return;
    }

    if (file.size > PROPERTY_IMPORT_MAX_BYTES) {
      setFileError("CSV file cannot exceed 5 MB.");
      return;
    }

    const text = await file.text();
    const validation = validatePropertyImportCsv({
      csv: text,
      existingPropertyNames,
      existingPropertySlugs,
      owners: profiles,
    });

    setCsvText(text);
    setFileName(file.name);
    setFileSize(file.size);
    setPreview(validation);
  }

  function toggleRowDetails(rowNumber: number) {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(rowNumber)) next.delete(rowNumber);
      else next.add(rowNumber);
      return next;
    });
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !pending) onClose();
  }

  function handleConfirmImport(event: FormEvent<HTMLFormElement>) {
    if (hasBlockingErrors || pending || !hasImportableRows) {
      event.preventDefault();
      return;
    }

    setShowActionFeedback(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#17110d]/70 p-3 backdrop-blur-md sm:p-5"
      onMouseDown={handleOverlayClick}
    >
      <div className="my-auto flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/30 bg-[#fbf7f1] shadow-[0_28px_90px_rgba(15,23,42,0.32)]">
        <div className="border-b border-[var(--border)] bg-white px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-ink)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin property import
              </div>
              <h2 className="mt-3 text-xl font-bold tracking-tight text-[var(--foreground)]">Import properties from CSV</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#5f5b55]">
                Preview every row before writing. Only valid, non-duplicate properties are inserted.
              </p>
            </div>
            <button
              aria-label="Close import dialog"
              className="cms-btn min-h-9 flex-none bg-white px-3 py-1.5 hover:bg-[var(--surface-2)]"
              disabled={pending}
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-4 py-4 sm:px-5">
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-2xl border border-[var(--border)] bg-white/75 p-4 shadow-[0_12px_26px_rgba(34,34,34,0.04)]">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
                <Info className="h-4 w-4 text-[var(--brand)]" />
                CSV requirements
              </div>
              <div className="mt-3 grid gap-3">
                <RequirementGroup
                  items={[
                    `${Math.round(PROPERTY_IMPORT_MAX_BYTES / 1024 / 1024)} MB maximum file size`,
                    `${PROPERTY_IMPORT_MAX_ROWS.toLocaleString("en-IN")} non-empty rows maximum`,
                    "Existing and repeated property names are skipped",
                    "A slug that already exists, or repeats in the CSV, makes the row invalid",
                  ]}
                  title="Limits"
                />
                <RequirementGroup
                  items={[
                    "Required: property_name, owner_email, owner_share_percentage, status",
                    "Optional: address, city, bedrooms",
                    "Status must be active or inactive",
                    "Website listing columns are all optional; a blank cell uses the admin form default",
                  ]}
                  title="Fields"
                />
                <RequirementGroup
                  items={[
                    "Booleans: true/false, yes/no or 1/0",
                    "Lists (property_highlights, amenities, house_rules): separate items with |",
                    "Times: 24-hour HH:MM, for example 14:00",
                    "Slug: lowercase letters, numbers and hyphens. Generated from public_name when show_on_website is true and slug is blank",
                    "show_on_website true runs the admin publish checks; otherwise listing values are saved as a hidden draft",
                    "Images cannot be imported. Add a gallery after import",
                  ]}
                  title="Website listing"
                />
                <div className="rounded-xl border border-[var(--border)] bg-white/80 p-3">
                  <div className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Headers</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PROPERTY_IMPORT_HEADERS.map((header) => (
                      <HeaderChip header={header} key={header} />
                    ))}
                  </div>
                  <div className="mt-3 grid gap-2.5">
                    {PROPERTY_IMPORT_LISTING_GROUPS.map((group) => (
                      <div key={group.title}>
                        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{group.title}</div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {group.headers.map((header) => (
                            <HeaderChip header={header} key={header} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_12px_26px_rgba(34,34,34,0.04)]">
              <label
                className={cn(
                  "block rounded-2xl border border-dashed p-4 transition",
                  fileName
                    ? "border-green-200 bg-[var(--green-soft)]"
                    : "border-[var(--border)] bg-[var(--surface-2)]/70 hover:border-red-200 hover:bg-[var(--brand-soft)]/50",
                )}
              >
                <span className="flex items-start gap-3">
                  <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-white shadow-[0_8px_18px_rgba(34,34,34,0.06)]">
                    <FileText className="h-5 w-5 text-[var(--brand)]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[var(--foreground)]">
                      {fileName ? "Selected CSV" : "Choose CSV file"}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-[#5f5b55]">
                      {fileName
                        ? `${fileName} (${Math.max(1, Math.round(fileSize / 1024)).toLocaleString("en-IN")} KB)`
                        : "Use the demo template, then upload a completed property list."}
                    </span>
                  </span>
                </span>
                <input
                  accept=".csv,text/csv"
                  className="mt-4 block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-[var(--border)] file:bg-white file:px-3 file:py-2 file:text-sm file:font-bold file:text-[var(--foreground)]"
                  disabled={pending}
                  key={fileName || "empty-file-input"}
                  onChange={handleFileChange}
                  type="file"
                />
              </label>

              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--cream)]/70 p-3 text-sm leading-6 text-[#5f5b55]">
                Owner email is matched to an existing active owner. The server re-checks this CSV before any insert.
              </div>

              {fileError || preview?.error ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {fileError || preview?.error}
                </div>
              ) : null}

              {showActionFeedback && !pending && actionState.message ? (
                <div
                  className={cn(
                    "mt-4 rounded-xl border px-3 py-2 text-sm font-semibold",
                    actionState.ok
                      ? "border-green-100 bg-[var(--green-soft)] text-green-800"
                      : "border-red-200 bg-red-50 text-red-700",
                  )}
                >
                  {actionState.message}
                </div>
              ) : null}
            </section>
          </div>

          <section className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_12px_26px_rgba(34,34,34,0.04)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]">Preview summary</h3>
                <p className="mt-1 text-sm text-[#5f5b55]">
                  {fileName ? "Review these counts before confirming import." : "Choose a CSV to see row-level results."}
                </p>
              </div>
              {fileName ? <Badge tone="brand">{fileName}</Badge> : null}
            </div>

            {summary ? (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <SummaryTile label="Total rows" value={summary.totalRows} />
                <SummaryTile label="Ready" tone="green" value={summary.readyRows} />
                <SummaryTile label="Duplicates" tone="amber" value={summary.duplicateRows} />
                <SummaryTile label="Invalid" tone="red" value={summary.invalidRows} />
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-7 text-center text-sm text-[var(--muted)]">
                No preview yet.
              </div>
            )}
          </section>

          {publishedWithoutImagesCount > 0 ? (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-yellow-200 bg-[var(--amber-soft)] px-3 py-2 text-sm font-semibold text-yellow-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
              <span>
                {publishedWithoutImagesCount} published {publishedWithoutImagesCount === 1 ? "row has" : "rows have"} no images.
                Images cannot be imported, so add a gallery after import.
              </span>
            </div>
          ) : null}

          {visibleRows.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_12px_26px_rgba(34,34,34,0.04)]">
              <div className="overflow-x-auto">
                <table className="min-w-[1040px] text-left text-sm">
                  <thead className="bg-[var(--surface-2)] text-xs font-bold uppercase tracking-[0.06em] text-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-3">Row</th>
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Owner email</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Website</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3">Result</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {visibleRows.map((row) => {
                      const expanded = expandedRows.has(row.rowNumber);
                      const detailsId = `property-import-row-${row.rowNumber}-details`;
                      return (
                        <Fragment key={`${row.rowNumber}-${row.propertyName}-${row.ownerEmail}`}>
                          <tr className={row.result === "invalid" ? "bg-red-50/60" : undefined}>
                            <td className="px-4 py-3 font-semibold tabular-nums text-[var(--foreground)]">{row.rowNumber}</td>
                            <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{row.propertyName || "-"}</td>
                            <td className="px-4 py-3 text-[#5f5b55]">{row.ownerEmail || "-"}</td>
                            <td className="px-4 py-3 capitalize">{row.status || "-"}</td>
                            <td className="px-4 py-3">
                              <Badge className="whitespace-nowrap" tone={websiteTone[row.website]}>
                                {websiteLabel[row.website]}
                              </Badge>
                            </td>
                            <td className="max-w-[200px] break-words px-4 py-3 text-[#5f5b55]">{row.slug || "-"}</td>
                            <td className="px-4 py-3">
                              <Badge className="whitespace-nowrap" tone={resultTone[row.result]}>
                                {resultLabel(row.result)}
                              </Badge>
                            </td>
                            <td className="min-w-[260px] px-4 py-3 text-[#5f5b55]">
                              <span className={row.result === "invalid" ? "font-semibold text-red-700" : undefined}>{row.reason}</span>
                              {row.warnings.map((warning) => (
                                <span className="mt-1 flex items-start gap-1.5 text-xs font-semibold text-yellow-800" key={warning}>
                                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
                                  {warning}
                                </span>
                              ))}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                aria-controls={detailsId}
                                aria-expanded={expanded}
                                className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-[var(--border)] bg-white px-2.5 py-1.5 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                                onClick={() => toggleRowDetails(row.rowNumber)}
                                type="button"
                              >
                                {expanded ? "Hide" : "Show"}
                                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
                              </button>
                            </td>
                          </tr>
                          {expanded ? (
                            <tr className="bg-[var(--surface-2)]/60" id={detailsId}>
                              <td className="px-4 py-3" colSpan={9}>
                                <div className="sticky left-4 w-[min(760px,calc(100vw-8rem))]">
                                  {row.details.length > 0 ? (
                                    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                                      {row.details.map((detail) => (
                                        <div className="min-w-0" key={detail.label}>
                                          <dt className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--muted)]">
                                            {detail.label}
                                          </dt>
                                          <dd className="mt-0.5 whitespace-pre-line break-words text-sm text-[#4f4943]">{detail.value}</dd>
                                        </div>
                                      ))}
                                    </dl>
                                  ) : (
                                    <p className="text-sm text-[var(--muted)]">No additional values in this row.</p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-[var(--border)] bg-white/95 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
          {hasBlockingErrors ? (
            <div aria-live="polite" className="text-sm leading-6" id="property-import-blocked-message">
              <p className="font-semibold text-red-700">
                {invalidRowCount > 0
                  ? `Import unavailable: ${invalidRowCount} ${invalidRowCount === 1 ? "row contains" : "rows contain"} validation errors.`
                  : "Import unavailable because the CSV has validation errors."}
              </p>
              <p className="text-[#5f5b55]">Fix the highlighted errors in your CSV and upload it again before importing.</p>
            </div>
          ) : (
            <p className="text-sm leading-6 text-[#5f5b55]">
              Import never overwrites existing properties. Edit/delete behavior stays unchanged.
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <Button disabled={pending} onClick={onClose} type="button" variant="secondary">
              Cancel
            </Button>
            <form action={formAction} onSubmit={handleConfirmImport}>
              <input name="fileName" readOnly type="hidden" value={fileName} />
              <textarea className="hidden" name="csv" readOnly value={csvText} />
              <Button
                aria-describedby={hasBlockingErrors ? "property-import-blocked-message" : undefined}
                className="w-full disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-2)] disabled:text-[var(--muted)] disabled:opacity-70 disabled:shadow-none disabled:transition-none disabled:hover:bg-[var(--surface-2)] disabled:active:scale-100 sm:w-auto"
                disabled={!canConfirmImport}
                pending={pending}
                type="submit"
                variant="primary"
              >
                {pending ? "Importing..." : "Confirm Import"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PropertyImportDialog({
  existingPropertyNames,
  existingPropertySlugs,
  profiles,
}: {
  existingPropertyNames: string[];
  existingPropertySlugs: string[];
  profiles: PropertyImportOwner[];
}) {
  const [open, setOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  function closeDialog() {
    setOpen(false);
    setSessionKey((current) => current + 1);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={downloadDemoCsv} size="sm" type="button" variant="secondary">
          <Download className="h-4 w-4" />
          Download Demo CSV
        </Button>
        <Button onClick={() => setOpen(true)} size="sm" type="button" variant="primary">
          <FileUp className="h-4 w-4" />
          Import CSV
        </Button>
      </div>

      {open ? (
        <ImportDialogContent
          existingPropertyNames={existingPropertyNames}
          existingPropertySlugs={existingPropertySlugs}
          key={sessionKey}
          onClose={closeDialog}
          profiles={profiles}
        />
      ) : null}
    </>
  );
}
