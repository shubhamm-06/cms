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
} from "@/src/features/bookings/booking-calculations";
import type { Database } from "@/types/database.types";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type Property = Database["public"]["Tables"]["properties"]["Row"];
type AmountField = "nightly_rate" | "total_amount";

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

export function BookingForm({
  bookingSources,
  conciergeOptions,
  properties,
  booking,
}: {
  bookingSources: string[];
  conciergeOptions: string[];
  properties: Property[];
  booking?: Booking;
}) {
  const [checkIn, setCheckIn] = useState(booking?.check_in || "");
  const [checkOut, setCheckOut] = useState(booking?.check_out || "");
  const [nights, setNights] = useState(toInputValue(booking?.nights));
  const [nightlyRate, setNightlyRate] = useState(toInputValue(booking?.nightly_rate));
  const [totalAmount, setTotalAmount] = useState(toInputValue(booking?.total_amount));
  const [lastAmountEdited, setLastAmountEdited] = useState<AmountField | null>(null);
  const dateError = isCheckOutBeforeCheckIn(checkIn, checkOut) ? "Check-out cannot be before check-in." : "";
  const sourceOptions = booking?.source && !bookingSources.includes(booking.source)
    ? [booking.source, ...bookingSources]
    : bookingSources;
  const existingConcierge = booking?.concierge?.join(", ") || "";
  const availableConciergeOptions = existingConcierge && !conciergeOptions.includes(existingConcierge)
    ? [existingConcierge, ...conciergeOptions]
    : conciergeOptions;

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
        <Select defaultValue={booking?.source || ""} name="source">
          <option value="">{sourceOptions.length ? "Select source" : "No booking sources configured"}</option>
          {sourceOptions.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </Select>
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
      <Field label="Concierge">
        <Select defaultValue={existingConcierge} name="concierge">
          <option value="">{availableConciergeOptions.length ? "Select concierge option" : "No concierge options configured"}</option>
          {availableConciergeOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </Select>
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
