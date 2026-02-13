"use client";

import { useEffect, useState } from "react";

function isIosNonSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!isIos) return false;
  const isStandalone = ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone) || window.matchMedia("(display-mode: standalone)").matches;
  if (isStandalone) return false;
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS|BraveIO/.test(ua) && !/Chrome/.test(ua);
  return !isSafari;
}

export function SafariPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("safari-prompt-dismissed")) return;
    if (isIosNonSafari()) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem("safari-prompt-dismissed", "1");
  };

  return (
    <div className="relative z-[9998] bg-brand-dark px-4 py-3 text-center text-sm text-white">
      <p>
        For the best experience, open this app in{" "}
        <strong>Safari</strong> and tap{" "}
        <strong>Share &rarr; Add to Home Screen</strong>
      </p>
      <button
        onClick={dismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white"
        aria-label="Dismiss"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="6" y1="18" x2="18" y2="6" />
        </svg>
      </button>
    </div>
  );
}
