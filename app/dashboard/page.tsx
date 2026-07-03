import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  CircleDollarSign,
  ClipboardList,
  Home,
  Plus,
  ReceiptText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  icon,
  label,
  sub,
  tone = "neutral",
  value,
}: {
  delta?: string;
  icon: ReactNode;
  label: string;
  sub?: string;
  tone?: "up" | "down" | "neutral";
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2.5 text-[var(--brand-ink)]">
          {icon}
        </div>
        {delta || sub ? (
          <div
            className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${
              tone === "up"
                ? "bg-[var(--green-soft)] text-[var(--green)]"
                : tone === "down"
                  ? "bg-[var(--brand-soft)] text-[var(--brand-ink)]"
                  : "bg-[var(--surface-2)] text-[#5f5b55]"
            }`}
          >
            {tone === "up" ? <ArrowUp className="h-3 w-3" /> : null}
            {tone === "down" ? <ArrowDown className="h-3 w-3" /> : null}
            {delta || sub}
          </div>
        ) : null}
      </div>
      <div className="mt-5 text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">{label}</div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--foreground)]">{value}</div>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-8 text-center text-sm leading-6 text-[var(--muted)]">
      {children}
    </div>
  );
}

function SectionHeading({
  action,
  eyebrow,
  subtitle,
  title,
}: {
  action?: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? <div className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--brand-ink)]">{eyebrow}</div> : null}
        <h2 className={`${eyebrow ? "mt-1.5" : ""} text-lg font-extrabold tracking-tight text-[var(--foreground)]`}>{title}</h2>
        {subtitle ? <p className="mt-1 text-sm leading-6 text-[#5f5b55]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

function ActivityRow({
  amount,
  eyebrow,
  title,
}: {
  amount: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="truncate text-sm font-bold text-[var(--foreground)]">{title}</div>
        <div className="mt-1 truncate text-xs text-[#5f5b55]">{eyebrow}</div>
      </div>
      <div className="whitespace-nowrap text-sm font-bold text-[var(--foreground)]">{amount}</div>
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
  const occupancyLeaders = propertyPerformance.slice(0, 5);
  const recentBookings = bookings.slice(0, 5);
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-[0_18px_55px_rgba(22,24,29,0.06)] sm:p-6">
        <Badge className="mb-4 whitespace-nowrap" tone="brand">
          Admin overview
        </Badge>
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Operations command center
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5f5b55]">
              Fast scan across properties, bookings, expenses, occupancy, and near-term guest movement.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--cream)] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">Portfolio scope</div>
            <p className="mt-2 text-sm leading-6 text-[#5f5b55]">
              {properties.length} properties, {bookings.length} bookings, and {expenses.length} expense entries in the current admin data set.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Overview metrics</h2>
          <p className="mt-1 text-sm leading-6 text-[#5f5b55]">
            Booking revenue, property expenses, profit, and live guest movement from existing records.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            delta={`${bookings.length} bookings`}
            icon={<CircleDollarSign className="h-5 w-5" />}
            label="Booking revenue"
            tone="up"
            value={shortMoney(totalRevenue)}
          />
          <Kpi
            delta={`${expenses.length} entries`}
            icon={<ReceiptText className="h-5 w-5" />}
            label="Property expense"
            tone="down"
            value={shortMoney(totalExpense)}
          />
          <Kpi
            icon={<ClipboardList className="h-5 w-5" />}
            label="Net profit"
            tone={totalRevenue - totalExpense >= 0 ? "up" : "down"}
            value={shortMoney(totalRevenue - totalExpense)}
          />
          <Kpi
            icon={<Home className="h-5 w-5" />}
            label="In-house / upcoming"
            sub="guest flow"
            value={`${inHouse} / ${upcoming}`}
          />
        </div>
      </section>

      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12 rounded-3xl border border-[var(--border)] bg-white shadow-[0_14px_34px_rgba(22,24,29,0.04)] xl:col-span-8">
          <SectionHeading
            action={
              <Link className="cms-btn hidden bg-white text-[var(--foreground)] hover:bg-[var(--surface-2)] sm:inline-flex" href="/dashboard/properties">
                Properties
              </Link>
            }
            eyebrow="Property performance"
            subtitle="Profit-ranked view using existing booking revenue, property expenses, and occupancy logic."
            title="Portfolio performance"
          />
          <PropertyPerformanceTable rows={propertyPerformance} />
        </section>

        <section className="col-span-12 rounded-3xl border border-[var(--border)] bg-white shadow-[0_14px_34px_rgba(22,24,29,0.04)] xl:col-span-4">
          <SectionHeading
            eyebrow="Occupancy"
            subtitle="Top properties by the current occupancy calculation."
            title="Performance insights"
          />
          <div className="space-y-3 p-5">
            {occupancyLeaders.length === 0 ? (
              <EmptyState>No properties are available for occupancy insights yet.</EmptyState>
            ) : (
              occupancyLeaders.map((property) => (
                <div className="rounded-2xl border border-[var(--border)] p-4" key={property.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-[var(--foreground)]">{property.name}</div>
                      <div className="mt-1 text-xs text-[#5f5b55]">{property.owner_name}</div>
                    </div>
                    <span className="whitespace-nowrap text-sm font-extrabold text-[var(--foreground)]">{property.occupancy}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div className="h-full rounded-full" style={{ background: property.accent, width: `${property.occupancy}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-3xl border border-[var(--border)] bg-white shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
          <SectionHeading
            action={
              <Link className="text-sm font-bold text-[var(--brand-ink)] hover:underline" href="/dashboard/bookings">
                Bookings
              </Link>
            }
            eyebrow="Guest movement"
            subtitle="Next upcoming stays sorted by check-in date."
            title="Upcoming check-ins"
          />
          <div className="space-y-3 p-5">
            {upcomingCheckins.length === 0 ? (
              <EmptyState>No upcoming check-ins. New bookings will appear here automatically.</EmptyState>
            ) : (
              upcomingCheckins.map((booking) => {
                const checkInDate = new Date(booking.check_in);
                return (
                  <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-4" key={booking.id}>
                    <div className="min-w-[46px] rounded-xl bg-[var(--brand-soft)] px-2 py-2 text-center">
                      <div className="text-lg font-extrabold leading-none text-[var(--brand-ink)]">{checkInDate.getDate()}</div>
                      <div className="mt-1 text-[10.5px] font-bold uppercase text-[#6f6a62]">
                        {checkInDate.toLocaleDateString("en", { month: "short" })}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-[var(--foreground)]">{booking.guest_name}</div>
                      <div className="mt-1 truncate text-xs text-[#5f5b55]">
                        {propertyName(booking.property_id)} - {booking.nights || 0}n - {booking.guests || 0} guests
                      </div>
                    </div>
                    <Badge className="whitespace-nowrap" tone="teal">{booking.source || "Direct"}</Badge>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
          <SectionHeading
            eyebrow="Operations feed"
            subtitle="Latest booking and expense records for quick reconciliation."
            title="Recent activity"
          />
          <div className="grid border-t border-[var(--border)] md:grid-cols-2">
            <div className="border-b border-[var(--border)] md:border-b-0 md:border-r">
              <div className="px-5 py-3 text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">Bookings</div>
              {recentBookings.length === 0 ? (
                <div className="px-5 pb-5">
                  <EmptyState>No booking activity yet.</EmptyState>
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <ActivityRow
                    amount={shortMoney(booking.total_amount)}
                    eyebrow={`${formatDate(booking.check_in)} - ${propertyName(booking.property_id)}`}
                    key={booking.id}
                    title={booking.guest_name}
                  />
                ))
              )}
            </div>
            <div>
              <div className="px-5 py-3 text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">Expenses</div>
              {recentExpenses.length === 0 ? (
                <div className="px-5 pb-5">
                  <EmptyState>No expense activity yet.</EmptyState>
                </div>
              ) : (
                recentExpenses.map((expense) => (
                  <ActivityRow
                    amount={shortMoney(expense.amount)}
                    eyebrow={`${formatDate(expense.date)} - ${expense.vendor || "No vendor"}`}
                    key={expense.id}
                    title={expense.category}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-[var(--border)] bg-white p-4 shadow-[0_14px_34px_rgba(22,24,29,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-bold text-[var(--foreground)]">Quick action</div>
          <p className="mt-1 text-sm text-[#5f5b55]">Create a booking from the operations dashboard.</p>
        </div>
        <Link className="cms-btn cms-btn-primary" href="/dashboard/bookings">
          <Plus className="h-4 w-4" />
          Log booking
        </Link>
      </div>
    </div>
  );
}
