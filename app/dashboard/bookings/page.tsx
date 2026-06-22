import Link from "next/link";
import { BookingForm } from "@/components/forms/booking-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AdminBookingsTable } from "@/src/features/bookings/bookings-table";
import { getAdminData } from "@/src/features/shared/data";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  const editParam = (await searchParams).edit;
  const editId = Array.isArray(editParam) ? editParam[0] : editParam;
  const { bookings, properties, settings } = await getAdminData();
  const bookingToEdit = editId ? bookings.find((booking) => booking.id === editId) : undefined;
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const activeProperties = properties
    .filter((property) => property.status === "active")
    .map((property) => ({ id: property.id, name: property.name }));
  const bookingRows = bookings.map((booking) => ({
    ...booking,
    property_name: propertyNames.get(booking.property_id) || "Unknown",
  }));
  const settingsOptions = (key: string) => {
    const value = settings.find((setting) => setting.key === key)?.value;
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      : [];
  };

  return (
    <>
      <PageHeader title="Bookings" subtitle="Admin can add, edit, and delete booking records. Owners receive read-only access." />
      <Card className="mb-5">
        <CardHeader
          action={
            bookingToEdit ? (
              <Link className="cms-btn bg-white hover:bg-[var(--surface-2)]" href="/dashboard/bookings">
                New booking
              </Link>
            ) : null
          }
          subtitle={bookingToEdit ? `Editing ${bookingToEdit.guest_name}` : undefined}
          title={bookingToEdit ? "Edit booking" : "Add booking"}
        />
        <CardBody>
          <BookingForm
            booking={bookingToEdit}
            bookingSources={settingsOptions("booking_sources")}
            conciergeOptions={settingsOptions("concierge_options")}
            properties={properties}
          />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Booking list" />
        <CardBody className="p-0">
          <AdminBookingsTable bookings={bookingRows} properties={activeProperties} />
        </CardBody>
      </Card>
    </>
  );
}
