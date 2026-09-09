import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("employees")
    .select("id, name, phone, is_manager")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ employees: data });
}

export async function POST(request: NextRequest) {
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
    .insert({
      name: body.name.trim(),
      phone: body.phone.trim(),
      is_manager: body.is_manager ?? false,
    })
    .select("id, name, phone, is_manager")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ employee: data }, { status: 201 });
}
