import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { ATTENDANCE_LOCATION } from "@/lib/constants";
import { distanceMeters, monthStartInCairo, todayInCairo } from "@/lib/geo";
import { resolveOrClaimEmployee } from "@/lib/employeeAuth";

export const dynamic = "force-dynamic";

async function employeeMonthCount(employeeId: string) {
  const { count } = await supabaseAdmin
    .from("attendance")
    .select("id", { count: "exact", head: true })
    .eq("employee_id", employeeId)
    .gte("attendance_date", monthStartInCairo());

  return count ?? 0;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    device_token?: string;
    name?: string;
    phone?: string;
    lat?: number;
    lng?: number;
  };

  const deviceToken = body.device_token?.trim();
  const lat = body.lat;
  const lng = body.lng;

  if (!deviceToken || typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const result = await resolveOrClaimEmployee(deviceToken, body.name, body.phone);

  if (result.status === "needs_login") {
    return NextResponse.json({ code: "NEEDS_LOGIN" });
  }
  if (result.status === "invalid_credentials") {
    return NextResponse.json(
      { code: "INVALID_CREDENTIALS", error: "الاسم أو رقم الهاتف غير صحيح" },
      { status: 401 }
    );
  }
  if (result.status === "already_claimed") {
    return NextResponse.json(
      {
        code: "ALREADY_CLAIMED",
        error: "هذا الحساب مسجّل بالفعل على جهاز آخر، تواصل مع المسؤول",
      },
      { status: 409 }
    );
  }
  if (result.status === "manager_blocked") {
    return NextResponse.json(
      { code: "MANAGER_BLOCKED", error: "المديرون يستخدمون لوحة التحكم مباشرة ولا يسجّلون حضوراً" },
      { status: 403 }
    );
  }
  if (result.status === "error") {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  const employeeId = result.employee.id;

  const distance = distanceMeters(
    lat,
    lng,
    ATTENDANCE_LOCATION.lat,
    ATTENDANCE_LOCATION.lng
  );

  if (distance > ATTENDANCE_LOCATION.radiusMeters) {
    return NextResponse.json(
      { code: "OUT_OF_RANGE", error: "أنت خارج نطاق الموقع المحدد لتسجيل الحضور", distance }
    );
  }

  const attendanceDate = todayInCairo();

  const { data: existingAttendance } = await supabaseAdmin
    .from("attendance")
    .select("checked_in_at")
    .eq("employee_id", employeeId)
    .eq("attendance_date", attendanceDate)
    .maybeSingle();

  if (existingAttendance) {
    return NextResponse.json({
      code: "ALREADY_MARKED",
      checked_in_at: existingAttendance.checked_in_at,
      employee_name: result.employee.name,
      month_count: await employeeMonthCount(employeeId),
    });
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("attendance")
    .insert({ employee_id: employeeId, attendance_date: attendanceDate, lat, lng })
    .select("checked_in_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    code: "MARKED",
    checked_in_at: inserted.checked_in_at,
    employee_name: result.employee.name,
    month_count: await employeeMonthCount(employeeId),
  });
}
