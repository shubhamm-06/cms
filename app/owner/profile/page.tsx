import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { requireRole } from "@/src/features/auth/auth-guards";
import { OwnerProfileForm } from "@/src/features/profile/owner-profile-form";
import { OwnerProfileNoticeToast } from "@/src/features/profile/owner-profile-notice-toast";

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function OwnerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const params = await searchParams;
  const noticeParam = params.notice;
  const notice = Array.isArray(noticeParam) ? noticeParam[0] : noticeParam;
  const profile = await requireRole("owner");

  return (
    <div className="space-y-6">
      <OwnerProfileNoticeToast notice={notice} />

      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <Badge tone="brand" className="mb-4">Self-service profile</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Profile
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f5b55] sm:text-base">
              Keep your personal contact details current for owner communication, payout follow-up, and property updates.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-[0_10px_24px_rgba(34,34,34,0.04)]">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Account status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="teal">{titleCase(profile.role)}</Badge>
              <Badge tone={profile.status === "active" ? "green" : "amber"}>{titleCase(profile.status)}</Badge>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#6a655f]">Role and status are managed by CurateMyStay and cannot be edited here.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.9fr)_minmax(260px,0.55fr)]">
        <Card className="overflow-hidden border-[var(--border)]">
          <CardHeader
            subtitle="Update your display name, phone number, and optional avatar URL. These changes apply only to your own owner profile."
            title="Personal contact details"
          />
          <CardBody>
            <OwnerProfileForm profile={profile} />
          </CardBody>
        </Card>

        <Card className="overflow-hidden border-[var(--border)]">
          <CardHeader
            subtitle="For security, account identity fields are visible here but not editable."
            title="Account information"
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
            </dl>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
