"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { api } from "~/trpc/react";
import { useGpsTracker } from "~/app/_components/gps-tracker";
import { SightingForm } from "~/app/_components/sighting-form";

const DriveMap = dynamic(
  () => import("~/app/_components/map").then((mod) => mod.DriveMap),
  { ssr: false, loading: () => <div className="flex h-screen items-center justify-center bg-brand-cream">Loading map...</div> },
);

interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

export default function DrivePage() {
  const { data: session, status } = useSession();
  const [routePoints, setRoutePoints] = useState<GpsPoint[]>([]);
  const [sightingLocation, setSightingLocation] = useState<{ lat: number; lng: number } | null>(null);

  const utils = api.useUtils();

  const activeDrive = api.drive.active.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const startDrive = api.drive.start.useMutation({
    onSuccess: () => {
      void utils.drive.active.invalidate();
    },
  });

  const endDrive = api.drive.end.useMutation({
    onSuccess: () => {
      setRoutePoints([]);
      void utils.drive.active.invalidate();
      void utils.drive.list.invalidate();
    },
  });

  const addRoutePoints = api.drive.addRoutePoints.useMutation();

  const handleGpsPoints = useCallback(
    (points: GpsPoint[]) => {
      setRoutePoints((prev) => [...prev, ...points]);
      if (activeDrive.data) {
        addRoutePoints.mutate({ id: activeDrive.data.id, points });
      }
    },
    [activeDrive.data, addRoutePoints],
  );

  const { tracking, error: gpsError, currentPosition, startTracking, stopTracking } =
    useGpsTracker({
      intervalMs: 10000,
      onPoints: handleGpsPoints,
    });

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center text-brand-khaki">Loading...</div>;
  }

  if (!session) {
    redirect("/auth/signin");
  }

  const driveSession = activeDrive.data;
  const existingRoute = (driveSession?.route ?? []) as unknown as GpsPoint[];
  const allRoutePoints = [...existingRoute, ...routePoints];

  const sightingMarkers = (driveSession?.sightings ?? []).map((s) => ({
    id: s.id,
    lat: s.latitude,
    lng: s.longitude,
    speciesName: s.species.commonName,
    count: s.count,
    notes: s.notes,
  }));

  const handleMapClick = (lat: number, lng: number) => {
    if (driveSession) {
      setSightingLocation({ lat, lng });
    }
  };

  const handleStartDrive = () => {
    startDrive.mutate(undefined, {
      onSuccess: () => startTracking(),
    });
  };

  const handleEndDrive = () => {
    stopTracking();
    if (driveSession) {
      endDrive.mutate({ id: driveSession.id });
    }
  };

  const mapCenter: [number, number] = currentPosition
    ? [currentPosition.lat, currentPosition.lng]
    : [-24.25, 31.15];

  return (
    <main className="relative h-screen w-full">
      <DriveMap
        center={mapCenter}
        zoom={15}
        route={allRoutePoints}
        sightings={sightingMarkers}
        onMapClick={driveSession ? handleMapClick : undefined}
        className="h-full w-full"
      />

      <div className="absolute inset-x-0 bottom-0 z-[1000] pb-20">
        {gpsError && (
          <div className="mx-4 mb-2 rounded-lg bg-red-700/90 px-4 py-2 text-sm text-white backdrop-blur-sm">
            {gpsError}
          </div>
        )}

        <div className="mx-4 space-y-3">
          {!driveSession ? (
            <button
              onClick={handleStartDrive}
              disabled={startDrive.isPending}
              className="w-full rounded-lg bg-brand-brown py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-brown/90 disabled:opacity-50"
            >
              {startDrive.isPending ? "Starting..." : "Start Drive"}
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur-sm">
                <div>
                  <div className="text-sm font-medium text-brand-dark">
                    {tracking ? "GPS Tracking Active" : "GPS Paused"}
                  </div>
                  <div className="text-xs text-brand-khaki">
                    {sightingMarkers.length} sightings &middot; {allRoutePoints.length} GPS points
                  </div>
                </div>
                <div className="flex gap-2">
                  {tracking ? (
                    <button
                      onClick={stopTracking}
                      className="rounded bg-brand-gold px-3 py-1.5 text-xs font-medium text-brand-dark"
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={startTracking}
                      className="rounded bg-brand-teal px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Resume
                    </button>
                  )}
                </div>
              </div>

              <p className="text-center text-xs text-white drop-shadow-md">
                Tap the map to log a sighting at that location
              </p>

              {sightingLocation && (
                <SightingForm
                  driveSessionId={driveSession.id}
                  latitude={sightingLocation.lat}
                  longitude={sightingLocation.lng}
                  onComplete={() => {
                    setSightingLocation(null);
                    void utils.drive.active.invalidate();
                  }}
                  onCancel={() => setSightingLocation(null)}
                />
              )}

              <button
                onClick={handleEndDrive}
                disabled={endDrive.isPending}
                className="w-full rounded-lg bg-red-700 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-800 disabled:opacity-50"
              >
                {endDrive.isPending ? "Ending..." : "End Drive"}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
