import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { parseGpx } from "~/server/gpx";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("gpx");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No GPX file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".gpx")) {
    return NextResponse.json({ error: "File must be a .gpx file" }, { status: 400 });
  }

  const xmlString = await file.text();

  let parsed: ReturnType<typeof parseGpx>;
  try {
    parsed = parseGpx(xmlString);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse GPX file";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const route = parsed.points.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    timestamp: p.timestamp,
  }));

  const firstPoint = route[0]!;
  const lastPoint = route[route.length - 1]!;

  const drive = await db.driveSession.create({
    data: {
      userId: session.user.id,
      lodgeId: session.user.lodgeId,
      route,
      photos: [],
      startedAt: new Date(firstPoint.timestamp),
      endedAt: new Date(lastPoint.timestamp),
      notes: parsed.name,
    },
  });

  return NextResponse.json({ driveId: drive.id });
}
