"use client";

import { useEffect, useState } from "react";

const DEFAULT_IMAGES = [
  "/hero-elephants.jpg",
  "/hero-rhinos.webp",
  "/images/mammals.jpg",
  "/images/birds.jpg",
];

interface PageBackdropProps {
  /** Override the default cycling images with page-specific ones */
  images?: string[];
  /** Cycle interval in ms (default 8000) */
  intervalMs?: number;
}

export function PageBackdrop({ images, intervalMs = 8000 }: PageBackdropProps = {}) {
  const srcs = images ?? DEFAULT_IMAGES;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (srcs.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % srcs.length);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [srcs.length, intervalMs]);

  return (
    <>
      {srcs.map((src, i) => (
        <div
          key={src}
          className="fixed inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${src}')`,
            opacity: i === activeIndex ? 1 : 0,
            zIndex: i === activeIndex ? 1 : 0,
            transition: "opacity 2s ease-in-out",
          }}
        />
      ))}
      <div className="fixed inset-0 z-[2] bg-gradient-to-b from-black/70 via-black/40 to-brand-cream/95" />
    </>
  );
}
