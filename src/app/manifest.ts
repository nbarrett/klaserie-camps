import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Safari Track",
    short_name: "Safari Track",
    description: "GPS-tracked game drives and wildlife sighting logs",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#6B4C2E",
    background_color: "#EDE4D9",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
