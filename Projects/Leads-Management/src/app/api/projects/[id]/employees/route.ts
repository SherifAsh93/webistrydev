import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabaseAdmin
    .from("project_employees")
    .select("id, employee:employees(id, name, phone)")
    .eq("project_id", params.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const employees = (data ?? [])
    .map((row) => {
      const employee = Array.isArray(row.employee) ? row.employee[0] : row.employee;
      if (!employee) return null;
      return { assignment_id: row.id, ...employee };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  return NextResponse.json({ employees });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = (await request.json()) as { employee_id?: string };

  if (!body.employee_id) {
    return NextResponse.json({ error: "employee_id مطلوب" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("project_employees")
    .insert({ project_id: params.id, employee_id: body.employee_id })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "الموظف معيّن لهذا المشروع بالفعل" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ assignment: data }, { status: 201 });
}
