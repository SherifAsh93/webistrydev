import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const deviceToken = request.nextUrl.searchParams.get("device_token")?.trim();
  if (!deviceToken) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const { data: device, error: deviceError } = await supabaseAdmin
    .from("employee_devices")
    .select("employee_id")
    .eq("device_token", deviceToken)
    .maybeSingle();

  if (deviceError) {
    return NextResponse.json({ error: deviceError.message }, { status: 500 });
  }
  if (!device) {
    return NextResponse.json({ code: "NEEDS_LOGIN" }, { status: 401 });
  }

  const [assignmentsRes, leadsRes] = await Promise.all([
    supabaseAdmin
      .from("project_employees")
      .select("project_id, projects(id, name, title)")
      .eq("employee_id", device.employee_id),
    supabaseAdmin
      .from("leads")
      .select("project_id")
      .eq("employee_id", device.employee_id),
  ]);

  if (assignmentsRes.error) {
    return NextResponse.json({ error: assignmentsRes.error.message }, { status: 500 });
  }

  const leadCountByProject = new Map<string, number>();
  for (const lead of leadsRes.data ?? []) {
    leadCountByProject.set(
      lead.project_id,
      (leadCountByProject.get(lead.project_id) ?? 0) + 1
    );
  }

  type AssignmentRow = {
    project_id: string;
    projects: { id: string; name: string; title: string }[] | null;
  };

  const projects = ((assignmentsRes.data ?? []) as unknown as AssignmentRow[])
    .map((a) => (Array.isArray(a.projects) ? a.projects[0] : a.projects))
    .filter((p): p is { id: string; name: string; title: string } => Boolean(p))
    .map((p) => ({
      id: p.id,
      name: p.name,
      title: p.title,
      lead_count: leadCountByProject.get(p.id) ?? 0,
    }));

  return NextResponse.json({ projects });
}
