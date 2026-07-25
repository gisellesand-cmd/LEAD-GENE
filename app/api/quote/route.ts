import { NextResponse } from "next/server";

// Server-side proxy to the Compulife API (https://compulife.com/api/).
// Credentials NEVER reach the browser — this route is the only thing that
// talks to Compulife (PRD Section 7).
//
// IMPORTANT — Compulife authorizes exactly one server IP per
// COMPULIFEAUTHORIZATIONID (see compulife-api-samples/readme.html, section 1).
// Moving this route to a different host/IP (e.g. a new Vercel deployment)
// requires calling Compulife to reset the ID to the new IP. Confirm with the
// client which server will hold the authorized ID before going live, and
// whether Vercel's serverless egress IPs are stable enough or a fixed-IP
// proxy is needed.
const COMPULIFE_AUTHORIZATION_ID = process.env.COMPULIFE_AUTHORIZATION_ID;
const COMPULIFE_REQUEST_URL = "https://www.compulifeapi.com/api/request/";

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

    if (!COMPULIFE_AUTHORIZATION_ID) {
      return NextResponse.json(buildMockResult(faceAmount, termCategory));
    }

    // Field names/values below follow compulife-api-samples/api-sample-requests.php.
    // CompRating/Health/ModeUsed/SortOverride1/LANGUAGE defaults are copied from
    // Compulife's own sample request and are flagged as open items in PRD
    // Section 7 (to confirm once full API docs/credentials are delivered).
    // TODO: confirm whether Compulife expects a province code (via its
    // ProvinceList endpoint) in a dedicated field, rather than the province
    // name passed through ZipCode below.
    const compulifeRequest = {
      COMPULIFEAUTHORIZATIONID: COMPULIFE_AUTHORIZATION_ID,
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
      ZipCode: province,
    };

    const response = await fetch(
      `${COMPULIFE_REQUEST_URL}?COMPULIFE=${encodeURIComponent(JSON.stringify(compulifeRequest))}`,
      { method: "GET" },
    );

    if (!response.ok) {
      console.error("Compulife API error", response.status, await response.text().catch(() => ""));
      return NextResponse.json(buildMockResult(faceAmount, termCategory));
    }

    const data = await response.json();
    const results = Array.isArray(data) ? data : Array.isArray(data?.Results) ? data.Results : [];
    const top = results[0];

    if (!top) {
      return NextResponse.json(buildMockResult(faceAmount, termCategory));
    }

    const result: QuoteResult = {
      mock: false,
      monthlyPremium: formatCurrency(Number(top.Premium ?? top.MonthlyPremium ?? 0)),
      companyName: top.CompanyName ?? top.Name ?? "Compulife",
      productName: top.ProductName ?? TERM_LABELS[termCategory] ?? "Term Life",
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
