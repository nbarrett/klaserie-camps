"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/drive", label: "Drive" },
  { href: "/checklist", label: "Checklist" },
  { href: "/drives", label: "History" },
];

export function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-brand-brown/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "text-brand-gold"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <button
          onClick={() => signOut()}
          className="rounded-md px-3 py-2 text-sm font-medium text-white/50 transition hover:text-white"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
