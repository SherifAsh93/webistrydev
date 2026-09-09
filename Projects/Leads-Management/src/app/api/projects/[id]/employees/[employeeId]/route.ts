import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; employeeId: string } }
) {
  const { error } = await supabaseAdmin
    .from("project_employees")
    .delete()
    .eq("project_id", params.id)
    .eq("employee_id", params.employeeId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
