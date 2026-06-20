import "server-only";

import type { ForecastResult } from "@/src/features/owner-forecast/forecast-calculator";
import type { OwnerForecastRequest } from "@/src/lib/validators/owner-forecast";

export type PitchDeckResult = {
  ok: boolean;
  pdfDownloadUrl: string | null;
  pdfViewUrl: string | null;
};

function cleanText(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

function safeFilePart(value: string) {
  return cleanText(value).replace(/[<>:"/\\|?*]/g, "").slice(0, 80) || "Owner";
}

function safeHttpUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function formatCurrency(value: number) {
  return `INR ${Math.round(value).toLocaleString("en-IN")}`;
}

function formatDays(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function formatIndiaDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function buildAppsScriptReplacements(input: OwnerForecastRequest, forecast: ForecastResult) {
  const amenities = input.amenities.length ? input.amenities.join(", ") : "None selected";
  const replacements: Record<string, string> = {
    "{{OWNER_NAME}}": cleanText(input.name),
    "{{DATE}}": formatIndiaDate(),
    "{{PROPERTY_NAME}}": `${input.configuration} ${input.propertyCategory} in ${input.location}`,
    "{{PROPERTY_TYPE}}": input.propertyCategory,
    "{{CONFIG}}": input.configuration,
    "{{LOCATION}}": input.location,
    "{{BEACH_DISTANCE}}": input.beachDistance,
    "{{AREA_SQFT}}": String(input.areaSqft),
    "{{POOL_TYPE}}": input.poolType,
    "{{FURNISHING}}": input.furnishingStatus,
    "{{AMENITIES_LIST}}": amenities,
    "{{LOC_MULT}}": forecast.modifiers.locationRateMultiplier.toFixed(2),
    "{{BEACH_MULT}}": forecast.modifiers.beachMultiplier.toFixed(2),
    "{{POOL_UPLIFT}}": formatCurrency(forecast.modifiers.poolRateUplift),
    "{{AREA_ADJ}}": forecast.modifiers.areaAdjustment.toFixed(2),
    "{{AMENITY_BONUS}}": `${Math.round((forecast.modifiers.amenityMultiplier - 1) * 1000) / 10}%`,
    "{{LOC_OCC_MOD}}": forecast.modifiers.locationOccupancyMultiplier.toFixed(2),
    "{{OFF_DAYS}}": formatDays(forecast.seasonal.off.occupiedDaysPerMonth),
    "{{OFF_RATE}}": formatCurrency(forecast.seasonal.off.nightlyRate),
    "{{OFF_REVENUE}}": formatCurrency(forecast.seasonal.off.revenue),
    "{{SHOULDER_DAYS}}": formatDays(forecast.seasonal.shoulder.occupiedDaysPerMonth),
    "{{SHOULDER_RATE}}": formatCurrency(forecast.seasonal.shoulder.nightlyRate),
    "{{SHOULDER_REVENUE}}": formatCurrency(forecast.seasonal.shoulder.revenue),
    "{{PEAK_DAYS}}": formatDays(forecast.seasonal.peak.occupiedDaysPerMonth),
    "{{PEAK_RATE}}": formatCurrency(forecast.seasonal.peak.nightlyRate),
    "{{PEAK_REVENUE}}": formatCurrency(forecast.seasonal.peak.revenue),
    "{{TOTAL_REVENUE}}": formatCurrency(forecast.annualRevenue),
    "{{TOTAL_EXPENSES}}": formatCurrency(forecast.annualOperatingCost),
    "{{NET_PROFIT}}": formatCurrency(forecast.annualNetProfit),
    "{{TOTAL_REV}}": formatCurrency(forecast.annualRevenue),
    "{{TOTAL_EXP}}": formatCurrency(forecast.annualOperatingCost),
    "{{TOTAL_PROFIT}}": formatCurrency(forecast.annualNetProfit),
    "{{TOTAL_OWNER}}": "To be discussed",
    "{{COMMERCIAL_TERMS}}": "To be discussed",
  };

  forecast.monthly.forEach((month, index) => {
    const number = index + 1;
    replacements[`{{M${number}_DAYS}}`] = formatDays(month.occupiedDays);
    replacements[`{{M${number}_RATE}}`] = formatCurrency(month.nightlyRate);
    replacements[`{{M${number}_REV}}`] = formatCurrency(month.revenue);
    replacements[`{{M${number}_EXP}}`] = formatCurrency(month.operatingCost);
    replacements[`{{M${number}_PROFIT}}`] = formatCurrency(month.netProfit);
    replacements[`{{M${number}_OWNER}}`] = "To be discussed";
  });

  return replacements;
}

export async function generatePitchDeck(
  input: OwnerForecastRequest,
  forecast: ForecastResult,
): Promise<PitchDeckResult> {
  const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!webhookUrl || !secret) return { ok: false, pdfDownloadUrl: null, pdfViewUrl: null };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        fileName: `CurateMyStay Proposal - ${safeFilePart(input.name)} - ${safeFilePart(input.location)}`,
        keepSlides: false,
        replacements: buildAppsScriptReplacements(input, forecast),
      }),
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Pitch deck service returned an unsuccessful response.");
    const result = (await response.json()) as Record<string, unknown>;
    return {
      ok: result.ok === true,
      pdfDownloadUrl: safeHttpUrl(result.pdfDownloadUrl),
      pdfViewUrl: safeHttpUrl(result.pdfViewUrl),
    };
  } catch {
    console.error("Owner forecast pitch-deck generation failed.");
    return { ok: false, pdfDownloadUrl: null, pdfViewUrl: null };
  }
}
