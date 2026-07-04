"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Select } from "@/components/ui/select";
import {
  adminBookingColumns,
  ownerBookingColumns,
  type BookingTableRow,
} from "@/src/features/bookings/booking-columns";

type BookingPropertyOption = {
  id: string;
  name: string;
};

function PropertyFilter({
  allLabel,
  label,
  onChange,
  properties,
  value,
}: {
  allLabel: string;
  label: string;
  onChange: (value: string) => void;
  properties: BookingPropertyOption[];
  value: string;
}) {
  return (
    <label className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-[240px]">
      <span className="cms-label">{label}</span>
      <Select onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="all">{allLabel}</option>
        {properties.map((property) => (
          <option key={property.id} value={property.id}>
            {property.name}
          </option>
        ))}
      </Select>
    </label>
  );
}

function OwnerPropertyFilter({
  onChange,
  properties,
  value,
}: {
  onChange: (value: string) => void;
  properties: BookingPropertyOption[];
  value: string;
}) {
  return (
    <label className="flex w-full flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--cream)] px-3 py-2 sm:w-auto sm:min-w-[260px]">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Filter by property</span>
      <Select
        className="cms-input h-10 border-[var(--border)] bg-white text-sm font-semibold text-[var(--foreground)]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="all">All my properties</option>
        {properties.map((property) => (
          <option key={property.id} value={property.id}>
            {property.name}
          </option>
        ))}
      </Select>
    </label>
  );
}

export function AdminBookingsTable({
  bookings,
  properties,
}: {
  bookings: BookingTableRow[];
  properties: BookingPropertyOption[];
}) {
  const [selectedPropertyId, setSelectedPropertyId] = useState("all");
  const filteredBookings = useMemo(
    () =>
      selectedPropertyId === "all"
        ? bookings
        : bookings.filter((booking) => booking.property_id === selectedPropertyId),
    [bookings, selectedPropertyId],
  );

  return (
    <DataTable
      columns={adminBookingColumns}
      data={filteredBookings}
      embedded
      emptyMessage="No bookings found."
      showSearch={false}
      toolbar={
        <PropertyFilter
          allLabel="All properties"
          label="Filter by property"
          onChange={setSelectedPropertyId}
          properties={properties}
          value={selectedPropertyId}
        />
      }
    />
  );
}

export function OwnerBookingsTable({
  bookings,
  properties,
}: {
  bookings: BookingTableRow[];
  properties: BookingPropertyOption[];
}) {
  const [selectedPropertyId, setSelectedPropertyId] = useState("all");
  const showPropertyFilter = properties.length > 1;
  const filteredBookings = useMemo(
    () =>
      !showPropertyFilter || selectedPropertyId === "all"
        ? bookings
        : bookings.filter((booking) => booking.property_id === selectedPropertyId),
    [bookings, selectedPropertyId, showPropertyFilter],
  );

  return (
    <DataTable
      columns={ownerBookingColumns}
      data={filteredBookings}
      embedded
      emptyMessage="No bookings are available yet. Confirmed stays for your assigned property will appear here."
      showSearch={false}
      toolbar={
        showPropertyFilter ? (
          <OwnerPropertyFilter
            onChange={setSelectedPropertyId}
            properties={properties}
            value={selectedPropertyId}
          />
        ) : null
      }
    />
  );
}
