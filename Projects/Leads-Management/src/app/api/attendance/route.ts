import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { todayInCairo } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") || todayInCairo();

  const [employeesRes, attendanceRes] = await Promise.all([
    supabaseAdmin
      .from("employees")
      .select("id, name, phone")
      .eq("is_manager", false)
      .order("created_at", { ascending: true }),
    supabaseAdmin.from("attendance").select("employee_id, checked_in_at").eq("attendance_date", date),
  ]);

  const firstError = employeesRes.error || attendanceRes.error;
  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  const checkedInByEmployee = new Map(
    (attendanceRes.data ?? []).map((a) => [a.employee_id, a.checked_in_at])
  );

  const employees = (employeesRes.data ?? []).map((employee) => ({
    employee_id: employee.id,
    name: employee.name,
    phone: employee.phone,
    present: checkedInByEmployee.has(employee.id),
    checked_in_at: checkedInByEmployee.get(employee.id) ?? null,
  }));

  return NextResponse.json({ date, employees });
}
