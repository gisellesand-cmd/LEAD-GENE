import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Source values follow the PRD v3 classification rule (Section 3).
// meta_lead_ads (native Meta forms) is a later phase (webhook integration);
// it already exists here so the CRM/schema does not need to change when that phase lands.
export type LeadSource = "meta_lead_ads" | "meta_paid" | "google_ads" | "organic" | "manual";
export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "closed_won"
  | "closed_lost"
  | "manual_entry";

export type Lead = {
  id: string;
  created_at: string;
  source: LeadSource;
  status: LeadStatus;
  full_name: string;
  email: string;
  phone: string;
  product_interest: string;
  message: string;
  consent_casl: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  gclid: string | null;
  fbclid: string | null;
  landing_url: string | null;
  referrer: string | null;
  lost_reason: string | null;
  notes: string;
  assigned_to: string | null;
  last_contacted_at: string | null;
  pipeline_order: number;
  archived: boolean;
};

export type LeadInput = {
  fullName: string;
  email: string;
  phone: string;
  product?: string;
  message?: string;
  consent?: boolean;
  source?: LeadSource;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  landing_url?: string | null;
  referrer?: string | null;
};

const STORE_FILE = path.join(process.cwd(), "data", "leads.json");

async function ensureStoreFile() {
  await mkdir(path.dirname(STORE_FILE), { recursive: true });
  try {
    await readFile(STORE_FILE, "utf8");
  } catch {
    await writeFile(STORE_FILE, "[]", "utf8");
  }
}

export async function readLeads(): Promise<Lead[]> {
  await ensureStoreFile();
  const content = await readFile(STORE_FILE, "utf8");
  try {
    const parsed = JSON.parse(content) as Lead[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeLeads(leads: Lead[]) {
  await ensureStoreFile();
  await writeFile(STORE_FILE, JSON.stringify(leads, null, 2), "utf8");
}

export async function addLead(input: LeadInput): Promise<Lead> {
  const leads = await readLeads();
  const source = input.source ?? "organic";
  const lead: Lead = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    source,
    status: source === "manual" ? "manual_entry" : "new",
    full_name: input.fullName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    product_interest: input.product?.trim() ?? "",
    message: input.message?.trim() ?? "",
    consent_casl: Boolean(input.consent),
    utm_source: input.utm_source ?? null,
    utm_medium: input.utm_medium ?? null,
    utm_campaign: input.utm_campaign ?? null,
    utm_content: input.utm_content ?? null,
    gclid: input.gclid ?? null,
    fbclid: input.fbclid ?? null,
    landing_url: input.landing_url ?? null,
    referrer: input.referrer ?? null,
    lost_reason: null,
    notes: "",
    assigned_to: null,
    last_contacted_at: null,
    pipeline_order: leads.length,
    archived: false,
  };

  const nextLeads = [lead, ...leads];
  await writeLeads(nextLeads);
  return lead;
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  const leads = await readLeads();
  const target = leads.find((lead) => lead.id === id);

  if (!target) {
    return null;
  }

  const updatedLead = { ...target, ...updates };
  const nextLeads = leads.map((lead) => (lead.id === id ? updatedLead : lead));
  await writeLeads(nextLeads);
  return updatedLead;
}
