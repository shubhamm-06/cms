import type { AppProfile } from "@/types/app.types";

export const demoOwnerProfile: AppProfile = {
  id: "demo-owner-rahul-mehta",
  email: "rahul.mehta@example.com",
  name: "Rahul Mehta",
  phone: "+91 98765 43210",
  role: "owner",
  status: "active",
  avatar_url: null,
  is_protected: false,
};

export const demoOwnerDashboard = {
  monthLabel: "July 2026",
  property: {
    name: "Casa Sol, Assagao",
    bedrooms: 3,
    city: "Assagao, Goa",
    status: "active",
  },
  livePerformance: {
    revenue: 384500,
    propertyExpenses: 46800,
    netProfit: 337700,
    estimatedPayout: 236390,
    occupiedNights: 19,
    occupancy: 61,
  },
  latestStatement: {
    month: "June 2026",
    revenue: 351200,
    propertyExpenses: 42300,
    adjustedProfit: 308900,
    ownerSharePercent: 70,
    ownerShare: 216230,
    cmsSharePercent: 30,
    cmsShare: 92670,
    tds: 21623,
    netPayable: 194607,
    status: "Approved",
  },
  bookings: [
    { id: "demo-booking-1", guestName: "Ananya Kapoor", checkIn: "2026-07-25", checkOut: "2026-07-29", nights: 4, source: "Airbnb", amount: 64800 },
    { id: "demo-booking-2", guestName: "Rohan Shah", checkIn: "2026-07-19", checkOut: "2026-07-23", nights: 4, source: "Booking.com", amount: 59200 },
    { id: "demo-booking-3", guestName: "Maya Iyer", checkIn: "2026-07-10", checkOut: "2026-07-13", nights: 3, source: "Direct", amount: 46800 },
  ],
  expenses: [
    { id: "demo-expense-1", vendor: "Coastal Care", category: "Housekeeping", note: "Turnover cleaning and linen", amount: 13800 },
    { id: "demo-expense-2", vendor: "AquaTech Goa", category: "Pool maintenance", note: "Monthly pool service", amount: 9200 },
    { id: "demo-expense-3", vendor: "Assagao Utilities", category: "Utilities", note: "Electricity and water", amount: 23800 },
  ],
  query: {
    message: "Could you share the pool-maintenance invoice with the next statement?",
    raisedAt: "2026-07-18",
    status: "Open",
  },
} as const;
