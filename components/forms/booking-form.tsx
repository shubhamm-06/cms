"use client";

import { CalendarDays, IndianRupee, Save, Users } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveBookingAction } from "@/src/features/shared/actions";
import {
  calculateNightlyRate,
  calculateNights,
  calculateTotalAmount,
  getBookingStatus,
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

function formatStatusLabel(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type BookingStatusTone = "neutral" | "green" | "teal" | "destructive";

function statusTone(status: string): BookingStatusTone {
  if (status === "in_house") return "green";
  if (status === "upcoming") return "teal";
  if (status === "cancelled" || status === "blocked") return "destructive";
  return "neutral";
}

function SaveBookingButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={disabled || pending} pending={pending} type="submit" variant="primary">
      {pending ? null : <Save className="h-4 w-4" />}
      {pending ? "Saving..." : "Save booking"}
    </Button>
  );
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
  const statusPreview = getBookingStatus(checkIn, checkOut);

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
    <form action={saveBookingAction} className="grid gap-5">
      <input name="id" type="hidden" value={booking?.id || ""} />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--brand)]" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Guest and property</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-7">
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
            </div>
            <div className="md:col-span-5">
              <Field label="Guest name">
                <Input defaultValue={booking?.guest_name || ""} name="guest_name" required />
              </Field>
            </div>
            <div className="md:col-span-6">
              <Field label="Guest phone">
                <Input defaultValue={booking?.guest_phone || ""} name="guest_phone" />
              </Field>
            </div>
            <div className="md:col-span-6">
              <Field label="Source">
                <Select defaultValue={booking?.source || ""} name="source">
                  <option value="">{sourceOptions.length ? "Select source" : "No booking sources configured"}</option>
                  {sourceOptions.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="md:col-span-8">
              <Field label="Concierge">
                <Select defaultValue={existingConcierge} name="concierge">
                  <option value="">
                    {availableConciergeOptions.length ? "Select concierge option" : "No concierge options configured"}
                  </option>
                  {availableConciergeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="md:col-span-4">
              <span className="cms-label">Calculated status</span>
              <div className="flex min-h-10 items-center rounded-md border border-[var(--border)] bg-white px-3">
                <Badge className="whitespace-nowrap" tone={statusTone(statusPreview)}>
                  {formatStatusLabel(statusPreview)}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[var(--brand)]" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Stay and revenue</h3>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Check-in">
                <Input
                  name="check_in"
                  onChange={(event) => handleCheckInChange(event.target.value)}
                  required
                  type="date"
                  value={checkIn}
                />
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nights">
                <Input min="0" name="nights" onChange={(event) => handleNightsChange(event.target.value)} type="number" value={nights} />
              </Field>
              <Field label="Guests">
                <Input defaultValue={booking?.guests || 1} min="0" name="guests" type="number" />
              </Field>
            </div>

            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--muted)]">
                <IndianRupee className="h-3.5 w-3.5 text-[var(--brand)]" />
                Amount helpers
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
            </div>
          </div>
        </section>
      </div>

      <Field label="Notes">
        <Textarea defaultValue={booking?.notes || ""} name="notes" placeholder="Internal notes for this booking" />
      </Field>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-[var(--muted)]">
          Dates, nights, nightly rate, and total amount can auto-fill each other, but each value stays manually editable.
        </p>
        <SaveBookingButton disabled={Boolean(dateError)} />
      </div>
    </form>
  );
}
