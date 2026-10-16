import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { OwnerBookingsTable } from "@/src/features/bookings/bookings-table";
import { getOwnerData } from "@/src/features/shared/data";

export default async function OwnerBookingsPage() {
  const { bookings, properties } = await getOwnerData(["bookings"]);
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const propertyOptions = properties.map((property) => ({ id: property.id, name: property.name }));
  const bookingRows = bookings.map((booking) => ({
    ...booking,
    property_name: propertyNames.get(booking.property_id) || "Unknown",
  }));
  const bookingCountLabel = `${bookingRows.length} ${bookingRows.length === 1 ? "booking" : "bookings"}`;
  const propertyScopeLabel =
    properties.length === 1
      ? `Showing bookings for ${properties[0]?.name ?? "your assigned property"}`
      : `${properties.length} assigned ${properties.length === 1 ? "property" : "properties"}`;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <Badge tone="brand" className="mb-4">Read-only booking history</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Bookings
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f5b55] sm:text-base">
              Review guest stays, booking dates, property context, and booking amounts for your assigned property data.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-[0_10px_24px_rgba(34,34,34,0.04)]">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Owner access</p>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{propertyScopeLabel}</p>
            <p className="mt-1 text-xs leading-5 text-[#6a655f]">
              Guest names and phone numbers remain visible for your bookings only.
            </p>
          </div>
        </div>
      </section>

      <Card className="overflow-hidden">
        <CardHeader
          action={<Badge tone="neutral" className="whitespace-nowrap">{bookingCountLabel}</Badge>}
          subtitle="Your booking records are read-only. Use the property filter only when more than one assigned property is available."
          title="Booking history"
        />
        <CardBody className="p-0">
          <OwnerBookingsTable bookings={bookingRows} properties={propertyOptions} />
        </CardBody>
      </Card>
    </div>
  );
}
