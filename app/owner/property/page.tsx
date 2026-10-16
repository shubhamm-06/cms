import { BedDouble, Building2, Home, MapPin, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { getOwnerData } from "@/src/features/shared/data";

function propertyInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusTone(status: string | null): "green" | "neutral" {
  return status === "active" ? "green" : "neutral";
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2.5 text-[var(--brand-ink)]">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">{label}</div>
          <div className="mt-1 text-sm font-bold text-[var(--foreground)]">{value || "Not provided"}</div>
        </div>
      </div>
    </div>
  );
}

function ShareCard({
  description,
  label,
  value,
}: {
  description: string;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">{label}</div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--foreground)]">{value}%</div>
      <p className="mt-2 text-sm leading-6 text-[#5f5b55]">{description}</p>
    </div>
  );
}

export default async function OwnerPropertyPage() {
  const { properties } = await getOwnerData([]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-[0_18px_55px_rgba(22,24,29,0.06)] sm:p-6">
        <Badge className="mb-4 whitespace-nowrap" tone="brand">
          Read-only property details
        </Badge>
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">
              My property
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5f5b55]">
              Reference details for the property information assigned to your owner account.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--cream)] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">Owner access</div>
            <p className="mt-2 text-sm leading-6 text-[#5f5b55]">
              This page is view-only. Contact the CurateMyStay team if any property detail needs to be corrected.
            </p>
          </div>
        </div>
      </section>

      {properties.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-[var(--border)] bg-white p-8 text-center shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--cream)] text-[var(--brand-ink)]">
            <Home className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--foreground)]">No property assigned yet</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#5f5b55]">
            Your property details will appear here once the CurateMyStay team assigns a property to your owner account.
          </p>
        </section>
      ) : (
        <div className="space-y-5">
          {properties.map((property) => (
            <section
              className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-[0_18px_55px_rgba(22,24,29,0.05)]"
              key={property.id}
            >
              <div className="grid gap-5 border-b border-[var(--border)] p-5 sm:p-6 lg:grid-cols-[1fr_0.36fr]">
                <div className="flex min-w-0 gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--brand)] text-base font-extrabold text-white">
                    {propertyInitials(property.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-2xl font-extrabold tracking-tight text-[var(--foreground)]">{property.name}</h2>
                      <Badge className="whitespace-nowrap capitalize" tone={statusTone(property.status)}>
                        {property.status || "unknown"}
                      </Badge>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5b55]">
                      {property.address || "Address not provided"}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--cream)] p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">Management split</div>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">{property.owner_share}%</span>
                    <span className="pb-1 text-sm font-semibold text-[#5f5b55]">owner share</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
                <DetailItem icon={<MapPin className="h-5 w-5" />} label="City" value={property.city || "Not provided"} />
                <DetailItem
                  icon={<BedDouble className="h-5 w-5" />}
                  label="Bedrooms"
                  value={property.bedrooms ? `${property.bedrooms} BHK` : "Not provided"}
                />
                <DetailItem icon={<Building2 className="h-5 w-5" />} label="Status" value={<span className="capitalize">{property.status}</span>} />
                <DetailItem icon={<ShieldCheck className="h-5 w-5" />} label="Access" value="Owner read-only" />
              </div>

              <div className="grid gap-4 border-t border-[var(--border)] bg-[var(--surface-2)]/35 p-5 sm:grid-cols-2 sm:p-6">
                <ShareCard
                  description="Your agreed share of positive property performance."
                  label="Owner share"
                  value={property.owner_share}
                />
                <ShareCard
                  description="CurateMyStay management share for this property."
                  label="CMS management"
                  value={property.cms_share}
                />
              </div>

              <div className="border-t border-[var(--border)] p-5 sm:p-6">
                <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">Full address</div>
                <p className="mt-2 text-sm leading-6 text-[#5f5b55]">{property.address || "No address has been added yet."}</p>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
