import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { getCurrentProfile } from "@/src/features/auth/auth-guards";
import { roleRedirectPath } from "@/src/features/auth/role-redirect";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const profile = await getCurrentProfile();
  return NextResponse.redirect(new URL(roleRedirectPath(profile), request.url));
}
