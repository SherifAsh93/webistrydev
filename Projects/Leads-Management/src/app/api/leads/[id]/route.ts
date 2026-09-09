import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { LeadInput } from "@/types/lead";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = (await request.json()) as Partial<LeadInput>;

  if (!body.name?.trim() || !body.phone?.trim()) {
    return NextResponse.json(
      { error: "الاسم ورقم الهاتف مطلوبان" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("leads")
    .update({
      name: body.name.trim(),
      phone: body.phone.trim(),
      answers: body.answers ?? {},
      employee_name: body.employee_name ?? "",
      employee_phone: body.employee_phone ?? "",
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lead: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await supabaseAdmin
    .from("leads")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
