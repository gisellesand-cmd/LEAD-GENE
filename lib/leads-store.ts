import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Source values follow the PRD v3 classification rule (Section 3).
// meta_lead_ads (native Meta forms) is a later phase (webhook integration);
// it already exists here so the CRM/schema does not need to change when that phase lands.
export type LeadSource = "meta_lead_ads" | "meta_paid" | "google_ads" | "organic" | "manual";
export type CarrierQuote = {
  companyName: string;
  productName: string;
  monthlyPremium: string;
};
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
  company_name: string | null;
  insurer_product_name: string | null;
  quote_results: CarrierQuote[] | null;
  date_of_birth: string | null;
  smoker: boolean | null;
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
  company_name?: string | null;
  insurer_product_name?: string | null;
  quote_results?: CarrierQuote[] | null;
  date_of_birth?: string | null;
  smoker?: boolean | null;
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

// Someone comparing coverage amounts/terms on the calculator resubmits the
// form every time they change an input, each one a fresh quote result but
// the same person. Collapse those into the same lead instead of flooding
// the CRM with duplicate cards, by refreshing this lead's quote-related
// fields when the same email re-submits shortly after. Manual staff entries
// (no email-window check applies there) and Meta webhook leads (already
// deduped by meta_leadgen_id above) are unaffected.
const RESUBMIT_WINDOW_MS = 30 * 60 * 1000;

function quoteRefreshFields(base: ReturnType<typeof buildLeadBase>) {
  return {
    product_interest: base.product_interest,
    company_name: base.company_name,
    insurer_product_name: base.insurer_product_name,
    quote_results: base.quote_results,
    date_of_birth: base.date_of_birth,
    smoker: base.smoker,
    message: base.message,
    utm_source: base.utm_source,
    utm_medium: base.utm_medium,
    utm_campaign: base.utm_campaign,
    utm_content: base.utm_content,
    gclid: base.gclid,
    fbclid: base.fbclid,
    landing_url: base.landing_url,
    referrer: base.referrer,
  };
}

function buildLeadBase(input: LeadInput) {
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
    company_name: input.company_name?.trim() || null,
    insurer_product_name: input.insurer_product_name?.trim() || null,
    quote_results: input.quote_results ?? null,
    date_of_birth: input.date_of_birth ?? null,
    smoker: input.smoker ?? null,
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
  return base;
}

export async function addLead(input: LeadInput): Promise<Lead> {
  const base = buildLeadBase(input);

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

    if (base.source !== "manual" && base.email) {
      const since = new Date(Date.now() - RESUBMIT_WINDOW_MS).toISOString();
      const { data: recent } = await supabase
        .from("leads")
        .select("*")
        .ilike("email", base.email)
        .eq("archived", false)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (recent) {
        const { data: updated, error: updateError } = await supabase
          .from("leads")
          .update(quoteRefreshFields(base))
          .eq("id", recent.id)
          .select()
          .single();
        if (!updateError && updated) return updated as Lead;
      }
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

  if (base.source !== "manual" && base.email) {
    const sinceTs = Date.now() - RESUBMIT_WINDOW_MS;
    const recent = leads.find(
      (lead) =>
        !lead.archived &&
        lead.email.toLowerCase() === base.email.toLowerCase() &&
        new Date(lead.created_at).getTime() >= sinceTs,
    );
    if (recent) {
      const updatedLead: Lead = { ...recent, ...quoteRefreshFields(base) };
      await writeLeads(leads.map((lead) => (lead.id === recent.id ? updatedLead : lead)));
      return updatedLead;
    }
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

export type LeadNote = {
  id: string;
  lead_id: string;
  body: string;
  created_at: string;
  created_by: string | null;
};

const NOTES_STORE_FILE = path.join(process.cwd(), "data", "lead-notes.json");

async function readLocalNotes(): Promise<LeadNote[]> {
  await mkdir(path.dirname(NOTES_STORE_FILE), { recursive: true });
  try {
    const content = await readFile(NOTES_STORE_FILE, "utf8");
    const parsed = JSON.parse(content) as LeadNote[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getLeadNotes(leadId: string): Promise<LeadNote[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("lead_notes")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as LeadNote[];
  }

  const notes = await readLocalNotes();
  return notes
    .filter((note) => note.lead_id === leadId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function addLeadNote(
  leadId: string,
  body: string,
  createdBy: string | null,
): Promise<LeadNote> {
  if (supabase) {
    const { data, error } = await supabase
      .from("lead_notes")
      .insert({ lead_id: leadId, body, created_by: createdBy })
      .select()
      .single();
    if (error) throw error;
    return data as LeadNote;
  }

  const notes = await readLocalNotes();
  const note: LeadNote = {
    id: crypto.randomUUID(),
    lead_id: leadId,
    body,
    created_at: new Date().toISOString(),
    created_by: createdBy,
  };
  await writeFile(NOTES_STORE_FILE, JSON.stringify([note, ...notes], null, 2), "utf8");
  return note;
}
