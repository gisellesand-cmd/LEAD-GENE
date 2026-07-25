"use client";

// Captures attribution markers on the visitor's FIRST pageview and persists them
// in sessionStorage + a first-party cookie (30-day expiry), so they survive
// multi-page navigation and return visits. Reading params only at submit time
// (the v2 defect noted in the PRD) would lose attribution the moment a visitor
// clicks through to another page before filling the form.

export type Attribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  gclid: string | null;
  fbclid: string | null;
  landing_url: string | null;
  referrer: string | null;
};

const STORAGE_KEY = "faf_attribution";
const COOKIE_NAME = "faf_attribution";
const COOKIE_MAX_AGE_DAYS = 30;

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, days: number) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function captureFromUrl(): Attribution {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    gclid: params.get("gclid"),
    fbclid: params.get("fbclid"),
    landing_url: window.location.href,
    referrer: document.referrer || null,
  };
}

function hasAnyMarker(attribution: Attribution) {
  return Boolean(
    attribution.utm_source ||
      attribution.utm_medium ||
      attribution.utm_campaign ||
      attribution.utm_content ||
      attribution.gclid ||
      attribution.fbclid,
  );
}

// Call once on landing page mount. Only writes on the visitor's first touch
// with paid/campaign markers present; a later organic pageview must not
// overwrite an earlier paid attribution.
export function captureAttribution(): void {
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY) ?? readCookie(COOKIE_NAME);
    if (existing) {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        sessionStorage.setItem(STORAGE_KEY, existing);
      }
      return;
    }

    const captured = captureFromUrl();
    if (hasAnyMarker(captured) || !existing) {
      const serialized = JSON.stringify(captured);
      sessionStorage.setItem(STORAGE_KEY, serialized);
      writeCookie(COOKIE_NAME, serialized, COOKIE_MAX_AGE_DAYS);
    }
  } catch {
    // Storage may be unavailable (privacy mode, blocked cookies) — attribution
    // simply won't persist across pages; the lead still saves without it.
  }
}

// Call at submit time to attach whatever was captured on first touch.
export function readAttribution(): Attribution {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY) ?? readCookie(COOKIE_NAME);
    if (stored) {
      return JSON.parse(stored) as Attribution;
    }
  } catch {
    // fall through to a fresh read below
  }
  return captureFromUrl();
}
