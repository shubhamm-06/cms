import "server-only";

import { Resend } from "resend";
import type { ForecastResult } from "@/src/features/owner-forecast/forecast-calculator";
import type { PitchDeckResult } from "@/src/features/owner-forecast/proposal-generator";
import type { OwnerForecastRequest } from "@/src/lib/validators/owner-forecast";

function cleanText(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function buildWhatsAppUrl(input: OwnerForecastRequest) {
  const number = (process.env.NEXT_PUBLIC_CMS_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  if (!number) return "Unavailable";
  const message = `Hi CurateMyStay, I generated a forecast for my ${input.configuration} ${input.propertyCategory} in ${input.location} and would like to discuss it.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function buildInternalEmail(
  input: OwnerForecastRequest,
  forecast: ForecastResult,
  pitchDeck: PitchDeckResult,
) {
  const amenities = input.amenities.length ? input.amenities.join(", ") : "None selected";
  const whatsappUrl = buildWhatsAppUrl(input);
  const viewUrl = pitchDeck.pdfViewUrl || "unavailable";
  const downloadUrl = pitchDeck.pdfDownloadUrl || "unavailable";
  const pitchDeckStatus = pitchDeck.ok && pitchDeck.pdfDownloadUrl ? "ready" : "failed";
  const text = [
    "New Owner Forecast Lead",
    "",
    "Submitted:",
    formatIndiaDate(),
    "",
    "Contact Details",
    `Full name: ${cleanText(input.name)}`,
    `Phone: ${cleanText(input.phone)}`,
    `Email: ${cleanText(input.email)}`,
    `Based in: ${cleanText(input.residency)}`,
    `WhatsApp interest: ${input.whatsappInterest ? "Yes" : "No"}`,
    "",
    "Property Details",
    `Property category: ${input.propertyCategory}`,
    `Configuration: ${input.configuration}`,
    `Built-up area (sq.ft.): ${input.areaSqft}`,
    `Location: ${input.location}`,
    `Distance from beach: ${input.beachDistance}`,
    `Pool: ${input.poolType}`,
    `Amenities: ${amenities}`,
    `Furnishing status: ${input.furnishingStatus}`,
    `Currently being rented: ${input.currentlyRented}`,
    "",
    "Forecast Summary",
    `Estimated annual revenue: ${formatCurrency(forecast.annualRevenue)}`,
    `Estimated operating cost: ${formatCurrency(forecast.annualOperatingCost)}`,
    "Operating cost percentage: 15%",
    `Estimated net profit: ${formatCurrency(forecast.annualNetProfit)}`,
    "",
    "Seasonal Forecast",
    `Off-season rate: ${formatCurrency(forecast.seasonal.off.nightlyRate)}`,
    `Off-season occupancy: ${formatDays(forecast.seasonal.off.occupiedDaysPerMonth)} days/month`,
    `Off-season revenue: ${formatCurrency(forecast.seasonal.off.revenue)}`,
    "",
    `Shoulder-season rate: ${formatCurrency(forecast.seasonal.shoulder.nightlyRate)}`,
    `Shoulder-season occupancy: ${formatDays(forecast.seasonal.shoulder.occupiedDaysPerMonth)} days/month`,
    `Shoulder-season revenue: ${formatCurrency(forecast.seasonal.shoulder.revenue)}`,
    "",
    `Peak-season rate: ${formatCurrency(forecast.seasonal.peak.nightlyRate)}`,
    `Peak-season occupancy: ${formatDays(forecast.seasonal.peak.occupiedDaysPerMonth)} days/month`,
    `Peak-season revenue: ${formatCurrency(forecast.seasonal.peak.revenue)}`,
    "",
    "Setup Note",
    forecast.setup.note,
    "",
    `Pitch deck status: ${pitchDeckStatus}`,
    "Generated pitch deck:",
    viewUrl,
    "",
    "Direct PDF download:",
    downloadUrl,
    "",
    "WhatsApp follow-up:",
    whatsappUrl,
  ].join("\n");

  const linkedValues = [viewUrl, downloadUrl, whatsappUrl]
    .filter((value) => value !== "unavailable")
    .map((value) => [escapeHtml(value), `<a href="${escapeHtml(value)}">${escapeHtml(value)}</a>`] as const);
  let html = escapeHtml(text).replaceAll("\n", "<br>");
  linkedValues.forEach(([plain, link]) => {
    html = html.replaceAll(plain, link);
  });

  return { html: `<div style="font-family:Arial,sans-serif;line-height:1.55">${html}</div>`, text };
}

export async function sendOwnerForecastAdminEmail(
  input: OwnerForecastRequest,
  forecast: ForecastResult,
  pitchDeck: PitchDeckResult,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("Owner forecast email is not configured.");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: process.env.ADMIN_CONTACT_EMAIL || "curatemystay@gmail.com",
      subject: `New CurateMyStay Forecast Lead - ${cleanText(input.name)} - ${cleanText(input.location)}`,
      ...buildInternalEmail(input, forecast, pitchDeck),
    });
    if (result.error) throw new Error("Resend rejected the internal email.");
  } catch {
    console.error("Owner forecast internal email failed.");
  }
}
