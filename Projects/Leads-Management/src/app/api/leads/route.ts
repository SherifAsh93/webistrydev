import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { LeadInput } from "@/types/lead";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("project_id");
  if (!projectId) {
    return NextResponse.json({ error: "project_id مطلوب" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: data });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<LeadInput>;

  if (!body.project_id) {
    return NextResponse.json({ error: "project_id مطلوب" }, { status: 400 });
  }

  if (!body.name?.trim() || !body.phone?.trim()) {
    return NextResponse.json(
      { error: "الاسم ورقم الهاتف مطلوبان" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("leads")
    .insert({
      project_id: body.project_id,
      employee_id: body.employee_id ?? null,
      name: body.name.trim(),
      phone: body.phone.trim(),
      answers: body.answers ?? {},
      employee_name: body.employee_name ?? "",
      employee_phone: body.employee_phone ?? "",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lead: data }, { status: 201 });
}
