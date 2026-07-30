import { NextResponse } from "next/server";

// Server-side proxy to the Compulife API (https://compulife.com/api/).
// Credentials NEVER reach the browser — this route is the only thing that
// talks to Compulife (PRD Section 7).
//
// IMPORTANT — Compulife authorizes exactly one server IP per
// COMPULIFEAUTHORIZATIONID (see compulife-api-samples/readme.html, section 1).
// Vercel's serverless functions rotate outbound IPs per invocation, so this
// route never calls Compulife directly in production. Instead, when
// COMPULIFE_API_URL is set, it calls Compulife's own api.php (see
// compulife-api-samples/compulifeapi/) hosted on the client's WordPress
// server, which has a fixed IP and holds the Authorization ID itself in its
// config.php. COMPULIFE_AUTHORIZATION_ID below is only used for the direct-
// call fallback in local development.
const COMPULIFE_AUTHORIZATION_ID = process.env.COMPULIFE_AUTHORIZATION_ID;
const COMPULIFE_REQUEST_URL = "https://www.compulifeapi.com/api/request/";
const COMPULIFE_API_URL = process.env.COMPULIFE_API_URL;

// First Avenue Financial is only licensed to quote in these provinces.
const ALLOWED_PROVINCES = ["Alberta", "British Columbia"];

// Compulife's ZipCode field rejects a province name ("The postal code
// entered is invalid") — it wants an actual postal code, used for
// provincial premium tax rating, not the applicant's real address. Our form
// only collects province, so we send one representative postal code per
// allowed province as a stand-in. This is fine for a preliminary estimate;
// flag to the client if exact-postal-code rating ever matters here.
const PROVINCE_REFERENCE_POSTAL_CODE: Record<string, string> = {
  Alberta: "T2P1J9",
  "British Columbia": "V6B1A1",
};

const PROVINCE_ABBREVIATION: Record<string, string> = {
  Alberta: "AB",
  "British Columbia": "BC",
};

type QuotePayload = {
  birthDay?: string | number;
  birthMonth?: string | number;
  birthYear?: string | number;
  sex?: "M" | "F";
  smoker?: "Y" | "N";
  faceAmount?: string | number;
  termCategory?: string;
  province?: string;
};

type QuoteResult = {
  mock: boolean;
  monthlyPremium: string;
  companyName: string;
  productName: string;
  coverageAmount: string;
  termLabel: string;
  note: string;
};

const TERM_LABELS: Record<string, string> = {
  "3": "10 Year Level Term",
  "4": "15 Year Level Term",
  "5": "20 Year Level Term",
  "6": "25 Year Level Term",
  "7": "30 Year Level Term",
  E: "To Age 100 Level",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildMockResult(faceAmount: number, termCategory: string): QuoteResult {
  // Rough reference-only estimate so the UI has something to show before
  // COMPULIFE_AUTHORIZATION_ID is configured. Not a real insurance quote.
  const monthlyPremium = Math.max(15, (faceAmount / 100000) * 12);
  return {
    mock: true,
    monthlyPremium: formatCurrency(monthlyPremium),
    companyName: "Reference estimate",
    productName: TERM_LABELS[termCategory] ?? "Term Life",
    coverageAmount: formatCurrency(faceAmount),
    termLabel: TERM_LABELS[termCategory] ?? "Term Life",
    note: "This is a reference estimate. Your real quote will activate once the Compulife connection is complete.",
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuotePayload;

    const birthDay = Number(body.birthDay);
    const birthMonth = Number(body.birthMonth);
    const birthYear = Number(body.birthYear);
    const faceAmount = Number(body.faceAmount);
    const sex = body.sex === "F" ? "F" : "M";
    const smoker = body.smoker === "Y" ? "Y" : "N";
    const termCategory = body.termCategory ?? "5";
    const province = body.province?.trim() ?? "";

    if (
      !Number.isFinite(birthDay) ||
      !Number.isFinite(birthMonth) ||
      !Number.isFinite(birthYear) ||
      !Number.isFinite(faceAmount) ||
      faceAmount <= 0
    ) {
      return NextResponse.json(
        { error: "Please enter a valid date of birth and coverage amount." },
        { status: 400 },
      );
    }

    if (!ALLOWED_PROVINCES.includes(province)) {
      return NextResponse.json(
        { error: "Quotes are currently only available in Alberta and British Columbia." },
        { status: 400 },
      );
    }

    if (!COMPULIFE_API_URL && !COMPULIFE_AUTHORIZATION_ID) {
      return NextResponse.json(buildMockResult(faceAmount, termCategory));
    }

    // Field names/values below follow compulife-api-samples/api-sample-requests.php.
    // CompRating/Health/ModeUsed/SortOverride1/LANGUAGE defaults are copied from
    // Compulife's own sample request and are flagged as open items in PRD
    // Section 7 (to confirm once full API docs/credentials are delivered).
    // TODO: confirm whether Compulife expects a province code (via its
    // ProvinceList endpoint) in a dedicated field, rather than the province
    // name passed through ZipCode below.
    const quoteFields = {
      BirthDay: String(birthDay),
      BirthMonth: String(birthMonth),
      BirthYear: String(birthYear),
      Sex: sex,
      Smoker: smoker,
      FaceAmount: String(faceAmount),
      NewCategory: termCategory,
      CompRating: "4",
      Health: "PP",
      ModeUsed: "M",
      SortOverride1: "A",
      LANGUAGE: "E",
      ZipCode: PROVINCE_REFERENCE_POSTAL_CODE[province],
      State: PROVINCE_ABBREVIATION[province],
    };

    let response: Response;
    if (COMPULIFE_API_URL) {
      // api.php injects COMPULIFEAUTHORIZATIONID (from its own config.php)
      // and REMOTE_IP (from whoever calls it) itself — we only send the
      // quote fields.
      const params = new URLSearchParams({ requestType: "request", ...quoteFields });
      response = await fetch(`${COMPULIFE_API_URL}?${params.toString()}`, { method: "GET" });
    } else {
      const forwardedFor = request.headers.get("x-forwarded-for");
      const remoteIp = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
      const compulifeRequest = {
        COMPULIFEAUTHORIZATIONID: COMPULIFE_AUTHORIZATION_ID,
        REMOTE_IP: remoteIp,
        ...quoteFields,
      };
      response = await fetch(
        `${COMPULIFE_REQUEST_URL}?COMPULIFE=${encodeURIComponent(JSON.stringify(compulifeRequest))}`,
        { method: "GET" },
      );
    }

    if (!response.ok) {
      console.error("Compulife API error", response.status, await response.text().catch(() => ""));
      return NextResponse.json(buildMockResult(faceAmount, termCategory));
    }

    const data = await response.json();

    // api.php always answers with HTTP 200 (even on upstream failure) and
    // falls back to { message: "..." } instead of Compulife's own
    // { error: "..." } shape — check both.
    if (data?.error || data?.message) {
      console.error("Compulife API returned an error", data.error ?? data.message);
      return NextResponse.json(buildMockResult(faceAmount, termCategory));
    }

    // Compulife nests results under Compulife_ComparisonResults.Compulife_Results,
    // sorted cheapest-first (SortOverride1: "A"), with "Compulife_"-prefixed field
    // names on each row.
    const results = data?.Compulife_ComparisonResults?.Compulife_Results;
    const top = Array.isArray(results) ? results[0] : undefined;

    if (!top) {
      return NextResponse.json(buildMockResult(faceAmount, termCategory));
    }

    const result: QuoteResult = {
      mock: false,
      monthlyPremium: formatCurrency(Number(top.Compulife_premiumM ?? 0)),
      companyName: top.Compulife_company ?? "Compulife",
      productName: top.Compulife_product?.trim() || TERM_LABELS[termCategory] || "Term Life",
      coverageAmount: formatCurrency(faceAmount),
      termLabel: TERM_LABELS[termCategory] ?? "Term Life",
      note: "Live quote from Compulife.",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("quote request failed", error);
    // Lead capture must never depend on the calculator being up (PRD Section 7).
    return NextResponse.json(
      { error: "We could not calculate your quote right now. You can request a manual quote instead." },
      { status: 502 },
    );
  }
}
