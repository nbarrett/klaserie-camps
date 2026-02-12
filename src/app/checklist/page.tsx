"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { api } from "~/trpc/react";

const CATEGORY_TABS = ["All", "Mammal", "Bird", "Reptile"];

export default function ChecklistPage() {
  const { data: session, status } = useSession();
  const [activeCategory, setActiveCategory] = useState("All");
  const [showSpottedOnly, setShowSpottedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const utils = api.useUtils();

  const checklist = api.checklist.myChecklist.useQuery({
    category: activeCategory === "All" ? undefined : activeCategory,
    spottedOnly: showSpottedOnly,
  });

  const stats = api.checklist.stats.useQuery();

  const toggleSpotted = api.checklist.toggleSpotted.useMutation({
    onSuccess: () => {
      void utils.checklist.myChecklist.invalidate();
      void utils.checklist.stats.invalidate();
    },
  });

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-brand-khaki">Loading...</div>;
  }

  if (!session) {
    redirect("/auth/signin");
  }

  const filteredItems = (checklist.data ?? []).filter((item) =>
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

  return (
    <main className="mx-auto max-w-md px-4 pb-20 pt-6">
      <h1 className="text-xl font-bold text-brand-dark">Wildlife Checklist</h1>

      {stats.data && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-brand-green/10 p-3 text-center">
            <div className="text-2xl font-bold text-brand-green">{stats.data.spotted}</div>
            <div className="text-xs text-brand-green/80">Spotted</div>
          </div>
          <div className="rounded-lg bg-white p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-brand-dark">{stats.data.total}</div>
            <div className="text-xs text-brand-khaki">Total Species</div>
          </div>
          <div className="rounded-lg bg-brand-gold/10 p-3 text-center">
            <div className="text-2xl font-bold text-brand-gold">
              {stats.data.total > 0
                ? Math.round((stats.data.spotted / stats.data.total) * 100)
                : 0}
              %
            </div>
            <div className="text-xs text-brand-gold/80">Complete</div>
          </div>
        </div>
      )}

      {stats.data && (
        <div className="mt-3 space-y-1">
          {stats.data.categories.map((cat) => (
            <div key={cat.category} className="flex items-center justify-between text-sm">
              <span className="text-brand-dark">{cat.category}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-brand-cream">
                  <div
                    className="h-2 rounded-full bg-brand-green"
                    style={{
                      width: `${cat.total > 0 ? (cat.spotted / cat.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-brand-khaki">
                  {cat.spotted}/{cat.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <input
          type="text"
          placeholder="Search species..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-brand-khaki/30 px-3 py-2 text-sm focus:border-brand-gold focus:outline-none"
        />
      </div>

      <div className="mt-3 flex gap-1 overflow-x-auto">
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${activeCategory === cat ? "bg-brand-brown text-white" : "bg-white text-brand-khaki shadow-sm hover:bg-brand-cream"}`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => setShowSpottedOnly(!showSpottedOnly)}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${showSpottedOnly ? "bg-brand-green text-white" : "bg-white text-brand-khaki shadow-sm hover:bg-brand-cream"}`}
        >
          {showSpottedOnly ? "Spotted Only" : "Show All"}
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {checklist.isLoading ? (
          <p className="text-sm text-brand-khaki">Loading checklist...</p>
        ) : sortedGroups.length > 0 ? (
          sortedGroups.map(([group, items]) => (
            <div key={group}>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-khaki">
                {group}
              </h3>
              <div className="rounded-lg bg-white shadow-sm">
                {items.map((item, idx) => (
                  <button
                    key={item.speciesId}
                    onClick={() => toggleSpotted.mutate({ speciesId: item.speciesId })}
                    disabled={toggleSpotted.isPending}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left ${idx > 0 ? "border-t border-brand-cream" : ""}`}
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
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-brand-khaki">No species found.</p>
        )}
      </div>
    </main>
  );
}
