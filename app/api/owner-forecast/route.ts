import {
  calculateOwnerForecast,
  type ForecastResult,
} from "@/src/features/owner-forecast/forecast-calculator";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";
import {
  ownerForecastSchema,
  type OwnerForecastRequest,
} from "@/src/lib/validators/owner-forecast";

function cleanText(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

function formatCurrency(value: number) {
  return `INR ${Math.round(value).toLocaleString("en-IN")}`;
}

function buildLeadMessage(input: OwnerForecastRequest, forecast: ForecastResult) {
  return [
    "Owner revenue calculator submission",
    "",
    `Property category: ${cleanText(input.propertyCategory)}`,
    `Configuration: ${cleanText(input.configuration)}`,
    `Built-up area: ${input.areaSqft} sq.ft.`,
    `Location: ${cleanText(input.location)}`,
    `Distance from beach: ${cleanText(input.beachDistance)}`,
    `Pool: ${cleanText(input.poolType)}`,
    `Amenities: ${input.amenities.length ? input.amenities.map(cleanText).join(", ") : "None selected"}`,
    `Furnishing: ${cleanText(input.furnishingStatus)}`,
    `Currently rented: ${cleanText(input.currentlyRented)}`,
    `Based in: ${cleanText(input.residency)}`,
    `WhatsApp interest: ${input.whatsappInterest ? "Yes" : "No"}`,
    "",
    `Estimated annual revenue: ${formatCurrency(forecast.annualRevenue)}`,
    `Estimated operating cost: ${formatCurrency(forecast.annualOperatingCost)}`,
    `Estimated net profit: ${formatCurrency(forecast.annualNetProfit)}`,
    forecast.setup.note,
  ].join("\n");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ownerForecastSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Please check the required forecast fields." }, { status: 400 });
  }

  const input = parsed.data;
  const forecast = calculateOwnerForecast(input);
  const phone = cleanText(input.phone);

  try {
    const lead = {
      name: cleanText(input.name),
      email: cleanText(input.email),
      phone,
      source_page: "owner_revenue_calculator",
      message: buildLeadMessage(input, forecast),
    };
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasServiceRoleKey = Boolean(serviceRoleKey && !serviceRoleKey.startsWith("sb_publishable_"));
    const result = hasServiceRoleKey
      ? await createAdminClient().from("contact_submissions").insert(lead)
      : await (await createClient()).from("contact_submissions").insert(lead);
    if (result.error) throw result.error;
  } catch {
    console.error("Owner forecast lead storage failed.");
    return Response.json({ message: "We could not save your forecast request right now. Please try again." }, { status: 500 });
  }

  return Response.json({
    forecast,
    message: "Your forecast is ready.",
  });
}
