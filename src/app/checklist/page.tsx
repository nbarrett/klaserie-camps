"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "~/trpc/react";

const CATEGORY_TABS = ["All", "Mammal", "Bird", "Reptile"];

const BACKGROUND_IMAGES = [
  "/images/mammals.jpg",
  "/images/birds.jpg",
];

const CATEGORY_IMAGES: Record<string, string> = {
  Mammal: "/images/mammals.jpg",
  Bird: "/images/birds.jpg",
  Reptile: "/hero-elephants.jpg",
};

export default function ChecklistPage() {
  const { data: session, status } = useSession();
  const [activeCategory, setActiveCategory] = useState("All");
  const [showSpottedOnly, setShowSpottedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bgIndex, setBgIndex] = useState(0);

  const isGuest = status !== "loading" && !session;

  const utils = api.useUtils();

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const checklist = api.checklist.myChecklist.useQuery(
    {
      category: activeCategory === "All" ? undefined : activeCategory,
      spottedOnly: showSpottedOnly,
    },
    { enabled: !!session },
  );

  const speciesList = api.species.byCategory.useQuery(
    { category: activeCategory },
    { enabled: isGuest && activeCategory !== "All" },
  );
  const allSpecies = api.species.list.useQuery(undefined, {
    enabled: isGuest && activeCategory === "All",
  });

  const stats = api.checklist.stats.useQuery(undefined, {
    enabled: !!session,
  });

  const toggleSpotted = api.checklist.toggleSpotted.useMutation({
    onSuccess: () => {
      void utils.checklist.myChecklist.invalidate();
      void utils.checklist.stats.invalidate();
    },
  });

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-khaki">
        Loading...
      </div>
    );
  }

  const rawItems = session
    ? (checklist.data ?? [])
    : (activeCategory === "All" ? allSpecies.data : speciesList.data)?.map(
        (s) => ({
          speciesId: s.id,
          commonName: s.commonName,
          scientificName: s.scientificName,
          category: s.category,
          family: s.family,
          spotted: false,
          sightingCount: 0,
        }),
      ) ?? [];

  const filteredItems = rawItems.filter((item) =>
    searchQuery.length > 0
      ? item.commonName.toLowerCase().includes(searchQuery.toLowerCase())
      : true,
  );

  const groupedItems = filteredItems.reduce(
    (acc, item) => {
      const key = item.family ?? item.category;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, typeof filteredItems>,
  );

  const sortedGroups = Object.entries(groupedItems).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const isLoading = session
    ? checklist.isLoading
    : activeCategory === "All"
      ? allSpecies.isLoading
      : speciesList.isLoading;

  return (
    <main className="relative min-h-screen">
      {BACKGROUND_IMAGES.map((src, i) => (
        <div
          key={src}
          className="fixed inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${src}')`,
            opacity: i === bgIndex ? 1 : 0,
            transition: "opacity 2s ease-in-out",
          }}
        />
      ))}
      <div className="fixed inset-0 bg-brand-cream/85" />

      <div className="relative z-10 mx-auto max-w-md px-4 pb-20 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-dark">
            Wildlife Checklist
          </h1>
          {isGuest && (
            <Link
              href="/auth/signin"
              className="rounded-lg bg-brand-brown px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-brown/90"
            >
              Sign In
            </Link>
          )}
        </div>

        {isGuest && (
          <p className="mt-2 text-xs text-brand-khaki">
            Browsing as guest. Sign in to track your personal sightings.
          </p>
        )}

        {session && stats.data && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              onClick={() => setShowSpottedOnly(true)}
              className={`rounded-lg p-3 text-center backdrop-blur-sm transition ${
                showSpottedOnly
                  ? "bg-brand-green/20 ring-2 ring-brand-green"
                  : "bg-brand-green/10 hover:bg-brand-green/20"
              }`}
            >
              <div className="text-2xl font-bold text-brand-green">
                {stats.data.spotted}
              </div>
              <div className="text-xs text-brand-green/80">Spotted</div>
            </button>
            <button
              onClick={() => setShowSpottedOnly(false)}
              className={`rounded-lg p-3 text-center shadow-sm backdrop-blur-sm transition ${
                !showSpottedOnly
                  ? "bg-white/90 ring-2 ring-brand-brown"
                  : "bg-white/80 hover:bg-white/90"
              }`}
            >
              <div className="text-2xl font-bold text-brand-dark">
                {stats.data.total}
              </div>
              <div className="text-xs text-brand-khaki">Total Species</div>
            </button>
            <button
              onClick={() => setShowSpottedOnly(!showSpottedOnly)}
              className="rounded-lg bg-brand-gold/10 p-3 text-center backdrop-blur-sm transition hover:bg-brand-gold/20"
            >
              <div className="text-2xl font-bold text-brand-gold">
                {stats.data.total > 0
                  ? Math.round(
                      (stats.data.spotted / stats.data.total) * 100,
                    )
                  : 0}
                %
              </div>
              <div className="text-xs text-brand-gold/80">Complete</div>
            </button>
          </div>
        )}

        {session && stats.data && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {stats.data.categories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => {
                  setActiveCategory(cat.category);
                  setShowSpottedOnly(false);
                }}
                className={`relative overflow-hidden rounded-lg transition ${
                  activeCategory === cat.category
                    ? "ring-2 ring-brand-brown"
                    : "hover:ring-1 hover:ring-brand-khaki/40"
                }`}
              >
                <Image
                  src={CATEGORY_IMAGES[cat.category] ?? "/hero-elephants.jpg"}
                  alt={cat.category}
                  width={200}
                  height={80}
                  className="h-20 w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {cat.category}
                  </span>
                  <span className="text-xs text-white/80">
                    {cat.spotted}/{cat.total}
                  </span>
                  <div className="mt-1 h-1 w-12 rounded-full bg-white/30">
                    <div
                      className="h-1 rounded-full bg-brand-gold"
                      style={{
                        width: `${cat.total > 0 ? (cat.spotted / cat.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-4">
          <input
            type="text"
            placeholder="Search species..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-brand-khaki/30 bg-white/80 px-3 py-2 text-sm backdrop-blur-sm focus:border-brand-gold focus:outline-none"
          />
        </div>

        <div className="mt-3 flex gap-1 overflow-x-auto">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setShowSpottedOnly(false);
              }}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${
                activeCategory === cat
                  ? "bg-brand-brown text-white shadow-md"
                  : "bg-white/80 text-brand-khaki shadow-sm backdrop-blur-sm hover:bg-white"
              }`}
            >
              {cat}
            </button>
          ))}
          {session && (
            <button
              onClick={() => setShowSpottedOnly(!showSpottedOnly)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${
                showSpottedOnly
                  ? "bg-brand-green text-white shadow-md"
                  : "bg-white/80 text-brand-khaki shadow-sm backdrop-blur-sm hover:bg-white"
              }`}
            >
              {showSpottedOnly ? "Spotted Only" : "Show All"}
            </button>
          )}
        </div>

        <div className="mt-4 space-y-4">
          {isLoading ? (
            <p className="text-sm text-brand-khaki">Loading checklist...</p>
          ) : sortedGroups.length > 0 ? (
            sortedGroups.map(([group, items]) => (
              <div key={group}>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-brown">
                  {group}
                </h3>
                <div className="rounded-lg bg-white/80 shadow-sm backdrop-blur-sm">
                  {items.map((item, idx) =>
                    session ? (
                      <button
                        key={item.speciesId}
                        onClick={() =>
                          toggleSpotted.mutate({
                            speciesId: item.speciesId,
                          })
                        }
                        disabled={toggleSpotted.isPending}
                        className={`flex w-full items-center justify-between px-3 py-2.5 text-left ${idx > 0 ? "border-t border-brand-cream/60" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border ${item.spotted ? "border-brand-green bg-brand-green text-white" : "border-brand-khaki/40"}`}
                          >
                            {item.spotted && (
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div
                              className={`text-sm font-medium ${item.spotted ? "text-brand-green" : "text-brand-dark"}`}
                            >
                              {item.commonName}
                            </div>
                            {item.sightingCount > 0 && (
                              <div className="text-xs text-brand-khaki">
                                Seen {item.sightingCount}x
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div
                        key={item.speciesId}
                        className={`flex items-center gap-3 px-3 py-2.5 ${idx > 0 ? "border-t border-brand-cream/60" : ""}`}
                      >
                        <div className="h-5 w-5 rounded border border-brand-khaki/20" />
                        <div className="text-sm font-medium text-brand-dark">
                          {item.commonName}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-brand-khaki">No species found.</p>
          )}
        </div>
      </div>
    </main>
  );
}
