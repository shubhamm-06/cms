"use client";

import Script from "next/script";

export const CALENDLY_EVENT_URL =
  "https://calendly.com/curatemystay/30min?hide_gdpr_banner=1";

const CALENDLY_SCRIPT_ID = "calendly-popup-widget";
const CALENDLY_SCRIPT_URL =
  "https://assets.calendly.com/assets/external/widget.js";
const CALENDLY_STYLESHEET_URL =
  "https://assets.calendly.com/assets/external/widget.css";

type CalendlyPopupOptions = {
  url: string;
};

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget(options: CalendlyPopupOptions): void;
    };
  }
}

let openWhenReady = false;

function launchCalendlyPopup(): boolean {
  if (typeof window === "undefined" || !window.Calendly) {
    return false;
  }

  if (document.querySelector(".calendly-overlay")) {
    return true;
  }

  window.Calendly.initPopupWidget({
    url: CALENDLY_EVENT_URL,
  });

  return true;
}

export function openCalendlyPopup(): void {
  if (launchCalendlyPopup()) {
    openWhenReady = false;
    return;
  }

  openWhenReady = true;
}

export function CalendlyPopupLoader() {
  function handleReady() {
    if (!openWhenReady) return;

    openWhenReady = false;
    launchCalendlyPopup();
  }

  return (
    <>
      <link
        href={CALENDLY_STYLESHEET_URL}
        rel="stylesheet"
      />

      <Script
        id={CALENDLY_SCRIPT_ID}
        src={CALENDLY_SCRIPT_URL}
        strategy="afterInteractive"
        onReady={handleReady}
        onError={() => {
          openWhenReady = false;
        }}
      />
    </>
  );
}