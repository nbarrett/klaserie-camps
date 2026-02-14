import "server-only";

import { env } from "~/env";
import { db } from "~/server/db";

const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";

const TOKEN_REFRESH_BUFFER_SECONDS = 300;

async function requireStravaCredentials() {
  const rows = await db.appSettings.findMany({
    where: { key: { in: ["strava_client_id", "strava_client_secret"] } },
  });
  const dbClientId = rows.find((r) => r.key === "strava_client_id")?.value;
  const dbClientSecret = rows.find((r) => r.key === "strava_client_secret")?.value;

  if (dbClientId && dbClientSecret) {
    return { clientId: dbClientId, clientSecret: dbClientSecret };
  }

  const clientId = env.STRAVA_CLIENT_ID;
  const clientSecret = env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET must be configured");
  }
  return { clientId, clientSecret };
}

export interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: {
    id: number;
    firstname: string;
    lastname: string;
    profile: string;
  };
}

export interface StravaActivitySummary {
  id: number;
  name: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  start_latlng: [number, number] | null;
  map: {
    id: string;
    summary_polyline: string | null;
  };
}

export async function buildStravaAuthUrl(redirectUri: string, state: string): Promise<string> {
  const { clientId } = await requireStravaCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    approval_prompt: "auto",
    scope: "activity:read_all",
    state,
  });
  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

export async function exchangeStravaCode(code: string): Promise<StravaTokenResponse> {
  const { clientId, clientSecret } = await requireStravaCredentials();
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Strava token exchange failed: ${response.status} ${body}`);
  }

  return response.json() as Promise<StravaTokenResponse>;
}

async function refreshStravaToken(refreshToken: string): Promise<StravaTokenResponse> {
  const { clientId, clientSecret } = await requireStravaCredentials();
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Strava token refresh failed: ${response.status} ${body}`);
  }

  return response.json() as Promise<StravaTokenResponse>;
}

export async function getStravaAccessToken(userId: string): Promise<string | null> {
  const account = await db.stravaAccount.findUnique({ where: { userId } });
  if (!account) return null;

  const now = Math.floor(Date.now() / 1000);
  if (account.expiresAt - now > TOKEN_REFRESH_BUFFER_SECONDS) {
    return account.accessToken;
  }

  try {
    const refreshed = await refreshStravaToken(account.refreshToken);
    await db.stravaAccount.update({
      where: { userId },
      data: {
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token,
        expiresAt: refreshed.expires_at,
      },
    });
    return refreshed.access_token;
  } catch {
    await db.stravaAccount.delete({ where: { userId } });
    return null;
  }
}

export async function fetchStravaActivities(
  accessToken: string,
  page = 1,
  perPage = 30,
): Promise<StravaActivitySummary[]> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  const response = await fetch(`${STRAVA_API_BASE}/athlete/activities?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Strava activities fetch failed: ${response.status}`);
  }

  return response.json() as Promise<StravaActivitySummary[]>;
}

export interface StravaStream {
  type: string;
  data: number[] | [number, number][];
  series_type: string;
  original_size: number;
  resolution: string;
}

export interface StravaPhoto {
  unique_id: string;
  urls: Record<string, string>;
  caption: string;
  location: [number, number] | null;
}

export async function fetchStravaActivity(
  accessToken: string,
  activityId: number,
): Promise<StravaActivitySummary> {
  const response = await fetch(`${STRAVA_API_BASE}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Strava activity fetch failed: ${response.status}`);
  }

  return response.json() as Promise<StravaActivitySummary>;
}

export async function fetchStravaActivityStreams(
  accessToken: string,
  activityId: number,
): Promise<{ latlng: [number, number][]; time: number[] }> {
  const params = new URLSearchParams({
    keys: "latlng,time",
    key_type: "value",
  });

  const response = await fetch(
    `${STRAVA_API_BASE}/activities/${activityId}/streams?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    throw new Error(`Strava streams fetch failed: ${response.status}`);
  }

  const streams = (await response.json()) as StravaStream[];

  const latlngStream = streams.find((s) => s.type === "latlng");
  const timeStream = streams.find((s) => s.type === "time");

  if (!latlngStream) {
    throw new Error("Activity has no GPS data");
  }

  return {
    latlng: latlngStream.data as [number, number][],
    time: (timeStream?.data as number[]) ?? [],
  };
}

export async function fetchStravaActivityPhotos(
  accessToken: string,
  activityId: number,
): Promise<StravaPhoto[]> {
  const response = await fetch(
    `${STRAVA_API_BASE}/activities/${activityId}/photos?size=600&photo_sources=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    throw new Error(`Strava photos fetch failed: ${response.status}`);
  }

  return response.json() as Promise<StravaPhoto[]>;
}
