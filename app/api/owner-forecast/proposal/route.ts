import { calculateOwnerForecast } from "@/src/features/owner-forecast/forecast-calculator";
import { sendOwnerForecastAdminEmail } from "@/src/features/owner-forecast/forecast-email";
import { generatePitchDeck } from "@/src/features/owner-forecast/proposal-generator";
import { ownerForecastSchema } from "@/src/lib/validators/owner-forecast";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ownerForecastSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Please check the required proposal fields." }, { status: 400 });
  }

  const forecast = calculateOwnerForecast(parsed.data);
  const pitchDeck = await generatePitchDeck(parsed.data, forecast);
  await sendOwnerForecastAdminEmail(parsed.data, forecast, pitchDeck);

  if (!pitchDeck.ok || !pitchDeck.pdfDownloadUrl) {
    return Response.json(
      {
        ok: false,
        message: "Pitch deck temporarily unavailable.",
        pdfDownloadUrl: pitchDeck.pdfDownloadUrl,
        pdfViewUrl: pitchDeck.pdfViewUrl,
      },
      { status: 503 },
    );
  }

  return Response.json(pitchDeck);
}
