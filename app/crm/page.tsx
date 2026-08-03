"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Lead, LeadSource, LeadStatus } from "@/lib/leads-store";

const stages: Array<{ key: LeadStatus; label: string }> = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "closed_won", label: "Closed Won" },
  { key: "closed_lost", label: "Closed Lost" },
  { key: "manual_entry", label: "Manual Entry" },
];

const sourceLabel: Record<LeadSource, string> = {
  meta_lead_ads: "Paid ad · Meta (native form)",
  meta_paid: "Paid ad · Meta",
  google_ads: "Paid ad · Google",
  organic: "Organic",
  manual: "Manual",
};

export default function CRMPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/crm/login");
    router.refresh();
  };

  useEffect(() => {
    const loadLeads = async () => {
      const response = await fetch("/api/leads?view=crm");
      const data = await response.json();
      setLeads(data.leads ?? []);
      if ((data.leads ?? []).length > 0) {
        setSelectedLeadId(data.leads[0].id);
      }
      setLoading(false);
    };

    void loadLeads();
  }, []);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  );

  return (
    <div className="min-h-screen bg-[#f3efe6] p-6 text-[#1a1a18]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-[#e0d7c3] bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#4b5b41]">CRM</p>
            <h1 className="mt-2 text-3xl font-semibold">Lead pipeline</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="rounded-full border border-[#d2c8b5] px-4 py-2 text-sm font-medium">Back to landing</Link>
            <button className="rounded-full bg-[#1d4d31] px-4 py-2 text-sm font-medium text-white">+ Add lead</button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-[#d2c8b5] px-4 py-2 text-sm font-medium"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.5rem] border border-[#e0d7c3] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#6b675d]">Total leads</p>
            <p className="mt-2 text-2xl font-semibold">{leads.length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#e0d7c3] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#6b675d]">New</p>
            <p className="mt-2 text-2xl font-semibold">{leads.filter((lead) => lead.status === "new").length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#e0d7c3] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#6b675d]">Qualified</p>
            <p className="mt-2 text-2xl font-semibold">{leads.filter((lead) => lead.status === "qualified").length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#e0d7c3] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#6b675d]">Closed won</p>
            <p className="mt-2 text-2xl font-semibold">{leads.filter((lead) => lead.status === "closed_won").length}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
            {stages.map((stage) => {
              const stageLeads = leads.filter((lead) => lead.status === stage.key);
              return (
                <div key={stage.key} className="rounded-[1.5rem] border border-[#e0d7c3] bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold">{stage.label}</h2>
                    <span className="rounded-full bg-[#f5efe0] px-3 py-1 text-xs font-semibold text-[#4b5b41]">{stageLeads.length}</span>
                  </div>
                  <div className="space-y-3">
                    {stageLeads.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-[#ddd2bf] p-3 text-sm text-[#7b776d]">No leads yet</p>
                    ) : (
                      stageLeads.map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => setSelectedLeadId(lead.id)}
                          className={`w-full rounded-[1.25rem] border p-3 text-left shadow-sm transition ${selectedLeadId === lead.id ? "border-[#1d4d31] bg-[#f7f2e5]" : "border-[#ebe3d2] bg-[#fcfbf7]"}`}
                        >
                          <p className="font-semibold">{lead.full_name}</p>
                          <p className="mt-1 text-sm text-[#6b675d]">{lead.product_interest}</p>
                          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6f8a5f]">{sourceLabel[lead.source]}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-[1.5rem] border border-[#e0d7c3] bg-white p-5 shadow-sm">
            {loading ? (
              <p className="text-sm text-[#6b675d]">Loading leads...</p>
            ) : selectedLead ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#4b5b41]">Lead details</p>
                  <h2 className="mt-2 text-2xl font-semibold">{selectedLead.full_name}</h2>
                </div>
                <div className="rounded-2xl bg-[#f8f3e7] p-4 text-sm text-[#4b4a47]">
                  <p><strong>Email:</strong> {selectedLead.email}</p>
                  <p className="mt-2"><strong>Phone:</strong> {selectedLead.phone}</p>
                  <p className="mt-2"><strong>Product:</strong> {selectedLead.product_interest}</p>
                  <p className="mt-2"><strong>Source:</strong> {sourceLabel[selectedLead.source]}</p>
                  <p className="mt-2"><strong>Status:</strong> {selectedLead.status}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Message</p>
                  <p className="mt-2 text-sm text-[#5f5c54]">{selectedLead.message || "No message provided."}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Notes</p>
                  <textarea className="mt-2 min-h-24 w-full rounded-2xl border border-[#d4cdbd] p-3 text-sm" defaultValue={selectedLead.notes} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#6b675d]">No lead selected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
