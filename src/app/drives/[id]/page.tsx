"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { api } from "~/trpc/react";

const DriveMap = dynamic(
  () => import("~/app/_components/map").then((mod) => mod.DriveMap),
  { ssr: false, loading: () => <div className="flex h-[50vh] items-center justify-center rounded-lg bg-brand-cream">Loading map...</div> },
);

interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

export default function DriveDetailPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const driveId = params.id as string;

  const drive = api.drive.detail.useQuery({ id: driveId });

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-brand-khaki">Loading...</div>;
  }

  if (!session) {
    redirect("/auth/signin");
  }

  if (drive.isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-brand-khaki">Loading drive...</div>;
  }

  if (!drive.data) {
    return (
      <main className="mx-auto max-w-md px-4 pt-6">
        <p className="text-brand-khaki">Drive not found.</p>
        <Link href="/drives" className="mt-2 text-sm text-brand-brown">
          Back to history
        </Link>
      </main>
    );
  }

  const routePoints = (drive.data.route ?? []) as unknown as GpsPoint[];

  const sightingMarkers = drive.data.sightings.map((s) => ({
    id: s.id,
    lat: s.latitude,
    lng: s.longitude,
    speciesName: s.species.commonName,
    count: s.count,
    notes: s.notes,
  }));

  return (
    <main className="mx-auto max-w-md pb-20">
      <div className="px-4 py-4">
        <Link href="/drives" className="text-sm text-brand-brown hover:text-brand-brown/80">
          &larr; Back to history
        </Link>
        <h1 className="mt-2 text-xl font-bold text-brand-dark">Drive Detail</h1>
        <div className="mt-1 text-sm text-brand-khaki">
          {drive.data.user.name} &middot;{" "}
          {new Date(drive.data.startedAt).toLocaleDateString("en-ZA")}{" "}
          {new Date(drive.data.startedAt).toLocaleTimeString("en-ZA", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {drive.data.endedAt && (
            <>
              {" "}&ndash;{" "}
              {new Date(drive.data.endedAt).toLocaleTimeString("en-ZA", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </>
          )}
        </div>
      </div>

      <DriveMap
        zoom={14}
        route={routePoints}
        sightings={sightingMarkers}
        className="h-[50vh] w-full"
      />

      <div className="px-4 pt-4">
        {drive.data.notes && (
          <div className="mb-4 rounded-lg bg-white p-3 shadow-sm">
            <div className="text-xs font-medium uppercase text-brand-khaki">Notes</div>
            <div className="mt-1 text-sm text-brand-dark">{drive.data.notes}</div>
          </div>
        )}

        <h2 className="mb-2 text-lg font-semibold text-brand-dark">
          Sightings ({drive.data.sightings.length})
        </h2>

        {drive.data.sightings.length > 0 ? (
          <div className="space-y-2">
            {drive.data.sightings.map((sighting) => (
              <div
                key={sighting.id}
                className="rounded-lg bg-white p-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-brand-dark">
                    {sighting.species.commonName}
                  </div>
                  <div className="text-sm text-brand-khaki">x{sighting.count}</div>
                </div>
                {sighting.notes && (
                  <div className="mt-1 text-sm text-brand-khaki">{sighting.notes}</div>
                )}
                <div className="mt-1 text-xs text-brand-khaki/60">
                  {sighting.latitude.toFixed(5)}, {sighting.longitude.toFixed(5)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-brand-khaki">No sightings recorded during this drive.</p>
        )}
      </div>
    </main>
  );
}
