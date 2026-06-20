import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/src/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"],
};
