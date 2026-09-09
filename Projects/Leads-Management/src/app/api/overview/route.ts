import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const [employeesRes, projectsRes, leadsRes, assignmentsRes] = await Promise.all([
    supabaseAdmin.from("employees").select("id, name, phone").order("created_at", { ascending: true }),
    supabaseAdmin.from("projects").select("id, name"),
    supabaseAdmin.from("leads").select("id, project_id, employee_id"),
    supabaseAdmin.from("project_employees").select("project_id, employee_id"),
  ]);

  const firstError =
    employeesRes.error || projectsRes.error || leadsRes.error || assignmentsRes.error;
  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  const employees = employeesRes.data ?? [];
  const projects = projectsRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const assignments = assignmentsRes.data ?? [];

  const projectNameById = new Map(projects.map((p) => [p.id, p.name]));

  const employeeOverview = employees.map((employee) => {
    const assignedProjectIds = assignments
      .filter((a) => a.employee_id === employee.id)
      .map((a) => a.project_id);

    const leadsByProject = new Map<string, number>();
    for (const lead of leads) {
      if (lead.employee_id !== employee.id) continue;
      leadsByProject.set(lead.project_id, (leadsByProject.get(lead.project_id) ?? 0) + 1);
    }

    return {
      id: employee.id,
      name: employee.name,
      phone: employee.phone,
      total_leads: Array.from(leadsByProject.values()).reduce((a, b) => a + b, 0),
      projects: assignedProjectIds.map((id) => ({
        project_id: id,
        project_name: projectNameById.get(id) ?? "",
        lead_count: leadsByProject.get(id) ?? 0,
      })),
    };
  });

  return NextResponse.json({
    totals: {
      projects: projects.length,
      employees: employees.length,
      leads: leads.length,
    },
    employees: employeeOverview,
  });
}
