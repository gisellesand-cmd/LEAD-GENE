"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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

async function patchLead(id: string, updates: Record<string, unknown>) {
  const response = await fetch(`/api/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Update failed.");
  return data.lead as Lead;
}

function LeadCard({
  lead,
  selected,
  onSelect,
  onDelete,
}: {
  lead: Lead;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`relative w-full touch-none rounded-[1.25rem] border p-3 text-left shadow-sm transition ${selected ? "border-[#1d4d31] bg-[#f7f2e5]" : "border-[#ebe3d2] bg-[#fcfbf7]"}`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="block w-full pr-6 text-left"
      >
        <p className="font-semibold">{lead.full_name}</p>
        <p className="mt-1 text-sm text-[#6b675d]">{lead.product_interest}</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6f8a5f]">{sourceLabel[lead.source]}</p>
      </button>
      <button
        type="button"
        aria-label="Delete lead"
        title="Delete"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-[#a68f7a] hover:bg-[#f0e6d6] hover:text-[#8a3b2b]"
      >
        ×
      </button>
    </div>
  );
}

function StageColumn({
  stage,
  leads,
  selectedLeadId,
  onSelect,
  onDelete,
}: {
  stage: { key: LeadStatus; label: string };
  leads: Lead[];
  selectedLeadId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-[1.5rem] border p-4 shadow-sm transition ${isOver ? "border-[#1d4d31] bg-[#f7f2e5]" : "border-[#e0d7c3] bg-white"}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{stage.label}</h2>
        <span className="rounded-full bg-[#f5efe0] px-3 py-1 text-xs font-semibold text-[#4b5b41]">{leads.length}</span>
      </div>
      <div className="space-y-3">
        {leads.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#ddd2bf] p-3 text-sm text-[#7b776d]">No leads yet</p>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              selected={selectedLeadId === lead.id}
              onSelect={() => onSelect(lead.id)}
              onDelete={() => onDelete(lead.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function AddLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: (lead: Lead) => void }) {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", product: "", message: "", consent: false });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.fullName.trim() || !form.email.trim() || !form.consent) {
      setError("Full name, email, and consent are required.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "manual" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save lead.");
      onCreated(data.lead as Lead);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save lead.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-[1.5rem] border border-[#e0d7c3] bg-white p-6 shadow-lg"
      >
        <h2 className="text-xl font-semibold">Add lead</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#4b4a47]">Full name*</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className="w-full rounded-xl border border-[#d4cdbd] px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#4b4a47]">Email*</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-xl border border-[#d4cdbd] px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#4b4a47]">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-xl border border-[#d4cdbd] px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#4b4a47]">Product of interest</label>
          <input
            value={form.product}
            onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
            className="w-full rounded-xl border border-[#d4cdbd] px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#4b4a47]">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="min-h-20 w-full rounded-xl border border-[#d4cdbd] px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-[#4b4a47]">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
            className="mt-1"
          />
          The client consented to be contacted (CASL) — required.
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-[#d2c8b5] px-4 py-2 text-sm font-medium">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#1d4d31] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add lead"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm space-y-4 rounded-[1.5rem] border border-[#e0d7c3] bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Change password</h2>

        {success ? (
          <>
            <p className="text-sm text-[#4b8a5f]">Password updated.</p>
            <div className="flex justify-end">
              <button type="button" onClick={onClose} className="rounded-full bg-[#1d4d31] px-4 py-2 text-sm font-medium text-white">
                Done
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#4b4a47]">New password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#d4cdbd] px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#4b4a47]">Confirm new password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-[#d4cdbd] px-3 py-2 text-sm"
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="rounded-full border border-[#d2c8b5] px-4 py-2 text-sm font-medium">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[#1d4d31] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Update password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function LostReasonModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (reason.trim()) onConfirm(reason.trim());
        }}
        className="w-full max-w-sm space-y-4 rounded-[1.5rem] border border-[#e0d7c3] bg-white p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold">Why was this lead lost?</h2>
        <textarea
          required
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="min-h-20 w-full rounded-xl border border-[#d4cdbd] px-3 py-2 text-sm"
          placeholder="e.g. Went with another broker, unresponsive, budget..."
        />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-[#d2c8b5] px-4 py-2 text-sm font-medium">
            Cancel
          </button>
          <button type="submit" className="rounded-full bg-[#1d4d31] px-4 py-2 text-sm font-medium text-white">
            Move to Closed Lost
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CRMPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [pendingLostDrop, setPendingLostDrop] = useState<string | null>(null);
  const [notesSaved, setNotesSaved] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);

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

    const loadUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    };

    void loadUser();
  }, []);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  );

  const archivedLeads = useMemo(() => leads.filter((lead) => lead.archived), [leads]);

  const updateLeadLocally = (updated: Lead) => {
    setLeads((prev) => prev.map((lead) => (lead.id === updated.id ? updated : lead)));
  };

  const moveLeadStatus = async (leadId: string, status: LeadStatus, lost_reason?: string) => {
    const previous = leads;
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)));
    try {
      const updated = await patchLead(leadId, lost_reason ? { status, lost_reason } : { status });
      updateLeadLocally(updated);
    } catch {
      setLeads(previous);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const targetStatus = over.id as LeadStatus;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === targetStatus) return;

    if (targetStatus === "closed_lost") {
      setPendingLostDrop(leadId);
      return;
    }

    void moveLeadStatus(leadId, targetStatus);
  };

  const handleSaveNotes = async () => {
    if (!selectedLead || !notesRef.current) return;
    try {
      const updated = await patchLead(selectedLead.id, { notes: notesRef.current.value });
      updateLeadLocally(updated);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {
      // Leave the textarea as-is; the user can retry the save.
    }
  };

  const setArchived = async (leadId: string, archived: boolean) => {
    const previous = leads;
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, archived } : lead)));
    try {
      const updated = await patchLead(leadId, { archived });
      updateLeadLocally(updated);
    } catch {
      setLeads(previous);
    }
  };

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
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="rounded-full bg-[#1d4d31] px-4 py-2 text-sm font-medium text-white"
            >
              + Add lead
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu((open) => !open)}
                aria-label="Account menu"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d4d31] text-sm font-semibold text-white"
              >
                {userEmail ? userEmail[0].toUpperCase() : "?"}
              </button>

              {showProfileMenu ? (
                <>
                  <button
                    type="button"
                    aria-label="Close account menu"
                    onClick={() => setShowProfileMenu(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-[#e0d7c3] bg-white p-2 shadow-lg">
                    {userEmail ? (
                      <p className="truncate px-3 py-2 text-xs text-[#7b776d]">{userEmail}</p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowPasswordModal(true);
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-[#f7f2e5]"
                    >
                      Change password
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-[#f7f2e5]"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : null}
            </div>
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
          <DndContext onDragEnd={handleDragEnd}>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
              {stages.map((stage) => (
                <StageColumn
                  key={stage.key}
                  stage={stage}
                  leads={leads.filter((lead) => lead.status === stage.key && !lead.archived)}
                  selectedLeadId={selectedLeadId}
                  onSelect={setSelectedLeadId}
                  onDelete={(id) => setArchived(id, true)}
                />
              ))}
            </div>
          </DndContext>

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
                  {selectedLead.lost_reason ? (
                    <p className="mt-2"><strong>Lost reason:</strong> {selectedLead.lost_reason}</p>
                  ) : null}
                </div>
                <div>
                  <p className="text-sm font-semibold">Message</p>
                  <p className="mt-2 text-sm text-[#5f5c54]">{selectedLead.message || "No message provided."}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Notes</p>
                  <textarea
                    key={selectedLead.id}
                    ref={notesRef}
                    className="mt-2 min-h-24 w-full rounded-2xl border border-[#d4cdbd] p-3 text-sm"
                    defaultValue={selectedLead.notes}
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="rounded-full bg-[#1d4d31] px-4 py-2 text-sm font-medium text-white"
                    >
                      Save notes
                    </button>
                    {notesSaved ? <span className="text-sm text-[#4b8a5f]">Saved.</span> : null}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#6b675d]">No lead selected.</p>
            )}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#e0d7c3] bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Deleted contacts ({archivedLeads.length})</h2>
          <div className="mt-3 space-y-2">
            {archivedLeads.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#ddd2bf] p-3 text-sm text-[#7b776d]">No deleted contacts.</p>
            ) : (
              archivedLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-xl border border-[#ebe3d2] bg-[#fcfbf7] p-3"
                >
                  <div>
                    <p className="font-medium">{lead.full_name}</p>
                    <p className="text-sm text-[#6b675d]">{lead.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setArchived(lead.id, false)}
                    className="rounded-full border border-[#d2c8b5] px-3 py-1 text-sm font-medium"
                  >
                    Restore
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showAddModal ? (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onCreated={(lead) => {
            setLeads((prev) => [lead, ...prev]);
            setSelectedLeadId(lead.id);
          }}
        />
      ) : null}

      {showPasswordModal ? <ChangePasswordModal onClose={() => setShowPasswordModal(false)} /> : null}

      {pendingLostDrop ? (
        <LostReasonModal
          onClose={() => setPendingLostDrop(null)}
          onConfirm={(reason) => {
            void moveLeadStatus(pendingLostDrop, "closed_lost", reason);
            setPendingLostDrop(null);
          }}
        />
      ) : null}
    </div>
  );
}
