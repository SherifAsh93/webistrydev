import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { employee_id?: string };

  if (!body.employee_id) {
    return NextResponse.json({ error: "employee_id مطلوب" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("employee_devices")
    .delete()
    .eq("employee_id", body.employee_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
