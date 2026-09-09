import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Project } from "@/types/project";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("id, name, title, description, image_url, fields, created_at")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ project: data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = (await request.json()) as Partial<Project>;

  const { data, error } = await supabaseAdmin
    .from("projects")
    .update({
      name: body.name ?? "",
      title: body.title ?? "",
      description: body.description ?? "",
      image_url: body.image_url ?? null,
      fields: body.fields ?? [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select("id, name, title, description, image_url, fields, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await supabaseAdmin
    .from("projects")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
