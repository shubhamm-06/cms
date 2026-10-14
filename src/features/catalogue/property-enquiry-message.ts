/** Local calendar dates, shared by the stay card and sticky enquiry bar. */
export function toDateInputValue(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function parseDateInputValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) || toDateInputValue(date) !== value ? null : date;
}

export function addOneDay(value: string) {
  const date = parseDateInputValue(value);
  if (!date) return value;
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
}

export function validateStayDates(checkIn: string, checkOut: string, today = toDateInputValue(new Date())) {
  if (!checkIn || !checkOut) {
    return { field: !checkIn ? "check-in" : "check-out", message: "Select check-in and check-out dates to ask about this stay." } as const;
  }
  if (!parseDateInputValue(checkIn)) return { field: "check-in", message: "Select a valid check-in date." } as const;
  if (!parseDateInputValue(checkOut)) return { field: "check-out", message: "Select a valid check-out date." } as const;
  if (checkIn < today) return { field: "check-in", message: "Check-in cannot be in the past." } as const;
  if (checkOut <= checkIn) return { field: "check-out", message: "Check-out must be after check-in." } as const;
  return null;
}

/** Nights between two valid `YYYY-MM-DD` dates, or null. UTC maths counts correctly across DST. */
export function countNights(checkIn: string, checkOut: string) {
  if (!parseDateInputValue(checkIn) || !parseDateInputValue(checkOut)) return null;
  const nights = Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000);
  return nights > 0 ? nights : null;
}

/** "18 to 21 Oct", or "30 Oct to 2 Nov" across months (and years). Null unless both dates are valid. */
export function formatStayRange(checkIn: string, checkOut: string) {
  const start = parseDateInputValue(checkIn);
  const end = parseDateInputValue(checkOut);
  if (!start || !end) return null;

  const month = (date: Date) => date.toLocaleDateString("en-GB", { month: "short" });
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  return sameMonth ? `${start.getDate()} to ${end.getDate()} ${month(end)}` : `${start.getDate()} ${month(start)} to ${end.getDate()} ${month(end)}`;
}

function formatEnquiryDate(value: string) {
  return parseDateInputValue(value)?.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) ?? value;
}

export function buildStayEnquiryMessage({
  checkIn,
  checkOut,
  guestCount,
  propertyName,
  propertyUrl,
}: {
  checkIn: string;
  checkOut: string;
  guestCount: number;
  propertyName: string;
  propertyUrl: string;
}) {
  if (!parseDateInputValue(checkIn) || !parseDateInputValue(checkOut)) {
    return `Hi, I'd like to ask about ${propertyName}.\n\nProperty: ${propertyUrl}`;
  }
  const nights = countNights(checkIn, checkOut) ?? 0;
  return `Hi, I'd like to ask about ${propertyName}. Check-in: ${formatEnquiryDate(checkIn)}, Check-out: ${formatEnquiryDate(checkOut)} (${nights} ${nights === 1 ? "night" : "nights"}), Guests: ${guestCount}.\n\nProperty: ${propertyUrl}`;
}
