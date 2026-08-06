import { NextResponse } from "next/server";
import { addLeadNote, getLeadNotes } from "@/lib/leads-store";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const notes = await getLeadNotes(id);
  return NextResponse.json({ notes });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const noteBody = typeof body?.body === "string" ? body.body.trim() : "";

  if (!noteBody) {
    return NextResponse.json({ error: "Note text is required." }, { status: 400 });
  }

  const note = await addLeadNote(id, noteBody, user.email ?? null);
  return NextResponse.json({ note });
}
