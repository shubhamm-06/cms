export const PUBLIC_DATA_TTL_SECONDS = 60;
export const PUBLIC_PROPERTIES_TAG = "cms-public-properties-v1";

/** A new key each minute forces a blocking miss instead of serving expired data on errors. */
export function publicReadPeriod(now = Date.now()) {
  return Math.floor(now / (PUBLIC_DATA_TTL_SECONDS * 1000));
}

export type BusinessDataset = "profiles" | "properties" | "property_images" | "bookings" | "expenses" | "payouts" | "queries" | "settings";

const financialPaths = ["/dashboard", "/dashboard/pnl", "/dashboard/payouts", "/owner", "/owner/payout"];
const propertyPaths = [...financialPaths, "/dashboard/properties", "/dashboard/bookings", "/dashboard/expenses", "/dashboard/queries", "/owner/property", "/owner/bookings", "/owner/expenses", "/owner/queries", "/booking", "/property/[slug]"];
const pathsByDataset: Record<BusinessDataset, readonly string[]> = {
  profiles: ["/dashboard", "/owner"],
  properties: propertyPaths,
  property_images: ["/dashboard/properties", "/booking", "/property/[slug]"],
  bookings: [...financialPaths, "/dashboard/bookings", "/owner/bookings"],
  expenses: [...financialPaths, "/dashboard/expenses", "/owner/expenses"],
  payouts: ["/dashboard/payouts", "/dashboard/queries", "/owner", "/owner/payout", "/owner/queries"],
  queries: ["/dashboard/queries", "/dashboard/payouts", "/owner", "/owner/queries", "/owner/payout"],
  settings: ["/dashboard/settings", "/dashboard/bookings", "/dashboard/expenses"],
};

export function mutationInvalidationPlan(datasets: readonly BusinessDataset[]) {
  const paths = [...new Set(datasets.flatMap((dataset) => pathsByDataset[dataset]))];
  return {
    paths: paths.map((path) => ({
      path,
      type: datasets.includes("profiles") && (path === "/dashboard" || path === "/owner")
        ? "layout" as const : path.includes("[") ? "page" as const : undefined,
    })),
    tags: datasets.some((dataset) => dataset === "properties" || dataset === "property_images") ? [PUBLIC_PROPERTIES_TAG] : [],
  };
}
