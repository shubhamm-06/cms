import Link from "next/link";
import { BookingForm } from "@/components/forms/booking-form";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { BookingImportDialog } from "@/src/features/bookings/booking-import-dialog";
import { BookingNoticeToast } from "@/src/features/bookings/booking-notice-toast";
import { AdminBookingsTable } from "@/src/features/bookings/bookings-table";
import { getAdminData } from "@/src/features/shared/data";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[]; notice?: string | string[] }>;
}) {
  const params = await searchParams;
  const editParam = params.edit;
  const noticeParam = params.notice;
  const editId = Array.isArray(editParam) ? editParam[0] : editParam;
  const notice = Array.isArray(noticeParam) ? noticeParam[0] : noticeParam;
  const { bookings, properties, settings } = await getAdminData();
  const bookingToEdit = editId ? bookings.find((booking) => booking.id === editId) : undefined;
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const activeProperties = properties
    .filter((property) => property.status === "active")
    .map((property) => ({ id: property.id, name: property.name }));
  const importBookings = bookings.map((booking) => ({
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    guestName: booking.guest_name,
    guestPhone: booking.guest_phone,
    propertyName: propertyNames.get(booking.property_id) || "Unknown",
  }));
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
      <BookingNoticeToast notice={notice} />
      <PageHeader
        title="Bookings"
        subtitle="Create stays, review revenue inputs, and keep owner-visible booking records tidy."
      />

      <Card className="mb-6 overflow-hidden border-[var(--border)]">
        <CardHeader
          action={
            <div className="flex flex-wrap justify-end gap-2">
              {bookingToEdit ? (
                <Link className="cms-btn bg-white text-[var(--foreground)] hover:bg-[var(--surface-2)]" href="/dashboard/bookings">
                  New booking
                </Link>
              ) : null}
              <BookingImportDialog
                bookings={importBookings}
                properties={properties.map((property) => ({ name: property.name }))}
                settings={{
                  bookingSources: settingsOptions("booking_sources"),
                  conciergeOptions: settingsOptions("concierge_options"),
                }}
              />
            </div>
          }
        >
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-[var(--foreground)]">
                {bookingToEdit ? "Edit booking" : "Add booking"}
              </h2>
              {bookingToEdit ? <Badge tone="brand">Editing</Badge> : <Badge tone="neutral">Admin only</Badge>}
            </div>
            <p className="max-w-3xl text-sm leading-6 text-[var(--muted)]">
              {bookingToEdit
                ? `Update ${bookingToEdit.guest_name}'s stay details. Date, night, rate, and amount helpers remain editable conveniences.`
                : "Add a confirmed stay with the guest details, dates, source, concierge support, and revenue fields owners will see."}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <BookingForm
            booking={bookingToEdit}
            bookingSources={settingsOptions("booking_sources")}
            conciergeOptions={settingsOptions("concierge_options")}
            properties={properties}
          />
        </CardBody>
      </Card>

      <Card className="overflow-hidden border-[var(--border)]">
        <CardHeader>
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Booking list</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Filter by property and use the row actions to edit or safely delete a booking.
            </p>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <AdminBookingsTable bookings={bookingRows} properties={activeProperties} />
        </CardBody>
      </Card>
    </>
  );
}
