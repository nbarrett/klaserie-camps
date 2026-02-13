"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import {
  precacheSpeciesImages,
  type PrecacheProgress,
} from "~/lib/precache-images";

export function PrecacheIndicator() {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<PrecacheProgress | null>(null);
  const started = useRef(false);

  const allSpecies = api.species.list.useQuery(undefined, {
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: Infinity,
    enabled: !!session,
  });

  useEffect(() => {
    if (started.current) return;
    const urls = (allSpecies.data ?? [])
      .map((s) => s.imageUrl)
      .filter((url): url is string => !!url);
    if (urls.length === 0) return;

    started.current = true;
    void precacheSpeciesImages(urls, setProgress);
  }, [allSpecies.data]);

  if (!progress || progress.done || progress.total === progress.cached) {
    return null;
  }

  const pct = Math.round((progress.cached / progress.total) * 100);

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
      <svg
        className="h-3.5 w-3.5 animate-spin text-brand-gold"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span className="text-xs font-medium text-white/80">
        Caching {progress.cached}/{progress.total} ({pct}%)
      </span>
    </div>
  );
}
