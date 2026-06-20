export type UserRole = "admin" | "owner";
export type AccountStatus = "pending" | "active" | "inactive";
export type BookingStatus =
  | "upcoming"
  | "in_house"
  | "checked_out"
  | "cancelled"
  | "blocked";
export type PayoutStatus =
  | "draft"
  | "ready_for_review"
  | "approved"
  | "query_raised"
  | "resolved"
  | "paid";

export type AppProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: UserRole;
  status: AccountStatus;
  avatar_url: string | null;
  is_protected: boolean;
};
