import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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
  | "meta_lead"
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
  meta_leadgen_id: string | null;
  meta_form_id: string | null;
  meta_ad_id: string | null;
  meta_adset_id: string | null;
  meta_campaign_id: string | null;
  meta_campaign_name: string | null;
  meta_adset_name: string | null;
  meta_ad_name: string | null;
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
  meta_leadgen_id?: string | null;
  meta_form_id?: string | null;
  meta_ad_id?: string | null;
  meta_adset_id?: string | null;
  meta_campaign_id?: string | null;
  meta_campaign_name?: string | null;
  meta_adset_name?: string | null;
  meta_ad_name?: string | null;
};

// Falls back to a local JSON file when Supabase isn't configured yet, same
// "clearly labeled mock" pattern as the Compulife quote route.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

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
  if (supabase) {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("pipeline_order", { ascending: true });
    if (error) throw error;
    return data as Lead[];
  }

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
  const source = input.source ?? "organic";
  const initialStatus: LeadStatus =
    source === "manual" ? "manual_entry" : source === "meta_lead_ads" ? "meta_lead" : "new";
  const base = {
    source,
    status: initialStatus,
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
    archived: false,
    meta_leadgen_id: input.meta_leadgen_id ?? null,
    meta_form_id: input.meta_form_id ?? null,
    meta_ad_id: input.meta_ad_id ?? null,
    meta_adset_id: input.meta_adset_id ?? null,
    meta_campaign_id: input.meta_campaign_id ?? null,
    meta_campaign_name: input.meta_campaign_name ?? null,
    meta_adset_name: input.meta_adset_name ?? null,
    meta_ad_name: input.meta_ad_name ?? null,
  };

  if (supabase) {
    // Meta webhook retries and daily backfill overlaps send the same
    // leadgen_id more than once — meta_leadgen_id is UNIQUE, so treat an
    // existing row as a no-op instead of a duplicate lead.
    if (base.meta_leadgen_id) {
      const { data: existing } = await supabase
        .from("leads")
        .select("*")
        .eq("meta_leadgen_id", base.meta_leadgen_id)
        .maybeSingle();
      if (existing) return existing as Lead;
    }

    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });
    const { data, error } = await supabase
      .from("leads")
      .insert({ ...base, pipeline_order: count ?? 0 })
      .select()
      .single();

    if (error) {
      // Unique-violation race: two near-simultaneous webhook retries both
      // passed the check above. Fall back to the row that won.
      if (error.code === "23505" && base.meta_leadgen_id) {
        const { data: existing } = await supabase
          .from("leads")
          .select("*")
          .eq("meta_leadgen_id", base.meta_leadgen_id)
          .single();
        if (existing) return existing as Lead;
      }
      throw error;
    }
    return data as Lead;
  }

  const leads = await readLeads();
  if (base.meta_leadgen_id) {
    const existing = leads.find((lead) => lead.meta_leadgen_id === base.meta_leadgen_id);
    if (existing) return existing;
  }

  const lead: Lead = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...base,
    pipeline_order: leads.length,
  };
  await writeLeads([lead, ...leads]);
  return lead;
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) return null;
    return data as Lead;
  }

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
