import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { OwnerBookingsTable } from "@/src/features/bookings/bookings-table";
import { getOwnerData } from "@/src/features/shared/data";

export default async function OwnerBookingsPage() {
  const { bookings, properties } = await getOwnerData();
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const propertyOptions = properties.map((property) => ({ id: property.id, name: property.name }));
  const bookingRows = bookings.map((booking) => ({
    ...booking,
    property_name: propertyNames.get(booking.property_id) || "Unknown",
  }));

  return (
    <>
      <PageHeader title="Bookings" subtitle="Read-only bookings for your property, including guest names and phone numbers." />
      <Card>
        <CardHeader title="My bookings" />
        <CardBody className="p-0">
          <OwnerBookingsTable bookings={bookingRows} properties={propertyOptions} />
        </CardBody>
      </Card>
    </>
  );
}
