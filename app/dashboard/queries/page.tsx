import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AdminQueryNoticeToast } from "@/src/features/queries/admin-query-notice-toast";
import { AdminQueriesTable } from "@/src/features/queries/queries-table";
import { getAdminData } from "@/src/features/shared/data";

function MetricCard({ label, value, helper }: { helper: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_10px_24px_rgba(34,34,34,0.04)]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-extrabold tabular-nums text-[var(--foreground)]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[#6a655f]">{helper}</p>
    </div>
  );
}

export default async function QueriesPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string | string[]; notice?: string | string[] }>;
}) {
  const feedback = await searchParams;
  const noticeParam = feedback.notice;
  const notice = Array.isArray(noticeParam) ? noticeParam[0] : noticeParam;
  const errorParam = feedback.error;
  const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  const { profiles, properties, queries } = await getAdminData();
  const ownerNames = new Map(profiles.map((profile) => [profile.id, profile.name || profile.email]));
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const queryRows = queries.map((query) => ({
    ...query,
    owner_name: ownerNames.get(query.owner_id) || "Owner",
    property_name: query.property_id ? propertyNames.get(query.property_id) || "Unknown" : "None",
  }));
  const openQueries = queryRows.filter((query) => !query.resolved);
  const resolvedQueries = queryRows.filter((query) => query.resolved);
  const statementQueries = queryRows.filter((query) => Boolean(query.payout_id));

  return (
    <div className="space-y-6">
      <AdminQueryNoticeToast notice={notice} />

      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="p-5 sm:p-6">
          <Badge tone="brand" className="mb-4">Admin query inbox</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Queries
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5f5b55] sm:text-base">
            Review owner questions, resolve open items, and safely delete stale queries. Statement-linked queries keep their existing payout restoration rules.
          </p>
        </div>
      </section>

      {error ? (
        <div
          className="rounded-lg border border-[var(--brand)]/30 bg-[var(--brand-soft)] px-4 py-3 text-sm font-semibold text-[var(--brand-ink)]"
          role="alert"
        >
          The query action could not be completed safely. Please try again.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          helper="Open items that still need admin review."
          label="Open queries"
          value={String(openQueries.length)}
        />
        <MetricCard
          helper="Resolved owner questions retained for reference."
          label="Resolved"
          value={String(resolvedQueries.length)}
        />
        <MetricCard
          helper="Queries linked to owner payout statements."
          label="Statement related"
          value={String(statementQueries.length)}
        />
      </section>

      <Card className="overflow-hidden border-[var(--border)]">
        <CardHeader
          title="Owner query history"
          subtitle="Owner, property context, statement linkage, status, and actions. Existing pagination and ordering are unchanged."
        />
        <CardBody className="p-0">
          <AdminQueriesTable queries={queryRows} />
        </CardBody>
      </Card>
    </div>
  );
}
