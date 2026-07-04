import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { OwnerQueryNoticeToast } from "@/src/features/queries/owner-query-notice-toast";
import { OwnerQuerySubmitButton } from "@/src/features/queries/owner-query-submit-button";
import { OwnerQueriesTable } from "@/src/features/queries/queries-table";
import { createOwnerQueryAction } from "@/src/features/shared/actions";
import { getOwnerData } from "@/src/features/shared/data";

export default async function OwnerQueriesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const params = await searchParams;
  const noticeParam = params.notice;
  const notice = Array.isArray(noticeParam) ? noticeParam[0] : noticeParam;
  const { profile, properties, queries } = await getOwnerData();
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const queryRows = queries.map((query) => ({
    ...query,
    owner_name: profile.name || profile.email,
    property_name: query.property_id ? propertyNames.get(query.property_id) || "Unknown" : "None",
  }));
  const openQueryCount = queryRows.filter((query) => !query.resolved).length;
  const queryCountLabel = `${queryRows.length} ${queryRows.length === 1 ? "query" : "queries"}`;
  const scopeLabel =
    properties.length === 1
      ? `Linked to ${properties[0]?.name ?? "your assigned property"}`
      : properties.length > 1
        ? `Linked to your ${properties.length} assigned properties`
        : "General owner query";

  return (
    <div className="space-y-6">
      <OwnerQueryNoticeToast notice={notice} />

      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <Badge tone="brand" className="mb-4">Owner support</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Queries
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f5b55] sm:text-base">
              Raise a question about your property, bookings, expenses, or payout statement. We keep the thread simple and visible here.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-[0_10px_24px_rgba(34,34,34,0.04)]">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Open questions</p>
            <p className="mt-2 text-2xl font-extrabold tabular-nums text-[var(--foreground)]">{openQueryCount}</p>
            <p className="mt-1 text-xs leading-5 text-[#6a655f]">{scopeLabel}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.45fr)]">
        <Card className="overflow-hidden border-[var(--border)]">
          <CardHeader
            subtitle="Ask about a booking, expense, property detail, or monthly statement. Include the month or booking name if it helps."
            title="Raise a new query"
          />
          <CardBody>
            <form action={createOwnerQueryAction} className="space-y-4">
              <input name="property_id" type="hidden" value={properties[0]?.id || ""} />
              <label className="block" htmlFor="owner-query-message">
                <span className="cms-label">Message</span>
                <Textarea
                  aria-describedby="owner-query-message-help"
                  className="min-h-40 resize-y leading-6"
                  id="owner-query-message"
                  name="message"
                  placeholder="Write your question here..."
                  required
                />
              </label>
              <p className="text-sm leading-6 text-[#5f5b55]" id="owner-query-message-help">
                Your query is sent to the CurateMyStay team. If it relates to a payout statement, mention the payout month.
              </p>
              <OwnerQuerySubmitButton />
            </form>
          </CardBody>
        </Card>

        <Card className="min-w-0 overflow-hidden border-[var(--border)]">
          <CardHeader
            action={<Badge tone="neutral" className="whitespace-nowrap">{queryCountLabel}</Badge>}
            subtitle="Track open and resolved questions. Payout-related questions are shown as statement queries without exposing internal admin workflow."
            title="Query history"
          />
          <CardBody className="p-0">
            <OwnerQueriesTable queries={queryRows} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
