import { SettingsForm } from "@/components/forms/admin-forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SettingsNoticeToast } from "@/src/features/settings/settings-notice-toast";
import { getAdminData } from "@/src/features/shared/data";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[]; notice?: string | string[] }>;
}) {
  const params = await searchParams;
  const noticeParam = params.notice;
  const notice = Array.isArray(noticeParam) ? noticeParam[0] : noticeParam;
  const errorParam = params.error;
  const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  const { settings } = await getAdminData();

  return (
    <div className="space-y-6">
      <SettingsNoticeToast notice={notice} />

      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="p-5 sm:p-6">
          <Badge tone="brand" className="mb-4">Admin settings</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Settings
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5f5b55] sm:text-base">
            Maintain dropdown options used by booking and expense forms. Each option is stored as one line in the existing settings table.
          </p>
        </div>
      </section>

      {error ? (
        <div
          className="rounded-lg border border-[var(--brand)]/30 bg-[var(--brand-soft)] px-4 py-3 text-sm font-semibold text-[var(--brand-ink)]"
          role="alert"
        >
          Settings could not be saved. Please review the values and try again.
        </div>
      ) : null}

      <Card className="overflow-hidden border-[var(--border)]">
        <CardHeader
          title="Dropdown option lists"
          subtitle="Booking Sources, Expense Categories, and Concierge Options feed the existing operational forms."
        />
        <CardBody>
          <SettingsForm settings={settings} />
        </CardBody>
      </Card>
    </div>
  );
}
