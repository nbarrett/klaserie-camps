import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { exchangeStravaCode } from "~/server/strava";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/strava?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/strava?error=missing_code", request.url));
  }

  try {
    const tokenData = await exchangeStravaCode(code);

    await db.stravaAccount.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        athleteId: tokenData.athlete.id,
        firstName: tokenData.athlete.firstname,
        lastName: tokenData.athlete.lastname,
        profileImageUrl: tokenData.athlete.profile,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_at,
        scope: "activity:read_all",
      },
      update: {
        athleteId: tokenData.athlete.id,
        firstName: tokenData.athlete.firstname,
        lastName: tokenData.athlete.lastname,
        profileImageUrl: tokenData.athlete.profile,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_at,
        scope: "activity:read_all",
      },
    });

    return NextResponse.redirect(new URL("/strava?connected=true", request.url));
  } catch (err) {
    console.error("Strava token exchange error:", err);
    return NextResponse.redirect(new URL("/strava?error=token_exchange_failed", request.url));
  }
}
