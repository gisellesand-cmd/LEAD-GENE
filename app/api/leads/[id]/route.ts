import { NextResponse } from "next/server";
import { updateLead, type Lead, type LeadStatus } from "@/lib/leads-store";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "closed_won",
  "closed_lost",
  "manual_entry",
];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const updates: Partial<Lead> = {};

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    // PRD Section 14: lost_reason is required by the UI when moving a card
    // to closed_lost — enforced here too since this is the only write path.
    if (body.status === "closed_lost" && !body.lost_reason && !body.lost_reason?.trim()) {
      return NextResponse.json(
        { error: "A reason is required when marking a lead as closed lost." },
        { status: 400 },
      );
    }
    updates.status = body.status;
  }

  if (body.notes !== undefined) updates.notes = String(body.notes);
  if (body.lost_reason !== undefined) updates.lost_reason = body.lost_reason ? String(body.lost_reason) : null;
  if (body.pipeline_order !== undefined) updates.pipeline_order = Number(body.pipeline_order);
  if (body.archived !== undefined) updates.archived = Boolean(body.archived);
  if (body.assigned_to !== undefined) updates.assigned_to = body.assigned_to ? String(body.assigned_to) : null;
  if (body.last_contacted_at !== undefined) updates.last_contacted_at = body.last_contacted_at;

  const lead = await updateLead(id, updates);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({ lead });
}
