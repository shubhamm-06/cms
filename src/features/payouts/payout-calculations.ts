import { countStayNightsInMonth } from "@/src/lib/utils/dates";
import type { Database } from "@/types/database.types";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type Expense = Database["public"]["Tables"]["expenses"]["Row"];
type Property = Database["public"]["Tables"]["properties"]["Row"];
type Payout = Database["public"]["Tables"]["owner_payouts"]["Row"];

export type PropertyPayoutBreakup = {
  property_id: string;
  property_name: string;
  revenue: number;
  expenses: number;
  net: number;
  owner_share_percent: number;
  cms_share_percent: number;
};

export type OwnerCombinedPayout = {
  revenue_total: number;
  expense_total: number;
  current_month_net: number;
  previous_carry_forward: number;
  adjusted_net_profit: number;
  owner_share_percent: number;
  cms_share_percent: number;
  owner_share_amount: number;
  cms_share_amount: number;
  tds_amount: number;
  final_payout_amount: number;
  carry_forward_next: number;
};

export type OwnerLivePerformance = {
  estimated_payout: number;
  expense_total: number;
  net_profit: number;
  revenue_total: number;
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function daysBetween(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T00:00:00.000Z`);
  const end = new Date(`${checkOut}T00:00:00.000Z`);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

export function calculateBookingRevenueForMonth(booking: Booking, monthKey: string) {
  if (booking.status === "cancelled" || booking.status === "blocked") return 0;

  const countedNights = countStayNightsInMonth({
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    monthKey,
  });

  if (!countedNights) return 0;

  const totalNights = booking.nights && booking.nights > 0 ? booking.nights : daysBetween(booking.check_in, booking.check_out);
  const nightlyRate =
    booking.nightly_rate && booking.nightly_rate > 0
      ? booking.nightly_rate
      : totalNights > 0
        ? booking.total_amount / totalNights
        : 0;

  return roundMoney(nightlyRate * countedNights);
}

export function calculatePropertyBreakup({
  property,
  bookings,
  expenses,
  monthKey,
}: {
  property: Property;
  bookings: Booking[];
  expenses: Expense[];
  monthKey: string;
}): PropertyPayoutBreakup {
  const revenue = bookings
    .filter((booking) => booking.property_id === property.id)
    .reduce((sum, booking) => sum + calculateBookingRevenueForMonth(booking, monthKey), 0);
  const propertyExpenses = expenses
    .filter((expense) => expense.expense_for === "property" && expense.property_id === property.id)
    .reduce((sum, expense) => sum + expense.amount, 0);

  return {
    property_id: property.id,
    property_name: property.name,
    revenue: roundMoney(revenue),
    expenses: roundMoney(propertyExpenses),
    net: roundMoney(revenue - propertyExpenses),
    owner_share_percent: property.owner_share,
    cms_share_percent: property.cms_share,
  };
}

export function calculateBreakupsForOwnerMonth({
  ownerId,
  monthKey,
  properties,
  bookings,
  expenses,
}: {
  ownerId: string;
  monthKey: string;
  properties: Property[];
  bookings: Booking[];
  expenses: Expense[];
}) {
  const monthExpenses = expenses.filter((expense) => expense.date.startsWith(monthKey));
  return properties
    .filter((property) => property.owner_id === ownerId && property.status === "active")
    .map((property) =>
      calculatePropertyBreakup({
        property,
        bookings,
        expenses: monthExpenses,
        monthKey,
      }),
    );
}

export function calculateOwnerLivePerformance({
  ownerId,
  monthKey,
  properties,
  bookings,
  expenses,
  payouts,
}: {
  ownerId: string;
  monthKey: string;
  properties: Property[];
  bookings: Booking[];
  expenses: Expense[];
  payouts: Payout[];
}): OwnerLivePerformance {
  const propertyBreakups = calculateBreakupsForOwnerMonth({
    ownerId,
    monthKey,
    properties,
    bookings,
    expenses,
  });
  const combined = calculateOwnerCombinedPayout({
    propertyBreakups,
    previousCarryForward: calculatePreviousCarryForward({
      payouts,
      beforeMonth: monthKey,
    }),
  });

  return {
    estimated_payout: combined.final_payout_amount,
    expense_total: combined.expense_total,
    net_profit: combined.current_month_net,
    revenue_total: combined.revenue_total,
  };
}

export function calculatePreviousCarryForward({
  payouts,
  beforeMonth,
}: {
  payouts: Payout[];
  beforeMonth: string;
}) {
  const previous = payouts
    .filter((payout) => payout.month < beforeMonth)
    .sort((a, b) => a.month.localeCompare(b.month));

  return roundMoney(
    previous.reduce((carry, payout) => {
      const monthlyNet = payout.revenue_total - payout.expense_total;
      return Math.min(0, carry + monthlyNet);
    }, 0),
  );
}

export function calculateOwnerCombinedPayout({
  propertyBreakups,
  previousCarryForward,
}: {
  propertyBreakups: PropertyPayoutBreakup[];
  previousCarryForward: number;
}): OwnerCombinedPayout {
  const revenueTotal = roundMoney(propertyBreakups.reduce((sum, item) => sum + item.revenue, 0));
  const expenseTotal = roundMoney(propertyBreakups.reduce((sum, item) => sum + item.expenses, 0));
  const currentMonthNet = roundMoney(revenueTotal - expenseTotal);
  const adjustedNetProfit = roundMoney(currentMonthNet + previousCarryForward);
  const positiveNetTotal = propertyBreakups.reduce((sum, item) => sum + Math.max(0, item.net), 0);
  const fallbackOwnerShare = propertyBreakups[0]?.owner_share_percent ?? 70;
  const ownerSharePercent = positiveNetTotal
    ? propertyBreakups.reduce((sum, item) => sum + Math.max(0, item.net) * item.owner_share_percent, 0) / positiveNetTotal
    : fallbackOwnerShare;
  const cmsSharePercent = 100 - ownerSharePercent;

  if (adjustedNetProfit <= 0) {
    return {
      revenue_total: revenueTotal,
      expense_total: expenseTotal,
      current_month_net: currentMonthNet,
      previous_carry_forward: roundMoney(previousCarryForward),
      adjusted_net_profit: adjustedNetProfit,
      owner_share_percent: roundMoney(ownerSharePercent),
      cms_share_percent: roundMoney(cmsSharePercent),
      owner_share_amount: 0,
      cms_share_amount: 0,
      tds_amount: 0,
      final_payout_amount: 0,
      carry_forward_next: adjustedNetProfit,
    };
  }

  const ownerShareAmount = roundMoney(adjustedNetProfit * (ownerSharePercent / 100));
  const cmsShareAmount = roundMoney(adjustedNetProfit * (cmsSharePercent / 100));
  const tdsAmount = roundMoney(ownerShareAmount * 0.1);

  return {
    revenue_total: revenueTotal,
    expense_total: expenseTotal,
    current_month_net: currentMonthNet,
    previous_carry_forward: roundMoney(previousCarryForward),
    adjusted_net_profit: adjustedNetProfit,
    owner_share_percent: roundMoney(ownerSharePercent),
    cms_share_percent: roundMoney(cmsSharePercent),
    owner_share_amount: ownerShareAmount,
    cms_share_amount: cmsShareAmount,
    tds_amount: tdsAmount,
    final_payout_amount: roundMoney(ownerShareAmount - tdsAmount),
    carry_forward_next: 0,
  };
}
