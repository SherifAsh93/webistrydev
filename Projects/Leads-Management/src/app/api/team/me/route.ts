import { NextRequest, NextResponse } from "next/server";
import { resolveOrClaimEmployee } from "@/lib/employeeAuth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    device_token?: string;
    name?: string;
    phone?: string;
  };

  const deviceToken = body.device_token?.trim();
  if (!deviceToken) {
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
      { code: "MANAGER_BLOCKED", error: "المديرون يستخدمون لوحة التحكم مباشرة" },
      { status: 403 }
    );
  }
  if (result.status === "error") {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json({ code: "OK", employee: result.employee });
}
