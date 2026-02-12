"use client";

import Image from "next/image";
import Link from "next/link";
import { api } from "~/trpc/react";

interface HomeContentProps {
  userName: string;
}

export function HomeContent({ userName }: HomeContentProps) {
  const activeDrive = api.drive.active.useQuery();
  const recentSightings = api.sighting.recent.useQuery({ limit: 5 });
  const recentDrives = api.drive.list.useQuery({ limit: 5 });

  return (
    <main className="relative min-h-screen">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-elephants.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/40 to-brand-cream/95" />

      <div className="relative z-10 mx-auto max-w-md px-4 pb-20 pt-8">
        <div className="mb-6 flex items-center gap-3">
          <Image src="/logo-white.png" alt="Klaserie Camps" width={56} height={32} className="drop-shadow-md" />
          <div>
            <h1 className="text-xl font-bold text-white drop-shadow-md">Klaserie Camps</h1>
            <p className="text-sm text-white/70">Welcome back, {userName}</p>
          </div>
        </div>

        {activeDrive.data ? (
          <Link
            href="/drive"
            className="mb-6 block rounded-lg border border-brand-gold/30 bg-brand-brown/90 p-4 text-white shadow-lg backdrop-blur-sm"
          >
            <div className="text-xs font-medium uppercase tracking-wide text-brand-gold">
              Active Drive
            </div>
            <div className="mt-1 text-lg font-semibold">
              {activeDrive.data.sightings.length} sightings recorded
            </div>
            <div className="mt-2 text-sm text-brand-cream/80">Tap to continue tracking</div>
          </Link>
        ) : (
          <Link
            href="/drive"
            className="mb-6 block rounded-lg border border-brand-gold/30 bg-brand-brown/90 p-4 text-center text-white shadow-lg backdrop-blur-sm"
          >
            <div className="text-lg font-semibold">Start New Drive</div>
            <div className="mt-1 text-sm text-brand-cream/80">Begin GPS tracking and log sightings</div>
          </Link>
        )}

        <section className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-white drop-shadow-md">Recent Sightings</h2>
          {recentSightings.data && recentSightings.data.length > 0 ? (
            <div className="space-y-2">
              {recentSightings.data.map((sighting) => (
                <div
                  key={sighting.id}
                  className="flex items-center justify-between rounded-lg bg-white/80 p-3 shadow-sm backdrop-blur-sm"
                >
                  <div>
                    <div className="font-medium text-brand-dark">
                      {sighting.species.commonName}
                    </div>
                    <div className="text-xs text-brand-khaki">
                      by {sighting.user.name} &middot; {sighting.count} seen
                    </div>
                  </div>
                  <div className="text-xs text-brand-khaki/70">
                    {new Date(sighting.createdAt).toLocaleDateString("en-ZA")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/60">No sightings yet. Start a drive to log wildlife.</p>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-dark">Recent Drives</h2>
            <Link href="/drives" className="text-sm text-brand-brown hover:text-brand-brown/80">
              View all
            </Link>
          </div>
          {recentDrives.data && recentDrives.data.items.length > 0 ? (
            <div className="space-y-2">
              {recentDrives.data.items.map((drive) => (
                <Link
                  key={drive.id}
                  href={`/drives/${drive.id}`}
                  className="flex items-center justify-between rounded-lg bg-white/80 p-3 shadow-sm backdrop-blur-sm"
                >
                  <div>
                    <div className="font-medium text-brand-dark">{drive.user.name}</div>
                    <div className="text-xs text-brand-khaki">
                      {drive._count.sightings} sighting{drive._count.sightings !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-brand-khaki/70">
                      {new Date(drive.startedAt).toLocaleDateString("en-ZA")}
                    </div>
                    <div className="text-xs text-brand-khaki/70">
                      {drive.endedAt ? "Completed" : "In Progress"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-khaki">No drives recorded yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
