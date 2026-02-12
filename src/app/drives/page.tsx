"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { api } from "~/trpc/react";

export default function DrivesPage() {
  const { data: session, status } = useSession();
  const drives = api.drive.list.useQuery({ limit: 50 });

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-brand-khaki">Loading...</div>;
  }

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-20 pt-6">
      <h1 className="mb-4 text-xl font-bold text-brand-dark">Drive History</h1>

      {drives.data && drives.data.items.length > 0 ? (
        <div className="space-y-2">
          {drives.data.items.map((drive) => (
            <Link
              key={drive.id}
              href={`/drives/${drive.id}`}
              className="block rounded-lg bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-brand-dark">{drive.user.name}</div>
                  <div className="text-sm text-brand-khaki">
                    {drive._count.sightings} sighting{drive._count.sightings !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-brand-dark/80">
                    {new Date(drive.startedAt).toLocaleDateString("en-ZA")}
                  </div>
                  <div className="text-xs text-brand-khaki">
                    {drive.endedAt ? "Completed" : "In Progress"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : drives.isLoading ? (
        <p className="text-sm text-brand-khaki">Loading drives...</p>
      ) : (
        <p className="text-sm text-brand-khaki">No drives recorded yet.</p>
      )}
    </main>
  );
}
