const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type BookingStatus = "upcoming" | "in_house" | "checked_out" | "cancelled" | "blocked";
export type BookingStatusOverride = Extract<BookingStatus, "cancelled" | "blocked"> | null | undefined;

function dateToUtcTime(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return Date.UTC(year, month - 1, day);
}

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function todayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calculateNights(checkIn: string, checkOut: string): number | null {
  if (!checkIn || !checkOut) return null;

  const checkInTime = dateToUtcTime(checkIn);
  const checkOutTime = dateToUtcTime(checkOut);
  if (checkInTime === null || checkOutTime === null || checkOutTime < checkInTime) return null;

  return Math.round((checkOutTime - checkInTime) / DAY_IN_MS);
}

export function calculateTotalAmount(nights: number, nightlyRate: number): number {
  return roundToTwo(nights * nightlyRate);
}

export function calculateNightlyRate(totalAmount: number, nights: number): number {
  if (nights <= 0) return 0;
  return roundToTwo(totalAmount / nights);
}

export function getBookingStatus(
  checkIn: string,
  checkOut: string,
  override?: BookingStatusOverride,
  today = todayDateString(),
): BookingStatus {
  if (override === "cancelled" || override === "blocked") return override;
  if (!checkIn || !checkOut || checkOut < checkIn) return "upcoming";
  if (today < checkIn) return "upcoming";
  if (today >= checkOut) return "checked_out";
  return "in_house";
}
