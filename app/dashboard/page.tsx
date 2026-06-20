import Link from "next/link";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBookingStatus } from "@/src/features/bookings/booking-calculations";
import { PropertyPerformanceTable } from "@/src/features/dashboard/performance-table";
import { getAdminData } from "@/src/features/shared/data";
import { formatDate } from "@/src/lib/utils/dates";
import { formatMoney } from "@/src/lib/utils/money";

function shortMoney(value: number | null | undefined) {
  const amount = Number(value) || 0;
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `Rs ${(amount / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `Rs ${(amount / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `Rs ${(amount / 1000).toFixed(1)}k`;
  return formatMoney(amount);
}

const accents = ["#E5484D", "#F4A258", "#3D8CA8", "#2F8F4E", "#9B59B6"];

function Kpi({
  delta,
  label,
  sub,
  tone = "neutral",
  value,
}: {
  delta?: string;
  label: string;
  sub?: string;
  tone?: "up" | "down" | "neutral";
  value: string | number;
}) {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-white px-4 py-4">
      <div className="text-xs font-semibold text-[var(--muted)]">{label}</div>
      <div className="mt-1.5 text-2xl font-bold tracking-tight">{value}</div>
      {delta || sub ? (
        <div
          className={`mt-1 inline-flex items-center gap-1 text-xs font-bold ${
            tone === "up" ? "text-[var(--green)]" : tone === "down" ? "text-[var(--brand)]" : "text-[var(--muted)]"
          }`}
        >
          {tone === "up" ? <ArrowUp className="h-3 w-3" /> : null}
          {tone === "down" ? <ArrowDown className="h-3 w-3" /> : null}
          {delta || sub}
        </div>
      ) : null}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const { bookings, expenses, profiles, properties } = await getAdminData();
  const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.total_amount), 0);
  const totalExpense = expenses
    .filter((expense) => expense.expense_for === "property")
    .reduce((sum, expense) => sum + Number(expense.amount), 0);
  const statusFor = (booking: (typeof bookings)[number]) =>
    getBookingStatus(booking.check_in, booking.check_out, booking.status === "cancelled" || booking.status === "blocked" ? booking.status : null);
  const inHouse = bookings.filter((booking) => statusFor(booking) === "in_house").length;
  const upcoming = bookings.filter((booking) => statusFor(booking) === "upcoming").length;
  const ownerNames = new Map(profiles.map((profile) => [profile.id, profile.name || profile.email]));

  const propertyPerformance = properties
    .map((property, index) => {
      const propertyBookings = bookings.filter((booking) => booking.property_id === property.id);
      const revenue = propertyBookings.reduce((sum, booking) => sum + Number(booking.total_amount), 0);
      const expense = expenses
        .filter((item) => item.property_id === property.id)
        .reduce((sum, item) => sum + Number(item.amount), 0);
      const nightsBooked = propertyBookings.reduce((sum, booking) => sum + Number(booking.nights || 0), 0);
      const occupancy = Math.min(100, Math.round((nightsBooked / 31) * 100));
      const initials = property.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return {
        accent: accents[index % accents.length],
        bedrooms: property.bedrooms,
        city: property.city,
        expense,
        id: property.id,
        initials,
        name: property.name,
        occupancy,
        owner_name: property.owner_id ? ownerNames.get(property.owner_id) || "Unassigned" : "Unassigned",
        profit: revenue - expense,
        revenue,
      };
    })
    .sort((a, b) => b.profit - a.profit);

  const upcomingCheckins = bookings
    .filter((booking) => statusFor(booking) === "upcoming")
    .sort((a, b) => a.check_in.localeCompare(b.check_in))
    .slice(0, 5);
  const propertyName = (id: string) => properties.find((property) => property.id === id)?.name || "Unknown property";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Operations</h1>
          <p className="mt-1 max-w-3xl text-[13.5px] text-[var(--muted)]">
            Live view across all {properties.length} properties. Revenue, costs, and occupancy flow from bookings and expenses.
          </p>
        </div>
        <Button variant="primary">
          <Link className="inline-flex items-center gap-2" href="/dashboard/bookings">
            <Plus className="h-4 w-4" />
            Log booking
          </Link>
        </Button>
      </div>

      <div className="mb-3.5 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi delta={`${bookings.length} bookings`} label="Revenue this month" tone="up" value={shortMoney(totalRevenue)} />
        <Kpi delta={`${expenses.length} entries`} label="Operating expense" tone="down" value={shortMoney(totalExpense)} />
        <Kpi label="Net profit" tone="up" value={shortMoney(totalRevenue - totalExpense)} />
        <Kpi label="In-house / Upcoming" sub="guests right now" value={`${inHouse} / ${upcoming}`} />
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <section className="col-span-12 rounded-[14px] border border-[var(--border)] bg-white lg:col-span-7">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div>
              <h2 className="text-[13.5px] font-bold">Property performance</h2>
              <div className="mt-0.5 text-xs text-[var(--muted)]">Profit-ranked, this month</div>
            </div>
          </div>
          <PropertyPerformanceTable rows={propertyPerformance} />
        </section>

        <section className="col-span-12 rounded-[14px] border border-[var(--border)] bg-white lg:col-span-5">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <h2 className="text-[13.5px] font-bold">Upcoming check-ins</h2>
            <Link className="text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)]" href="/dashboard/bookings">
              Bookings
            </Link>
          </div>
          <div className="px-5 pb-1">
            {upcomingCheckins.length === 0 ? (
              <div className="py-9 text-center text-sm text-[var(--muted)]">No upcoming bookings</div>
            ) : (
              upcomingCheckins.map((booking) => {
                const checkInDate = new Date(booking.check_in);
                return (
                  <div className="flex items-center gap-3 border-t border-[var(--border)] py-3" key={booking.id}>
                    <div className="min-w-[42px] text-center">
                      <div className="text-lg font-bold leading-none text-[var(--brand)]">{checkInDate.getDate()}</div>
                      <div className="text-[10.5px] font-bold uppercase text-[var(--muted)]">
                        {checkInDate.toLocaleDateString("en", { month: "short" })}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-semibold">{booking.guest_name}</div>
                      <div className="truncate text-xs text-[var(--muted)]">
                        {propertyName(booking.property_id)} - {booking.nights || 0}n - {booking.guests || 0} guests
                      </div>
                    </div>
                    <Badge tone="teal">{booking.source || "Direct"}</Badge>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="col-span-12 rounded-[14px] border border-[var(--border)] bg-white">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div>
              <h2 className="text-[13.5px] font-bold">Recent operational activity</h2>
              <div className="mt-0.5 text-xs text-[var(--muted)]">Latest booking and expense records</div>
            </div>
          </div>
          <div className="grid gap-0 border-t border-[var(--border)] md:grid-cols-2">
            <div className="border-b border-[var(--border)] md:border-b-0 md:border-r">
              {bookings.slice(0, 5).map((booking) => (
                <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3 last:border-b-0" key={booking.id}>
                  <div>
                    <div className="text-[13px] font-bold">{booking.guest_name}</div>
                    <div className="text-xs text-[var(--muted)]">{formatDate(booking.check_in)} - {propertyName(booking.property_id)}</div>
                  </div>
                  <div className="text-[13px] font-bold">{shortMoney(booking.total_amount)}</div>
                </div>
              ))}
            </div>
            <div>
              {expenses.slice(0, 5).map((expense) => (
                <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3 last:border-b-0" key={expense.id}>
                  <div>
                    <div className="text-[13px] font-bold">{expense.category}</div>
                    <div className="text-xs text-[var(--muted)]">{formatDate(expense.date)} - {expense.vendor || "No vendor"}</div>
                  </div>
                  <div className="text-[13px] font-bold">{shortMoney(expense.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
