export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function currentMonthLabel() {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function toDateOnly(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function getPreviousMonthKey(date = new Date()) {
  const previous = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthRange(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return {
    start: toDateOnly(start),
    end: toDateOnly(end),
  };
}

export function isPayoutReviewWindow(date = new Date()) {
  const day = date.getDate();
  return day >= 1 && day <= 5;
}

export function isAfterPayoutReviewWindow(date = new Date()) {
  return date.getDate() > 5;
}

export function countStayNightsInMonth({
  checkIn,
  checkOut,
  monthKey,
}: {
  checkIn: string;
  checkOut: string;
  monthKey: string;
}) {
  const { start, end } = getMonthRange(monthKey);
  const stayStart = parseDateOnly(checkIn);
  const stayEnd = parseDateOnly(checkOut);
  const monthStart = parseDateOnly(start);
  const monthEnd = parseDateOnly(end);
  const countedStart = new Date(Math.max(stayStart.getTime(), monthStart.getTime()));
  const countedEnd = new Date(Math.min(stayEnd.getTime(), monthEnd.getTime()));
  const diff = countedEnd.getTime() - countedStart.getTime();

  if (diff <= 0) return 0;
  return Math.round(diff / 86_400_000);
}
