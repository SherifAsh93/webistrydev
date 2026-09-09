import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    is_manager?: boolean;
  };

  if (!body.name?.trim() || !body.phone?.trim()) {
    return NextResponse.json(
      { error: "الاسم ورقم الهاتف مطلوبان" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("employees")
    .update({
      name: body.name.trim(),
      phone: body.phone.trim(),
      is_manager: body.is_manager ?? false,
    })
    .eq("id", params.id)
    .select("id, name, phone, is_manager")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ employee: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await supabaseAdmin
    .from("employees")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
