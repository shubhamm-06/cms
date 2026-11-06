import { buildPublicTextFeed, publicTextResponse } from "@/src/features/catalogue/public-text-feed";

export async function GET() {
  return publicTextResponse(await buildPublicTextFeed(true));
}
