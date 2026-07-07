import { ProfileForm } from "@/components/forms/admin-forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { requireRole } from "@/src/features/auth/auth-guards";
import { AdminProfileNoticeToast } from "@/src/features/profile/admin-profile-notice-toast";

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function AdminProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const params = await searchParams;
  const noticeParam = params.notice;
  const notice = Array.isArray(noticeParam) ? noticeParam[0] : noticeParam;
  const profile = await requireRole("admin");

  return (
    <div className="space-y-6">
      <AdminProfileNoticeToast notice={notice} />

      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_300px] lg:items-end">
          <div>
            <Badge tone="brand" className="mb-4">Admin self-profile</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Profile
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f5b55] sm:text-base">
              Keep your own admin contact details current. Account identity, role, and status remain read-only here.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-[0_10px_24px_rgba(34,34,34,0.04)]">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Account status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="teal">{titleCase(profile.role)}</Badge>
              <Badge tone={profile.status === "active" ? "green" : "amber"}>{titleCase(profile.status)}</Badge>
              {profile.is_protected ? <Badge tone="brand">Protected</Badge> : null}
            </div>
            <p className="mt-3 text-xs leading-5 text-[#6a655f]">Role, status, and protected-account safeguards are not editable on this page.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.9fr)_minmax(260px,0.55fr)]">
        <Card className="overflow-hidden border-[var(--border)]">
          <CardHeader
            subtitle="Update your display name, phone number, and optional avatar URL. These changes apply only to your signed-in admin profile."
            title="Editable personal details"
          />
          <CardBody>
            <ProfileForm profile={profile} />
          </CardBody>
        </Card>

        <Card className="overflow-hidden border-[var(--border)]">
          <CardHeader
            subtitle="Visible for account clarity. These fields are intentionally read-only here."
            title="Read-only account details"
          />
          <CardBody>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Email</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-[var(--foreground)]">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Role</dt>
                <dd className="mt-1">
                  <Badge tone="teal">{titleCase(profile.role)}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Status</dt>
                <dd className="mt-1">
                  <Badge tone={profile.status === "active" ? "green" : "amber"}>{titleCase(profile.status)}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Protection</dt>
                <dd className="mt-1">
                  <Badge tone={profile.is_protected ? "brand" : "neutral"}>
                    {profile.is_protected ? "Protected admin" : "Standard admin"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
