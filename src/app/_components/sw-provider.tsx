"use client";

import { SerwistProvider } from "@serwist/next/react";
import { type ReactNode, useEffect } from "react";

function useAutoReloadOnUpdate() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);
}

export function SwProvider({ children }: { children: ReactNode }) {
  useAutoReloadOnUpdate();

  return (
    <SerwistProvider swUrl="/sw.js" reloadOnOnline={false}>
      {children}
    </SerwistProvider>
  );
}
