const CACHE_NAME = "species-images";

export interface PrecacheProgress {
  total: number;
  cached: number;
  done: boolean;
}

export async function precacheSpeciesImages(
  imageUrls: string[],
  onProgress?: (progress: PrecacheProgress) => void,
) {
  if (typeof window === "undefined" || !("caches" in window)) return;

  const cache = await caches.open(CACHE_NAME);
  const existing = await cache.keys();
  const cachedUrls = new Set(existing.map((req) => req.url));

  const uncached = imageUrls.filter((url) => !cachedUrls.has(url));
  if (uncached.length === 0) {
    onProgress?.({ total: imageUrls.length, cached: imageUrls.length, done: true });
    return;
  }

  let cached = imageUrls.length - uncached.length;
  const total = imageUrls.length;
  onProgress?.({ total, cached, done: false });

  const batchSize = 6;
  for (let i = 0; i < uncached.length; i += batchSize) {
    const batch = uncached.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (url) => {
        const response = await fetch(url, { mode: "cors" });
        if (response.ok) {
          await cache.put(url, response);
        }
      }),
    );
    cached += results.filter((r) => r.status === "fulfilled").length;
    onProgress?.({ total, cached, done: i + batchSize >= uncached.length });
  }
}
