import "server-only";

export interface GpxPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface GpxParseResult {
  points: GpxPoint[];
  name: string | null;
}

function extractText(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i");
  const match = re.exec(xml);
  return match?.[1]?.trim() ?? null;
}

export function parseGpx(xmlString: string): GpxParseResult {
  const name =
    extractText(xmlString, "name") ?? null;

  const trkptRegex =
    /<trkpt\s+lat=["']([^"']+)["']\s+lon=["']([^"']+)["'][^>]*>([\s\S]*?)<\/trkpt>/gi;

  const points: GpxPoint[] = [];
  let match: RegExpExecArray | null;

  while ((match = trkptRegex.exec(xmlString)) !== null) {
    const lat = parseFloat(match[1]!);
    const lng = parseFloat(match[2]!);
    const inner = match[3]!;

    if (isNaN(lat) || isNaN(lng)) continue;

    const time = extractText(inner, "time");
    points.push({
      lat,
      lng,
      timestamp: time ?? new Date().toISOString(),
    });
  }

  if (points.length < 2) {
    throw new Error("GPX file must contain at least 2 track points");
  }

  return { points, name };
}
