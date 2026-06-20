"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { saveBookingAction } from "@/src/features/shared/actions";
import {
  calculateNightlyRate,
  calculateNights,
  calculateTotalAmount,
  getBookingStatus,
  type BookingStatus,
} from "@/src/features/bookings/booking-calculations";
import type { Database } from "@/types/database.types";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type Property = Database["public"]["Tables"]["properties"]["Row"];
type AmountField = "nightly_rate" | "total_amount";
type StatusOverride = "auto" | "cancelled" | "blocked";

const statusLabels: Record<BookingStatus, string> = {
  blocked: "Blocked",
  cancelled: "Cancelled",
  checked_out: "Checked Out",
  in_house: "In House",
  upcoming: "Upcoming",
};

function toInputValue(value: number | null | undefined, fallback = 0) {
  return String(value ?? fallback);
}

function toNumber(value: string) {
  if (value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function isCheckOutBeforeCheckIn(checkIn: string, checkOut: string) {
  return Boolean(checkIn && checkOut && checkOut < checkIn);
}

export function BookingForm({ properties, booking }: { properties: Property[]; booking?: Booking }) {
  const [checkIn, setCheckIn] = useState(booking?.check_in || "");
  const [checkOut, setCheckOut] = useState(booking?.check_out || "");
  const [nights, setNights] = useState(toInputValue(booking?.nights));
  const [nightlyRate, setNightlyRate] = useState(toInputValue(booking?.nightly_rate));
  const [totalAmount, setTotalAmount] = useState(toInputValue(booking?.total_amount));
  const [lastAmountEdited, setLastAmountEdited] = useState<AmountField | null>(null);
  const [statusOverride, setStatusOverride] = useState<StatusOverride>(
    booking?.status === "cancelled" || booking?.status === "blocked" ? booking.status : "auto",
  );

  const dateError = isCheckOutBeforeCheckIn(checkIn, checkOut) ? "Check-out cannot be before check-in." : "";
  const status = getBookingStatus(checkIn, checkOut, statusOverride === "auto" ? null : statusOverride);
  const statusHint = statusOverride === "auto" ? "auto calculated" : "admin override";

  function recalculateAmounts(
    nextNightsValue: string,
    preferredField: AmountField | null = lastAmountEdited,
    values = { nightlyRate, totalAmount },
  ) {
    const nextNights = toNumber(nextNightsValue);
    if (nextNights === null || nextNights < 0) return;

    const rate = toNumber(values.nightlyRate);
    const total = toNumber(values.totalAmount);

    if (preferredField === "total_amount" && total !== null && nextNights > 0) {
      setNightlyRate(formatNumber(calculateNightlyRate(total, nextNights)));
      return;
    }

    if (rate !== null) {
      setTotalAmount(formatNumber(calculateTotalAmount(nextNights, rate)));
      return;
    }

    if (total !== null && nextNights > 0) {
      setNightlyRate(formatNumber(calculateNightlyRate(total, nextNights)));
    }
  }

  function updateDates(nextCheckIn: string, nextCheckOut: string) {
    const calculatedNights = calculateNights(nextCheckIn, nextCheckOut);
    if (calculatedNights === null) return;

    const nextNightsValue = String(calculatedNights);
    setNights(nextNightsValue);
    recalculateAmounts(nextNightsValue);
  }

  function handleCheckInChange(value: string) {
    setCheckIn(value);
    updateDates(value, checkOut);
  }

  function handleCheckOutChange(value: string) {
    setCheckOut(value);
    updateDates(checkIn, value);
  }

  function handleNightsChange(value: string) {
    setNights(value);
    recalculateAmounts(value);
  }

  function handleNightlyRateChange(value: string) {
    setNightlyRate(value);
    setLastAmountEdited("nightly_rate");

    recalculateAmounts(nights, "nightly_rate", { nightlyRate: value, totalAmount });
  }

  function handleTotalAmountChange(value: string) {
    setTotalAmount(value);
    setLastAmountEdited("total_amount");

    recalculateAmounts(nights, "total_amount", { nightlyRate, totalAmount: value });
  }

  return (
    <form action={saveBookingAction} className="grid gap-3 md:grid-cols-4">
      <input name="id" type="hidden" value={booking?.id || ""} />
      <Field label="Property">
        <Select defaultValue={booking?.property_id || ""} name="property_id" required>
          <option value="">Select</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Guest">
        <Input defaultValue={booking?.guest_name || ""} name="guest_name" required />
      </Field>
      <Field label="Guest phone">
        <Input defaultValue={booking?.guest_phone || ""} name="guest_phone" />
      </Field>
      <Field label="Source">
        <Input defaultValue={booking?.source || ""} name="source" />
      </Field>
      <Field label="Check-in">
        <Input name="check_in" onChange={(event) => handleCheckInChange(event.target.value)} required type="date" value={checkIn} />
      </Field>
      <Field label="Check-out">
        <Input
          aria-invalid={Boolean(dateError)}
          name="check_out"
          onChange={(event) => handleCheckOutChange(event.target.value)}
          required
          type="date"
          value={checkOut}
        />
        {dateError ? <span className="mt-1 block text-xs font-semibold text-[var(--brand)]">{dateError}</span> : null}
      </Field>
      <Field label="Nights">
        <Input min="0" name="nights" onChange={(event) => handleNightsChange(event.target.value)} type="number" value={nights} />
      </Field>
      <Field label="Guests">
        <Input defaultValue={booking?.guests || 1} min="0" name="guests" type="number" />
      </Field>
      <Field label="Nightly rate">
        <Input
          min="0"
          name="nightly_rate"
          onChange={(event) => handleNightlyRateChange(event.target.value)}
          step="0.01"
          type="number"
          value={nightlyRate}
        />
      </Field>
      <Field label="Total amount">
        <Input
          min="0"
          name="total_amount"
          onChange={(event) => handleTotalAmountChange(event.target.value)}
          required
          step="0.01"
          type="number"
          value={totalAmount}
        />
      </Field>
      <Field label="Calculated status">
        <input name="status" type="hidden" value={status} />
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[var(--foreground)]">{statusLabels[status]}</span>
            <span className="text-xs font-semibold text-[var(--muted)]">{statusHint}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["auto", "Auto"],
              ["cancelled", "Cancelled"],
              ["blocked", "Blocked"],
            ].map(([value, label]) => (
              <button
                className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                  statusOverride === value
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                    : "border-[var(--border)] bg-white text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
                key={value}
                onClick={() => setStatusOverride(value as StatusOverride)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Field>
      <Field label="Concierge">
        <Input defaultValue={booking?.concierge?.join(", ") || ""} name="concierge" placeholder="Comma separated" />
      </Field>
      <Field label="Notes">
        <Input defaultValue={booking?.notes || ""} name="notes" />
      </Field>
      <div className="self-end md:col-span-2">
        <Button disabled={Boolean(dateError)} type="submit" variant="primary">
          <Save className="h-4 w-4" />
          Save booking
        </Button>
      </div>
    </form>
  );
}
