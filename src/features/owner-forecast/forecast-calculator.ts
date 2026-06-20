export const PROPERTY_CATEGORIES = ["Apartment", "Villa"] as const;
export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number];

export const APARTMENT_CONFIGURATIONS = ["Studio", "1BHK", "2BHK", "3BHK"] as const;
export const VILLA_CONFIGURATIONS = ["Studio", "1-2BHK", "3BHK", "4BHK", "5BHK+"] as const;
export type PropertyConfiguration =
  | (typeof APARTMENT_CONFIGURATIONS)[number]
  | (typeof VILLA_CONFIGURATIONS)[number];

export const FORECAST_LOCATIONS = [
  "Anjuna",
  "Vagator",
  "Assagao",
  "Saligao",
  "Calangute",
  "Baga",
  "Candolim",
  "Morjim",
  "Ashvem",
  "Mandrem",
  "Arambol",
  "Panjim",
  "Margao",
  "Varca",
  "Cavelossim",
  "Colva",
  "Loutolim",
  "Other South Goa",
  "Other North Goa",
] as const;
export type ForecastLocation = (typeof FORECAST_LOCATIONS)[number];

export const BEACH_DISTANCES = ["Less than 500m", "500m-1km", "1-2km", "2-5km", "5km+"] as const;
export type BeachDistance = (typeof BEACH_DISTANCES)[number];

export const POOL_TYPES = ["Private pool", "Society/shared pool", "None"] as const;
export type PoolType = (typeof POOL_TYPES)[number];

export const AMENITIES = [
  "Garden / outdoor area",
  "Gym / fitness access",
  "Dedicated parking",
  "BBQ / outdoor kitchen",
  "Jacuzzi / hot tub",
  "Home theatre / entertainment room",
  "Rooftop / terrace with view",
  "EV charging",
  "Chef service available",
  "Pet-friendly",
] as const;
export type Amenity = (typeof AMENITIES)[number];

export const FURNISHING_STATUSES = [
  "Fully furnished and ready",
  "Mostly furnished, minor work",
  "Needs significant work",
  "Empty",
] as const;
export type FurnishingStatus = (typeof FURNISHING_STATUSES)[number];

export type ForecastInput = {
  propertyCategory: PropertyCategory;
  configuration: PropertyConfiguration;
  areaSqft: number;
  location: ForecastLocation;
  beachDistance: BeachDistance;
  poolType: PoolType;
  amenities: Amenity[];
  furnishingStatus: FurnishingStatus;
};

type Season = "off" | "shoulder" | "peak";

export type MonthlyForecast = {
  month: string;
  season: Season;
  daysInMonth: number;
  occupiedDays: number;
  nightlyRate: number;
  revenue: number;
  operatingCost: number;
  netProfit: number;
};

export type SeasonalForecast = {
  occupiedDaysPerMonth: number;
  nightlyRate: number;
  revenue: number;
  operatingCost: number;
  netProfit: number;
};

export type ForecastResult = {
  annualRevenue: number;
  annualOperatingCost: number;
  annualNetProfit: number;
  monthly: MonthlyForecast[];
  seasonal: Record<Season, SeasonalForecast>;
  setup: {
    costRange: string;
    launchTime: string;
    note: string;
  };
  modifiers: {
    locationRateMultiplier: number;
    locationOccupancyMultiplier: number;
    beachMultiplier: number;
    poolRateUplift: number;
    poolOccupancyMultiplier: number;
    areaAdjustment: number;
    amenityMultiplier: number;
  };
};

const OPERATING_COST_RATIO = 0.15;

const baseRateRanges: Record<string, Record<Season, [number, number]>> = {
  "Apartment:Studio": { off: [3500, 5000], shoulder: [6000, 8500], peak: [9000, 13000] },
  "Apartment:1BHK": { off: [3500, 5000], shoulder: [6000, 8500], peak: [9000, 13000] },
  "Apartment:2BHK": { off: [5000, 7000], shoulder: [8000, 12000], peak: [12000, 18000] },
  "Apartment:3BHK": { off: [7000, 10000], shoulder: [11000, 16000], peak: [16000, 24000] },
  "Villa:Studio": { off: [4500, 6500], shoulder: [8000, 11000], peak: [12000, 17000] },
  "Villa:1-2BHK": { off: [6000, 9000], shoulder: [10000, 15000], peak: [15000, 22000] },
  "Villa:3BHK": { off: [8000, 12000], shoulder: [13000, 18000], peak: [18000, 28000] },
  "Villa:4BHK": { off: [12000, 16000], shoulder: [16000, 22000], peak: [24000, 35000] },
  "Villa:5BHK+": { off: [18000, 25000], shoulder: [22000, 30000], peak: [35000, 50000] },
};

const months: Array<{ month: string; season: Season; days: number; baseOccupancy: number }> = [
  { month: "April", season: "off", days: 30, baseOccupancy: 10 },
  { month: "May", season: "off", days: 31, baseOccupancy: 10 },
  { month: "June", season: "off", days: 30, baseOccupancy: 10 },
  { month: "July", season: "off", days: 31, baseOccupancy: 10 },
  { month: "August", season: "off", days: 31, baseOccupancy: 10 },
  { month: "September", season: "off", days: 30, baseOccupancy: 10 },
  { month: "October", season: "shoulder", days: 31, baseOccupancy: 15 },
  { month: "November", season: "shoulder", days: 30, baseOccupancy: 15 },
  { month: "December", season: "peak", days: 31, baseOccupancy: 20 },
  { month: "January", season: "peak", days: 31, baseOccupancy: 20 },
  { month: "February", season: "shoulder", days: 28, baseOccupancy: 15 },
  { month: "March", season: "shoulder", days: 31, baseOccupancy: 15 },
];

const locationModifiers: Record<ForecastLocation, { rate: number; occupancy: number }> = {
  Anjuna: { rate: 1.25, occupancy: 1.05 },
  Vagator: { rate: 1.25, occupancy: 1.05 },
  Assagao: { rate: 1.3, occupancy: 1 },
  Saligao: { rate: 1.15, occupancy: 0.95 },
  Calangute: { rate: 1.1, occupancy: 1.1 },
  Baga: { rate: 1.1, occupancy: 1.1 },
  Candolim: { rate: 1.15, occupancy: 1.05 },
  Morjim: { rate: 1.1, occupancy: 0.9 },
  Ashvem: { rate: 1.1, occupancy: 0.88 },
  Mandrem: { rate: 1.05, occupancy: 0.85 },
  Arambol: { rate: 0.85, occupancy: 0.8 },
  Panjim: { rate: 1, occupancy: 1.15 },
  Margao: { rate: 0.8, occupancy: 0.85 },
  Varca: { rate: 0.95, occupancy: 0.85 },
  Cavelossim: { rate: 0.95, occupancy: 0.85 },
  Colva: { rate: 0.85, occupancy: 0.8 },
  Loutolim: { rate: 0.75, occupancy: 0.7 },
  "Other South Goa": { rate: 0.8, occupancy: 0.75 },
  "Other North Goa": { rate: 0.95, occupancy: 0.9 },
};

const beachMultipliers: Record<BeachDistance, number> = {
  "Less than 500m": 1.2,
  "500m-1km": 1.1,
  "1-2km": 1,
  "2-5km": 0.9,
  "5km+": 0.75,
};

const poolModifiers: Record<PoolType, { uplift: number; occupancy: number }> = {
  "Private pool": { uplift: 2000, occupancy: 1.05 },
  "Society/shared pool": { uplift: 500, occupancy: 1.02 },
  None: { uplift: 0, occupancy: 1 },
};

const amenityBonuses: Record<Amenity, number> = {
  "Garden / outdoor area": 0.04,
  "Gym / fitness access": 0.02,
  "Dedicated parking": 0.03,
  "BBQ / outdoor kitchen": 0.03,
  "Jacuzzi / hot tub": 0.05,
  "Home theatre / entertainment room": 0.03,
  "Rooftop / terrace with view": 0.05,
  "EV charging": 0.01,
  "Chef service available": 0.04,
  "Pet-friendly": 0.03,
};

const areaBands: Record<string, { min: number; max: number; below: number; above: number }> = {
  "Apartment:Studio": { min: 400, max: 750, below: 0.9, above: 1.05 },
  "Apartment:1BHK": { min: 400, max: 750, below: 0.9, above: 1.05 },
  "Apartment:2BHK": { min: 750, max: 1200, below: 0.92, above: 1.08 },
  "Apartment:3BHK": { min: 1100, max: 1800, below: 0.92, above: 1.08 },
  "Villa:Studio": { min: 800, max: 1500, below: 0.92, above: 1.08 },
  "Villa:1-2BHK": { min: 800, max: 1500, below: 0.92, above: 1.08 },
  "Villa:3BHK": { min: 1500, max: 2500, below: 0.93, above: 1.1 },
  "Villa:4BHK": { min: 2500, max: 4000, below: 0.93, above: 1.1 },
  "Villa:5BHK+": { min: 3500, max: 6000, below: 0.95, above: 1.12 },
};

const setupDetails: Record<FurnishingStatus, { costRange: string; launchTime: string }> = {
  "Fully furnished and ready": { costRange: "Rs 0", launchTime: "Immediate" },
  "Mostly furnished, minor work": { costRange: "Rs 25,000-Rs 75,000", launchTime: "2-4 weeks" },
  "Needs significant work": { costRange: "Rs 1,50,000-Rs 4,00,000", launchTime: "1-3 months" },
  Empty: { costRange: "Rs 3,00,000-Rs 8,00,000+", launchTime: "2-4 months" },
};

function midpoint(range: [number, number]) {
  return (range[0] + range[1]) / 2;
}

function getPoolRateUplift(input: ForecastInput) {
  if (
    input.poolType === "Private pool" &&
    input.propertyCategory === "Apartment" &&
    (input.configuration === "Studio" || input.configuration === "1BHK")
  ) {
    return 1000;
  }

  if (input.poolType === "None" && input.propertyCategory === "Villa" && input.configuration === "5BHK+") {
    return -1500;
  }

  return poolModifiers[input.poolType].uplift;
}

function getAreaAdjustment(input: ForecastInput) {
  const band = areaBands[`${input.propertyCategory}:${input.configuration}`];
  if (!band) throw new Error("Unsupported property configuration.");
  if (input.areaSqft < band.min) return band.below;
  if (input.areaSqft > band.max) return band.above;
  return 1;
}

export function calculateOwnerForecast(input: ForecastInput): ForecastResult {
  const key = `${input.propertyCategory}:${input.configuration}`;
  const rates = baseRateRanges[key];
  if (!rates) throw new Error("Unsupported property configuration.");

  const location = locationModifiers[input.location];
  const selectedBeachMultiplier = beachMultipliers[input.beachDistance];
  const beachMultiplier = input.location === "Panjim" ? Math.max(selectedBeachMultiplier, 0.95) : selectedBeachMultiplier;
  const pool = poolModifiers[input.poolType];
  const poolRateUplift = getPoolRateUplift(input);
  const areaAdjustment = getAreaAdjustment(input);
  const amenityMultiplier = Math.min(
    1 + input.amenities.reduce((sum, amenity) => sum + amenityBonuses[amenity], 0),
    1.15,
  );

  const seasonRates: Record<Season, number> = {
    off: ((midpoint(rates.off) * location.rate * beachMultiplier) + poolRateUplift) * areaAdjustment * amenityMultiplier,
    shoulder: ((midpoint(rates.shoulder) * location.rate * beachMultiplier) + poolRateUplift) * areaAdjustment * amenityMultiplier,
    peak: ((midpoint(rates.peak) * location.rate * beachMultiplier) + poolRateUplift) * areaAdjustment * amenityMultiplier,
  };

  const monthly = months.map<MonthlyForecast>((month) => {
    const occupiedDays = Math.min(
      month.baseOccupancy * location.occupancy * pool.occupancy,
      month.days * 0.95,
    );
    const nightlyRate = seasonRates[month.season];
    const revenue = nightlyRate * occupiedDays;
    const operatingCost = revenue * OPERATING_COST_RATIO;

    return {
      month: month.month,
      season: month.season,
      daysInMonth: month.days,
      occupiedDays,
      nightlyRate,
      revenue,
      operatingCost,
      netProfit: revenue - operatingCost,
    };
  });

  const seasonal = (["off", "shoulder", "peak"] as const).reduce<Record<Season, SeasonalForecast>>(
    (summary, season) => {
      const rows = monthly.filter((row) => row.season === season);
      summary[season] = {
        occupiedDaysPerMonth: rows.reduce((sum, row) => sum + row.occupiedDays, 0) / rows.length,
        nightlyRate: seasonRates[season],
        revenue: rows.reduce((sum, row) => sum + row.revenue, 0),
        operatingCost: rows.reduce((sum, row) => sum + row.operatingCost, 0),
        netProfit: rows.reduce((sum, row) => sum + row.netProfit, 0),
      };
      return summary;
    },
    {} as Record<Season, SeasonalForecast>,
  );

  const annualRevenue = monthly.reduce((sum, row) => sum + row.revenue, 0);
  const annualOperatingCost = monthly.reduce((sum, row) => sum + row.operatingCost, 0);
  const setup = setupDetails[input.furnishingStatus];

  return {
    annualRevenue,
    annualOperatingCost,
    annualNetProfit: monthly.reduce((sum, row) => sum + row.netProfit, 0),
    monthly,
    seasonal,
    setup: {
      ...setup,
      note: `Estimated setup investment: ${setup.costRange}. Expected launch time: ${setup.launchTime}. Forecast assumes the property is STR-ready and does not deduct this one-time setup investment.`,
    },
    modifiers: {
      locationRateMultiplier: location.rate,
      locationOccupancyMultiplier: location.occupancy,
      beachMultiplier,
      poolRateUplift,
      poolOccupancyMultiplier: pool.occupancy,
      areaAdjustment,
      amenityMultiplier,
    },
  };
}
