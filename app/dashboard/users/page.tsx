import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getAdminData } from "@/src/features/shared/data";
import { UserNoticeToast } from "@/src/features/users/user-notice-toast";
import { UsersTable } from "@/src/features/users/users-table";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const params = await searchParams;
  const noticeParam = params.notice;
  const notice = Array.isArray(noticeParam) ? noticeParam[0] : noticeParam;
  const { profiles } = await getAdminData(["profiles"]);
  const pendingCount = profiles.filter((profile) => profile.status === "pending").length;
  const activeCount = profiles.filter((profile) => profile.status === "active").length;
  const inactiveCount = profiles.filter((profile) => profile.status === "inactive").length;
  const adminCount = profiles.filter((profile) => profile.role === "admin").length;
  const ownerCount = profiles.filter((profile) => profile.role === "owner").length;
  const summaryCards = [
    { helper: "Waiting for approval", label: "Pending", tone: "amber" as const, value: pendingCount },
    { helper: "Can access dashboards", label: "Active", tone: "green" as const, value: activeCount },
    { helper: "Access disabled", label: "Inactive", tone: "neutral" as const, value: inactiveCount },
    { helper: "Operations access", label: "Admins", tone: "brand" as const, value: adminCount },
    { helper: "Property portal users", label: "Owners", tone: "teal" as const, value: ownerCount },
  ];

  return (
    <>
      <UserNoticeToast notice={notice} />
      <PageHeader
        title="Users"
        subtitle="Approve pending owners, manage account status, and keep admin access protected."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map(({ helper, label, tone, value }) => (
          <Card className="border-[var(--border)] bg-white" key={label}>
            <CardBody className="p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--muted)]">{label}</span>
                <Badge className="whitespace-nowrap" tone={tone}>
                  {value}
                </Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{helper}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-[var(--border)]">
        <CardHeader>
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">All users</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Public signups remain pending until an admin activates them. Protected admin controls stay locked.
            </p>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <UsersTable profiles={profiles} />
        </CardBody>
      </Card>
    </>
  );
}
