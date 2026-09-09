import { supabaseAdmin } from "@/lib/supabase";

export type ResolveResult =
  | { status: "resolved"; employee: { id: string; name: string; phone: string } }
  | { status: "needs_login" }
  | { status: "invalid_credentials" }
  | { status: "already_claimed" }
  | { status: "manager_blocked" }
  | { status: "error"; message: string };

// A device is "logged in" once its token is linked to an employee in
// employee_devices. Logging in for the first time requires proving you
// are that employee (name + phone), so a coworker can't claim your name.
export async function resolveOrClaimEmployee(
  deviceToken: string,
  name?: string,
  phone?: string
): Promise<ResolveResult> {
  const { data: existingDevice, error: deviceError } = await supabaseAdmin
    .from("employee_devices")
    .select("employee_id")
    .eq("device_token", deviceToken)
    .maybeSingle();

  if (deviceError) {
    return { status: "error", message: deviceError.message };
  }

  if (existingDevice) {
    const { data: employee, error } = await supabaseAdmin
      .from("employees")
      .select("id, name, phone, is_manager")
      .eq("id", existingDevice.employee_id)
      .single();

    if (error || !employee) {
      return { status: "error", message: error?.message ?? "الحساب غير موجود" };
    }
    // Guards against a device that was bound before the employee was
    // later flagged as a manager (e.g. رنا) — managers never get GPS attendance.
    if (employee.is_manager) {
      return { status: "manager_blocked" };
    }
    return { status: "resolved", employee };
  }

  const trimmedName = name?.trim();
  const trimmedPhone = phone?.trim();

  if (!trimmedName || !trimmedPhone) {
    return { status: "needs_login" };
  }

  const { data: matchedEmployee, error: matchError } = await supabaseAdmin
    .from("employees")
    .select("id, name, phone")
    .eq("name", trimmedName)
    .eq("phone", trimmedPhone)
    .eq("is_manager", false)
    .maybeSingle();

  if (matchError) {
    return { status: "error", message: matchError.message };
  }

  if (!matchedEmployee) {
    return { status: "invalid_credentials" };
  }

  const { data: alreadyClaimed, error: claimedError } = await supabaseAdmin
    .from("employee_devices")
    .select("employee_id")
    .eq("employee_id", matchedEmployee.id)
    .maybeSingle();

  if (claimedError) {
    return { status: "error", message: claimedError.message };
  }

  if (alreadyClaimed) {
    return { status: "already_claimed" };
  }

  const { error: insertError } = await supabaseAdmin
    .from("employee_devices")
    .insert({ employee_id: matchedEmployee.id, device_token: deviceToken });

  if (insertError) {
    return { status: "error", message: insertError.message };
  }

  return { status: "resolved", employee: matchedEmployee };
}
