import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("id, name, title, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: data });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { name?: string };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "اسم المشروع مطلوب" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("projects")
    .insert({ name: body.name.trim() })
    .select("id, name, title, description, image_url, fields, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data }, { status: 201 });
}
