import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "admin_auth";

function isPublicApi(pathname: string, method: string) {
  // Client-facing lead submission — no auth.
  if (pathname === "/api/leads" && method === "POST") return true;
  // Public form reads a project's own config (title/fields/image) to render itself.
  if (/^\/api\/projects\/[^/]+$/.test(pathname) && method === "GET") return true;
  // Employee-facing GPS attendance check-in — no admin login, runs on the employee's own phone.
  if (pathname === "/api/attendance/checkin" && method === "POST") return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const protectedPage = pathname.startsWith("/admin");
  const protectedApi =
    (pathname.startsWith("/api/projects") ||
      pathname.startsWith("/api/employees") ||
      pathname.startsWith("/api/leads") ||
      pathname.startsWith("/api/upload") ||
      pathname.startsWith("/api/overview") ||
      pathname.startsWith("/api/attendance")) &&
    !isPublicApi(pathname, method);

  if (!protectedPage && !protectedApi) {
    return NextResponse.next();
  }

  const isAuthed = request.cookies.get(AUTH_COOKIE)?.value === "1";

  if (isAuthed) {
    return NextResponse.next();
  }

  if (protectedApi) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/projects/:path*",
    "/api/employees/:path*",
    "/api/leads/:path*",
    "/api/upload",
    "/api/overview",
    "/api/attendance/:path*",
  ],
};
