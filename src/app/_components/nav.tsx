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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-khaki/20 bg-white">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center py-3 text-xs font-medium transition ${active ? "text-brand-brown" : "text-brand-khaki hover:text-brand-brown"}`}
            >
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => signOut()}
          className="flex flex-1 flex-col items-center py-3 text-xs font-medium text-brand-khaki transition hover:text-brand-brown"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
