import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";
import { buildStravaAuthUrl } from "~/server/strava";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  const redirectUri = new URL("/api/strava/callback", request.url).toString();
  const authorizeUrl = buildStravaAuthUrl(redirectUri, session.user.id);

  return NextResponse.redirect(authorizeUrl);
}
