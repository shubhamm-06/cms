export const bookingStatuses = [
  "upcoming",
  "in_house",
  "checked_out",
  "cancelled",
  "blocked",
] as const;

export const payoutStatuses = [
  "draft",
  "ready_for_review",
  "approved",
  "query_raised",
  "resolved",
  "paid",
] as const;

export const accountStatuses = ["pending", "active", "inactive"] as const;
