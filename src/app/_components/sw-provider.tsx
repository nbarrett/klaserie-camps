"use client";

import { SerwistProvider } from "@serwist/next/react";
import { type ReactNode } from "react";

export function SwProvider({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider swUrl="/sw.js" reloadOnOnline={false}>
      {children}
    </SerwistProvider>
  );
}
