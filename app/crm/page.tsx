"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import type { Lead, LeadNote, LeadSource, LeadStatus } from "@/lib/leads-store";

const stages: Array<{ key: LeadStatus; label: string }> = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "closed_won", label: "Closed Won" },
  { key: "closed_lost", label: "Closed Lost" },
  { key: "meta_lead", label: "Meta Leads" },
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
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#6f8a5f]">{sourceLabel[lead.source]}</p>
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
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{stage.label}</h2>
        <span className="rounded-full bg-[#f5efe0] px-3 py-1 text-xs font-semibold text-[#4b5b41]">{leads.length}</span>
      </div>
      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
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
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    product: "",
    date_of_birth: "",
    smoker: "",
    message: "",
    consent: false,
  });
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
        body: JSON.stringify({
          ...form,
          date_of_birth: form.date_of_birth || null,
          smoker: form.smoker === "" ? null : form.smoker === "Y",
          source: "manual",
        }),
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
          <label className="text-sm font-medium text-[#4b4a47]">Date of birth</label>
          <input
            type="date"
            value={form.date_of_birth}
            onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
            className="w-full rounded-xl border border-[#d4cdbd] px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#4b4a47]">Smoker / nicotine use</label>
          <select
            value={form.smoker}
            onChange={(e) => setForm((f) => ({ ...f, smoker: e.target.value }))}
            className="w-full rounded-xl border border-[#d4cdbd] px-3 py-2 text-sm"
          >
            <option value="">Unknown</option>
            <option value="N">Non-smoker / No nicotine use</option>
            <option value="Y">Smoker / Nicotine user</option>
          </select>
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

function DeleteConfirmModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm space-y-4 rounded-[1.5rem] border border-[#e0d7c3] bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Do you really want to delete this contact?</h2>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-[#d2c8b5] px-4 py-2 text-sm font-medium">
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-[#8a3b2b] px-4 py-2 text-sm font-medium text-white"
          >
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
}

function DeletedContactsModal({
  leads,
  onClose,
  onRestore,
  onPermanentlyDelete,
}: {
  leads: Lead[];
  onClose: () => void;
  onRestore: (id: string) => void;
  onPermanentlyDelete: (id: string) => void;
}) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md space-y-4 rounded-[1.5rem] border border-[#e0d7c3] bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Deleted contacts</h2>
          <button type="button" onClick={onClose} className="text-sm text-[#6b675d] hover:underline">
            Close
          </button>
        </div>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {leads.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#ddd2bf] p-3 text-sm text-[#7b776d]">No deleted contacts.</p>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between rounded-xl border border-[#ebe3d2] bg-[#fcfbf7] p-3">
                <div>
                  <p className="font-medium">{lead.full_name}</p>
                  <p className="text-sm text-[#6b675d]">{lead.email}</p>
                </div>
                {confirmingId === lead.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8a3b2b]">Delete forever?</span>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="rounded-full border border-[#d2c8b5] px-3 py-1 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onPermanentlyDelete(lead.id);
                        setConfirmingId(null);
                      }}
                      className="rounded-full bg-[#8a3b2b] px-3 py-1 text-sm font-medium text-white"
                    >
                      Yes, delete
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onRestore(lead.id)}
                      className="rounded-full border border-[#d2c8b5] px-3 py-1 text-sm font-medium"
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(lead.id)}
                      className="rounded-full border border-[#8a3b2b] px-3 py-1 text-sm font-medium text-[#8a3b2b]"
                    >
                      Delete forever
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
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
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [noteHistory, setNoteHistory] = useState<LeadNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

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

  useEffect(() => {
    if (!selectedLeadId) {
      setNoteHistory([]);
      return;
    }

    setNewNote("");
    setNotesLoading(true);
    fetch(`/api/leads/${selectedLeadId}/notes`)
      .then((response) => response.json())
      .then((data) => setNoteHistory(data.notes ?? []))
      .finally(() => setNotesLoading(false));
  }, [selectedLeadId]);

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

  const handleAddNote = async () => {
    if (!selectedLead || !newNote.trim()) return;
    setSavingNote(true);
    try {
      const response = await fetch(`/api/leads/${selectedLead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newNote.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save note.");
      setNoteHistory((prev) => [data.note as LeadNote, ...prev]);
      setNewNote("");
    } catch {
      // Leave the textarea as-is; the user can retry the save.
    } finally {
      setSavingNote(false);
    }
  };

  // Without this, dnd-kit starts a drag on the tiniest pointer movement —
  // which happens on nearly every real click — and hijacks the "select
  // lead" button before its onClick ever fires.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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

  const hardDeleteLead = async (leadId: string) => {
    const previous = leads;
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
    try {
      const response = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed.");
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
            <p className="mt-2 text-2xl font-semibold">{leads.filter((lead) => !lead.archived).length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#e0d7c3] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#6b675d]">New</p>
            <p className="mt-2 text-2xl font-semibold">{leads.filter((lead) => lead.status === "new" && !lead.archived).length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#e0d7c3] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#6b675d]">Qualified</p>
            <p className="mt-2 text-2xl font-semibold">{leads.filter((lead) => lead.status === "qualified" && !lead.archived).length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#e0d7c3] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#6b675d]">Closed won</p>
            <p className="mt-2 text-2xl font-semibold">{leads.filter((lead) => lead.status === "closed_won" && !lead.archived).length}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr] xl:items-start">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4b5b41]">Pipeline</p>
              <button
                type="button"
                onClick={() => setShowDeletedModal(true)}
                className="rounded-full border border-[#d2c8b5] bg-white px-4 py-1.5 text-xs font-medium"
              >
                View deleted{archivedLeads.length > 0 ? ` (${archivedLeads.length})` : ""}
              </button>
            </div>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {stages.map((stage) => (
                  <StageColumn
                    key={stage.key}
                    stage={stage}
                    leads={leads.filter((lead) => lead.status === stage.key && !lead.archived)}
                    selectedLeadId={selectedLeadId}
                    onSelect={setSelectedLeadId}
                    onDelete={(id) => setPendingDeleteId(id)}
                  />
                ))}
              </div>
            </DndContext>
          </div>

          <div className="rounded-[1.5rem] border border-[#e0d7c3] bg-white p-5 shadow-sm xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">
            {loading ? (
              <p className="text-sm text-[#6b675d]">Loading leads...</p>
            ) : selectedLead ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#4b5b41]">Lead details</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold">{selectedLead.full_name}</h2>
                    {selectedLead.application_submitted_at ? (
                      <span className="whitespace-nowrap rounded-full bg-[#c7a05f] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                        Applied —{" "}
                        {new Date(selectedLead.application_submitted_at).toLocaleDateString("en-CA", {
                          dateStyle: "medium",
                        })}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-[#6b675d]">
                    Received {new Date(selectedLead.created_at).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f8f3e7] p-4 text-sm text-[#4b4a47]">
                  <p><strong>Email:</strong> {selectedLead.email}</p>
                  <p className="mt-2"><strong>Phone:</strong> {selectedLead.phone}</p>
                  <p className="mt-2"><strong>Product:</strong> {selectedLead.product_interest}</p>
                  {selectedLead.date_of_birth ? (
                    <p className="mt-2"><strong>Date of birth:</strong> {selectedLead.date_of_birth}</p>
                  ) : null}
                  {selectedLead.smoker !== null ? (
                    <p className="mt-2">
                      <strong>Smoker:</strong> {selectedLead.smoker ? "Yes" : "No"}
                    </p>
                  ) : null}
                  {selectedLead.company_name ? (
                    <p className="mt-2">
                      <strong>Quoter:</strong> {selectedLead.company_name}
                      {selectedLead.insurer_product_name ? ` (${selectedLead.insurer_product_name})` : ""}
                    </p>
                  ) : null}
                  <p className="mt-2"><strong>Source:</strong> {sourceLabel[selectedLead.source]}</p>
                  <p className="mt-2"><strong>Status:</strong> {selectedLead.status}</p>
                  {selectedLead.lost_reason ? (
                    <p className="mt-2"><strong>Lost reason:</strong> {selectedLead.lost_reason}</p>
                  ) : null}
                </div>
                {selectedLead.quote_results && selectedLead.quote_results.length > 0 ? (
                  <div>
                    <p className="text-sm font-semibold">What the user saw</p>
                    <div className="mt-2 space-y-2">
                      {selectedLead.quote_results.slice(0, 3).map((quote, index) => (
                        <div
                          key={`seen-${quote.companyName}-${index}`}
                          className="flex items-center justify-between rounded-xl border border-[#ebe3d2] bg-[#faf7f0] p-3 text-sm"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-[#4b4a47]">{quote.companyName}</p>
                              {index === 0 ? (
                                <span className="whitespace-nowrap rounded-full bg-[#1d4d31] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                  Best rate
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-[#6b675d]">{quote.productName}</p>
                          </div>
                          <p className="font-semibold text-[#4b5b41]">{quote.monthlyPremium}/mo</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold">Message</p>
                    <p className="mt-2 text-sm text-[#5f5c54]">{selectedLead.message || "No message provided."}</p>
                  </div>
                )}
                {selectedLead.quote_results && selectedLead.quote_results.length > 0 ? (
                  <div>
                    <p className="text-sm font-semibold">All quotes compared</p>
                    <div className="mt-2 space-y-2">
                      {selectedLead.quote_results.map((quote, index) => (
                        <div
                          key={`${quote.companyName}-${index}`}
                          className="flex items-center justify-between rounded-xl border border-[#ebe3d2] bg-[#faf7f0] p-3 text-sm"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-[#4b4a47]">{quote.companyName}</p>
                              {index === 0 ? (
                                <span className="whitespace-nowrap rounded-full bg-[#1d4d31] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                  Best rate
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-[#6b675d]">{quote.productName}</p>
                          </div>
                          <p className="font-semibold text-[#4b5b41]">{quote.monthlyPremium}/mo</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {selectedLead.application_data ? (
                  <div>
                    <p className="text-sm font-semibold">Application</p>
                    <div className="mt-2 space-y-4 rounded-xl border border-[#ebe3d2] bg-[#faf7f0] p-3 text-sm">
                      {selectedLead.applied_company_name ? (
                        <p>
                          <strong>Applying for:</strong> {selectedLead.applied_company_name}
                          {selectedLead.applied_product_name ? ` (${selectedLead.applied_product_name})` : ""}
                          {selectedLead.applied_monthly_premium ? ` — ${selectedLead.applied_monthly_premium}/mo` : ""}
                        </p>
                      ) : null}

                      <div className="space-y-1">
                        <p className="font-semibold text-[#4b4a47]">Personal</p>
                        <p><strong>Education:</strong> {selectedLead.application_data.personal.education || "—"}</p>
                        <p><strong>Marital status:</strong> {selectedLead.application_data.personal.maritalStatus || "—"}</p>
                        <p>
                          <strong>Address:</strong> {selectedLead.application_data.personal.primaryAddress.street},{" "}
                          {selectedLead.application_data.personal.primaryAddress.city},{" "}
                          {selectedLead.application_data.personal.primaryAddress.province}{" "}
                          {selectedLead.application_data.personal.primaryAddress.postalCode}
                        </p>
                        <p>
                          <strong>ID:</strong> {selectedLead.application_data.personal.identification.type || "—"} (
                          {selectedLead.application_data.personal.identification.provinceOfIssue}) #
                          {selectedLead.application_data.personal.identification.number}, exp.{" "}
                          {selectedLead.application_data.personal.identification.expiryDate}
                        </p>
                        <p>
                          <strong>Citizenship/residency:</strong>{" "}
                          {selectedLead.application_data.personal.citizenshipStatus || "—"}
                        </p>
                        <p>
                          <strong>Born in:</strong> {selectedLead.application_data.personal.provinceOfBirth || "—"},{" "}
                          {selectedLead.application_data.personal.countryOfBirth}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-semibold text-[#4b4a47]">Insurance history</p>
                        <p>
                          <strong>Existing coverage:</strong>{" "}
                          {selectedLead.application_data.insuranceHistory.hasCoverageInForceOrPending ? "Yes" : "No"}
                        </p>
                        <p>
                          <strong>Ever declined/rated/modified:</strong>{" "}
                          {selectedLead.application_data.insuranceHistory.everDeclinedRatedModified ? "Yes" : "No"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-semibold text-[#4b4a47]">Financial & occupation</p>
                        <p>
                          <strong>Occupation:</strong> {selectedLead.application_data.financialOccupation.occupationTitle || "—"}{" "}
                          at {selectedLead.application_data.financialOccupation.employerName || "—"} (since{" "}
                          {selectedLead.application_data.financialOccupation.employmentStartDate || "—"})
                        </p>
                        <p>
                          <strong>Income:</strong> ${selectedLead.application_data.financialOccupation.annualEarnedIncomeCad.toLocaleString()} +{" "}
                          ${selectedLead.application_data.financialOccupation.otherIncomeSourcesCad.toLocaleString()} other
                        </p>
                        <p>
                          <strong>Net worth:</strong> ${selectedLead.application_data.financialOccupation.netWorthCanadaCad.toLocaleString()} CA
                          {selectedLead.application_data.financialOccupation.netWorthForeignCad
                            ? ` / $${selectedLead.application_data.financialOccupation.netWorthForeignCad.toLocaleString()} foreign`
                            : ""}
                        </p>
                        <p>
                          <strong>Bankruptcy (5y):</strong>{" "}
                          {selectedLead.application_data.financialOccupation.bankruptcyLast5Years ? "Yes" : "No"} ·{" "}
                          <strong>US tax resident:</strong>{" "}
                          {selectedLead.application_data.financialOccupation.usCitizenOrTaxResident ? "Yes" : "No"} ·{" "}
                          <strong>Other tax residency:</strong>{" "}
                          {selectedLead.application_data.financialOccupation.taxResidentOtherThanCanadaUs ? "Yes" : "No"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-semibold text-[#4b4a47]">Lifestyle</p>
                        <p>
                          <strong>Last tobacco/nicotine use:</strong>{" "}
                          {selectedLead.application_data.lifestyle.lastTobaccoNicotineUse || "—"}
                        </p>
                        <p>
                          <strong>Cannabis:</strong> {selectedLead.application_data.lifestyle.cannabisUse ? "Yes" : "No"} ·{" "}
                          <strong>Non-prescribed drugs (10y):</strong>{" "}
                          {selectedLead.application_data.lifestyle.nonPrescribedDrugsLast10Years ? "Yes" : "No"}
                        </p>
                        <p>
                          <strong>Highway violations (3y):</strong>{" "}
                          {selectedLead.application_data.lifestyle.highwaySafetyViolationsLast3Years ? "Yes" : "No"} ·{" "}
                          <strong>Hazardous activities:</strong>{" "}
                          {selectedLead.application_data.lifestyle.hazardousActivities ? "Yes" : "No"} ·{" "}
                          <strong>Pilot/crew (5y):</strong>{" "}
                          {selectedLead.application_data.lifestyle.pilotOrCrewLast5Years ? "Yes" : "No"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-semibold text-[#4b4a47]">Medical</p>
                        <p>
                          <strong>Height:</strong> {selectedLead.application_data.medical.heightFeet}
                          {"'"}
                          {selectedLead.application_data.medical.heightInches}
                          {"\""} · <strong>Weight:</strong> {selectedLead.application_data.medical.weightLb} lb
                        </p>
                        <p>
                          <strong>Physician:</strong> {selectedLead.application_data.medical.hasPhysician ? "Yes" : "No"}
                          {selectedLead.application_data.medical.hasPhysician
                            ? ` — ${selectedLead.application_data.medical.physicianName ?? ""} (${selectedLead.application_data.medical.physicianAddress ?? ""})`
                            : ""}
                        </p>
                        <p>
                          <strong>Conditions:</strong>{" "}
                          {Object.entries(selectedLead.application_data.medical.conditions)
                            .filter(([, value]) => value)
                            .map(([key]) => key)
                            .join(", ") || "None reported"}
                        </p>
                        <p>
                          <strong>Hospital/tests/surgery (past year):</strong>{" "}
                          {selectedLead.application_data.medical.hospitalTestsSurgeryLastYear ? "Yes" : "No"} ·{" "}
                          <strong>Unlisted medication:</strong>{" "}
                          {selectedLead.application_data.medical.currentlyTakingUnlistedMedication ? "Yes" : "No"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-semibold text-[#4b4a47]">Beneficiaries</p>
                        {selectedLead.application_data.beneficiaries.primary.map((beneficiary, index) => (
                          <p key={`beneficiary-${index}`}>
                            <strong>{beneficiary.fullName || "—"}</strong> (
                            {beneficiary.relationship === "Other" ? beneficiary.relationshipOther : beneficiary.relationship}),{" "}
                            {beneficiary.sharePercent}% — born {beneficiary.dateOfBirth}
                          </p>
                        ))}
                        <p>
                          <strong>Contingent beneficiary wanted:</strong>{" "}
                          {selectedLead.application_data.beneficiaries.wantsContingent ? "Yes" : "No"} ·{" "}
                          <strong>Minor beneficiary:</strong>{" "}
                          {selectedLead.application_data.beneficiaries.anyBeneficiaryIsMinor ? "Yes" : "No"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-semibold text-[#4b4a47]">Policy purpose</p>
                        <p><strong>Purpose:</strong> {selectedLead.application_data.policySpecific.purpose}</p>
                        <p>
                          <strong>Details:</strong>{" "}
                          {Object.entries(selectedLead.application_data.policySpecific.details)
                            .filter(([, value]) => value)
                            .map(([key]) => key)
                            .join(", ") || "No additional details selected"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-semibold text-[#4b4a47]">How they heard about us</p>
                        <p>
                          {Object.entries(selectedLead.application_data.hearAboutUs)
                            .filter(([key, value]) => key !== "otherSpecify" && value)
                            .map(([key]) => key)
                            .join(", ") || "Not specified"}
                          {selectedLead.application_data.hearAboutUs.otherSpecify
                            ? ` (${selectedLead.application_data.hearAboutUs.otherSpecify})`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div>
                  <p className="text-sm font-semibold">Notes</p>
                  <div className="mt-2 max-h-64 space-y-3 overflow-y-auto">
                    {notesLoading ? (
                      <p className="text-sm text-[#7b776d]">Loading notes...</p>
                    ) : noteHistory.length === 0 ? (
                      <p className="text-sm text-[#7b776d]">No notes yet.</p>
                    ) : (
                      noteHistory.map((note) => (
                        <div key={note.id} className="rounded-2xl border border-[#ebe3d2] bg-[#faf7f0] p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8a8572]">
                            {new Date(note.created_at).toLocaleString()}
                            {note.created_by ? ` · ${note.created_by}` : ""}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-[#4b4a47]">{note.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="mt-3 min-h-20 w-full rounded-2xl border border-[#d4cdbd] p-3 text-sm"
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={savingNote || !newNote.trim()}
                      className="rounded-full bg-[#1d4d31] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    >
                      {savingNote ? "Saving..." : "Add note"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#6b675d]">No lead selected.</p>
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

      {showDeletedModal ? (
        <DeletedContactsModal
          leads={archivedLeads}
          onClose={() => setShowDeletedModal(false)}
          onRestore={(id) => setArchived(id, false)}
          onPermanentlyDelete={(id) => void hardDeleteLead(id)}
        />
      ) : null}

      {pendingLostDrop ? (
        <LostReasonModal
          onClose={() => setPendingLostDrop(null)}
          onConfirm={(reason) => {
            void moveLeadStatus(pendingLostDrop, "closed_lost", reason);
            setPendingLostDrop(null);
          }}
        />
      ) : null}

      {pendingDeleteId ? (
        <DeleteConfirmModal
          onClose={() => setPendingDeleteId(null)}
          onConfirm={() => {
            void setArchived(pendingDeleteId, true);
            setPendingDeleteId(null);
          }}
        />
      ) : null}
    </div>
  );
}
