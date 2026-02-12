"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

interface SightingMarker {
  id: string;
  lat: number;
  lng: number;
  speciesName: string;
  count: number;
  notes?: string | null;
}

interface MapProps {
  center?: [number, number];
  zoom?: number;
  route?: GpsPoint[];
  sightings?: SightingMarker[];
  onMapClick?: (lat: number, lng: number) => void;
  showOverlay?: boolean;
  className?: string;
}

const SIGHTING_ICON = L.divIcon({
  className: "sighting-marker",
  html: `<div style="background:#ef4444;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const DUNDEE_OVERLAY_BOUNDS: L.LatLngBoundsExpression = [
  [-24.35, 31.05],
  [-24.15, 31.25],
];

export function DriveMap({
  center = [-24.25, 31.15],
  zoom = 14,
  route = [],
  sightings = [],
  onMapClick,
  showOverlay = true,
  className = "h-[60vh] w-full",
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const overlayRef = useRef<L.ImageOverlay | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(center, zoom);

    const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    });

    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "&copy; Esri",
        maxZoom: 19,
      },
    );

    osmLayer.addTo(map);

    L.control
      .layers(
        { Street: osmLayer, Satellite: satelliteLayer },
        {},
        { position: "topright" },
      )
      .addTo(map);

    if (showOverlay) {
      overlayRef.current = L.imageOverlay(
        "/dundee-map-0.png",
        DUNDEE_OVERLAY_BOUNDS,
        { opacity: 0.7, interactive: false },
      ).addTo(map);
    }

    if (onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!overlayRef.current) return;

    if (overlayVisible) {
      overlayRef.current.setOpacity(0.7);
    } else {
      overlayRef.current.setOpacity(0);
    }
  }, [overlayVisible]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    if (route.length > 0) {
      const latlngs = route.map((p) => [p.lat, p.lng] as [number, number]);
      polylineRef.current = L.polyline(latlngs, {
        color: "#3b82f6",
        weight: 4,
        opacity: 0.8,
      }).addTo(mapRef.current);

      mapRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [20, 20] });
    }
  }, [route]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    sightings.forEach((s) => {
      const marker = L.marker([s.lat, s.lng], { icon: SIGHTING_ICON })
        .addTo(mapRef.current!)
        .bindPopup(
          `<strong>${s.speciesName}</strong><br/>Count: ${s.count}${s.notes ? `<br/>${s.notes}` : ""}`,
        );
      markersRef.current.push(marker);
    });
  }, [sightings]);

  return (
    <div className="relative">
      <div ref={containerRef} className={`rounded-lg ${className}`} />
      {showOverlay && (
        <button
          onClick={() => setOverlayVisible(!overlayVisible)}
          className="absolute right-2 top-20 z-[1000] rounded bg-white px-2 py-1 text-xs font-medium shadow-md"
        >
          {overlayVisible ? "Hide Reserve Map" : "Show Reserve Map"}
        </button>
      )}
    </div>
  );
}
