import {
  BarChart3,
  BedDouble,
  Building2,
  CircleHelp,
  CreditCard,
  Home,
  Landmark,
  Receipt,
  Settings,
  User,
  Users,
} from "lucide-react";

export const adminNav = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/bookings", label: "Bookings", icon: BedDouble },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { href: "/dashboard/pnl", label: "P&L", icon: BarChart3 },
  { href: "/dashboard/payouts", label: "Payouts", icon: CreditCard },
  { href: "/dashboard/queries", label: "Queries", icon: CircleHelp },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export const ownerNav = [
  { href: "/owner", label: "Overview", icon: Home },
  { href: "/owner/property", label: "My Property", icon: Building2 },
  { href: "/owner/bookings", label: "Bookings", icon: BedDouble },
  { href: "/owner/expenses", label: "Expenses", icon: Receipt },
  { href: "/owner/payout", label: "Payout", icon: Landmark },
  { href: "/owner/queries", label: "Queries", icon: CircleHelp },
  { href: "/owner/profile", label: "Profile", icon: User },
];
