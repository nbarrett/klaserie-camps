import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { auth } from "~/server/auth";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".geojson")) {
    return NextResponse.json({ error: "File must be a .geojson file" }, { status: 400 });
  }

  const text = await file.text();

  let geojson: { type?: string; features?: unknown[] };
  try {
    geojson = JSON.parse(text) as { type?: string; features?: unknown[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features)) {
    return NextResponse.json({ error: "File must be a GeoJSON FeatureCollection" }, { status: 400 });
  }

  const outPath = join(process.cwd(), "public", "data", "roads.geojson");
  await writeFile(outPath, text, "utf-8");

  return NextResponse.json({ success: true, featureCount: geojson.features.length });
}
