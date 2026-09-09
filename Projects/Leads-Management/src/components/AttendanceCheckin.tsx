"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { timeGreeting } from "@/lib/greeting";

const DEVICE_TOKEN_KEY = "attendance_device_token";

type Employee = { id: string; name: string; phone: string };
type TeamProject = { id: string; name: string; title: string; lead_count: number };

type IdentityPhase =
  | "resolving"
  | "needs_login"
  | "ready"
  | "manager_blocked"
  | "identity_error";

type AttendancePhase =
  | "locating"
  | "submitting"
  | "success"
  | "already"
  | "out_of_range"
  | "location_denied"
  | "error";

function getDeviceToken(): string {
  let token = localStorage.getItem(DEVICE_TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(DEVICE_TOKEN_KEY, token);
  }
  return token;
}

function monthMessage(count: number): string {
  if (count <= 1) return "أول يوم حضور هذا الشهر، بداية موفقة!";
  if (count < 10) return "استمر، أنت على الطريق الصحيح!";
  if (count < 20) return "التزام رائع هذا الشهر، أحسنت!";
  return "شهر مليان مجهود، شكراً لك!";
}

export default function AttendanceCheckin() {
  const [identityPhase, setIdentityPhase] = useState<IdentityPhase>("resolving");
  const [identityError, setIdentityError] = useState("");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [attendancePhase, setAttendancePhase] = useState<AttendancePhase>("locating");
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);
  const [monthCount, setMonthCount] = useState(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [attendanceError, setAttendanceError] = useState("");

  const [projects, setProjects] = useState<TeamProject[] | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch(`/api/team/projects?device_token=${getDeviceToken()}`);
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch {
      setProjects([]);
    }
  }, []);

  const runAttendanceCheck = useCallback(() => {
    setAttendancePhase("locating");
    setAttendanceError("");
    if (!navigator.geolocation) {
      setAttendanceError("المتصفح لا يدعم تحديد الموقع");
      setAttendancePhase("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setAttendancePhase("submitting");
        try {
          const res = await fetch("/api/attendance/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              device_token: getDeviceToken(),
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          });
          const data = await res.json();

          if (data.code === "OUT_OF_RANGE") {
            setDistance(data.distance ?? null);
            setAttendancePhase("out_of_range");
            return;
          }
          if (data.code === "ALREADY_MARKED") {
            setCheckedInAt(data.checked_in_at);
            setMonthCount(data.month_count ?? 0);
            setAttendancePhase("already");
            return;
          }
          if (data.code === "MARKED") {
            setCheckedInAt(data.checked_in_at);
            setMonthCount(data.month_count ?? 0);
            setAttendancePhase("success");
            return;
          }
          setAttendanceError(data.error || "حدث خطأ غير متوقع");
          setAttendancePhase("error");
        } catch {
          setAttendanceError("تعذّر الاتصال بالخادم");
          setAttendancePhase("error");
        }
      },
      () => setAttendancePhase("location_denied"),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  const resolveIdentity = useCallback(
    async (credentials?: { name: string; phone: string }) => {
      setIdentityError("");
      try {
        const res = await fetch("/api/team/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_token: getDeviceToken(),
            name: credentials?.name,
            phone: credentials?.phone,
          }),
        });
        const data = await res.json();

        if (data.code === "NEEDS_LOGIN") {
          setIdentityPhase("needs_login");
          return;
        }
        if (data.code === "INVALID_CREDENTIALS" || data.code === "ALREADY_CLAIMED") {
          setIdentityError(data.error);
          setIdentityPhase("needs_login");
          return;
        }
        if (data.code === "MANAGER_BLOCKED") {
          setIdentityPhase("manager_blocked");
          return;
        }
        if (data.code === "OK") {
          setEmployee(data.employee);
          setIdentityPhase("ready");
          runAttendanceCheck();
          loadProjects();
          return;
        }
        setIdentityError(data.error || "حدث خطأ غير متوقع");
        setIdentityPhase("identity_error");
      } catch {
        setIdentityError("تعذّر الاتصال بالخادم");
        setIdentityPhase("identity_error");
      }
    },
    [runAttendanceCheck, loadProjects]
  );

  useEffect(() => {
    resolveIdentity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    resolveIdentity({ name: name.trim(), phone: phone.trim() });
  }

  function leadFormLink(projectId: string) {
    if (!employee) return "#";
    const params = new URLSearchParams({
      project: projectId,
      employee: employee.id,
      emp: employee.name,
      phone: employee.phone,
    });
    return `/form?${params.toString()}`;
  }

  if (identityPhase === "resolving") {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-4 py-10">
          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-primary/10 text-3xl">
            👋
          </div>
          <p className="font-medium text-stone-500">جارِ التحقق من هويتك...</p>
        </div>
      </PageShell>
    );
  }

  if (identityPhase === "needs_login") {
    return (
      <PageShell>
        <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-stone-100">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent" />
          <div className="p-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-3xl">
              👋
            </div>
            <h1 className="mb-1 text-xl font-bold text-stone-800">
              {timeGreeting()}! سجّل دخولك
            </h1>
            <p className="mb-5 text-sm text-stone-500">
              أول مرة فقط — بعد ذلك سيتذكرك هذا الجهاز تلقائياً كل يوم.
            </p>
            {identityError && (
              <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {identityError}
              </p>
            )}
            <form onSubmit={handleLogin} className="flex flex-col gap-3 text-right">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-stone-700">
                  الاسم
                </span>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك بالكامل"
                  required
                  autoFocus
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-stone-700">
                  رقم الهاتف
                </span>
                <input
                  type="tel"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={!name.trim() || !phone.trim()}
                className="mt-2 rounded-2xl bg-primary py-3.5 font-bold text-white shadow-md shadow-primary/20 transition active:scale-95 disabled:opacity-40"
              >
                دخول
              </button>
            </form>
          </div>
        </div>
      </PageShell>
    );
  }

  if (identityPhase === "manager_blocked") {
    return (
      <PageShell>
        <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-xl ring-1 ring-stone-100">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-3xl">
            🔑
          </div>
          <h1 className="mb-2 text-lg font-bold text-stone-800">هذه صفحة الموظفين</h1>
          <p className="text-sm text-stone-500">
            لوحة التحكم من هنا — اضغطي على الشعار بالأعلى 3 مرات.
          </p>
        </div>
      </PageShell>
    );
  }

  if (identityPhase === "identity_error") {
    return (
      <PageShell>
        <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-xl ring-1 ring-stone-100">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
            ⚠️
          </div>
          <h1 className="mb-2 text-lg font-bold text-stone-800">حدث خطأ</h1>
          {identityError && (
            <p className="mb-5 text-sm text-stone-500">{identityError}</p>
          )}
          <button
            onClick={() => resolveIdentity()}
            className="w-full rounded-2xl bg-primary py-3.5 font-bold text-white shadow-md shadow-primary/20 transition active:scale-95"
          >
            إعادة المحاولة
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell wide>
      <div className="mb-5 text-center">
        <h1 className="text-xl font-bold text-stone-800">
          {timeGreeting()} يا {employee?.name} 👋
        </h1>
        <p className="mt-1 text-sm text-stone-500">أهلاً بك في مساحة عملك</p>
      </div>

      <div className="mb-5 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-stone-100">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent" />
        <div className="p-6 text-center">
          {(attendancePhase === "locating" || attendancePhase === "submitting") && (
            <>
              <div className="mx-auto mb-3 flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-primary/10 text-2xl">
                📍
              </div>
              <p className="text-sm font-medium text-stone-600">
                {attendancePhase === "locating"
                  ? "جارِ تحديد موقعك..."
                  : "لحظة، جارِ تسجيل حضورك..."}
              </p>
            </>
          )}

          {(attendancePhase === "success" || attendancePhase === "already") && (
            <>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                ✅
              </div>
              <p className="mb-1 font-bold text-stone-800">
                {attendancePhase === "success"
                  ? "تم تسجيل حضورك بنجاح"
                  : "أنت مسجّل حضورك اليوم بالفعل"}
              </p>
              {checkedInAt && (
                <p className="mb-3 text-sm text-stone-500" dir="ltr">
                  {new Date(checkedInAt).toLocaleTimeString("ar-EG")}
                </p>
              )}
              <div className="inline-block rounded-2xl bg-accent/10 px-4 py-3">
                <p className="text-xl font-bold text-accent-dark">{monthCount}</p>
                <p className="text-xs font-medium text-stone-500">يوم حضور هذا الشهر</p>
                <p className="mt-1 text-xs font-medium text-stone-600">
                  {monthMessage(monthCount)}
                </p>
              </div>
            </>
          )}

          {attendancePhase === "out_of_range" && (
            <>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
                📍
              </div>
              <p className="mb-1 font-bold text-stone-800">اقترب أكتر شوية!</p>
              <p className="mb-4 text-sm text-stone-500">
                {distance !== null
                  ? `أنت على بعد حوالي ${Math.round(distance)} متر من موقع العمل.`
                  : "لن يتم تسجيل حضورك إلا عند الوصول إلى موقع العمل."}
              </p>
              <button
                onClick={runAttendanceCheck}
                className="w-full rounded-2xl bg-primary py-3 font-bold text-white shadow-md shadow-primary/20 transition active:scale-95"
              >
                إعادة المحاولة
              </button>
            </>
          )}

          {attendancePhase === "location_denied" && (
            <>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
                ⚠️
              </div>
              <p className="mb-1 font-bold text-stone-800">يجب تفعيل خدمة الموقع</p>
              <p className="mb-4 text-sm text-stone-500">
                فعّل صلاحية الموقع لهذا الموقع من إعدادات المتصفح ثم أعد المحاولة.
              </p>
              <button
                onClick={runAttendanceCheck}
                className="w-full rounded-2xl bg-primary py-3 font-bold text-white shadow-md shadow-primary/20 transition active:scale-95"
              >
                إعادة المحاولة
              </button>
            </>
          )}

          {attendancePhase === "error" && (
            <>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
                ⚠️
              </div>
              <p className="mb-1 font-bold text-stone-800">حدث خطأ في تسجيل الحضور</p>
              {attendanceError && (
                <p className="mb-4 text-sm text-stone-500">{attendanceError}</p>
              )}
              <button
                onClick={runAttendanceCheck}
                className="w-full rounded-2xl bg-primary py-3 font-bold text-white shadow-md shadow-primary/20 transition active:scale-95"
              >
                إعادة المحاولة
              </button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-stone-100">
        <div className="p-6">
          <h2 className="mb-1 text-lg font-bold text-stone-800">مشاريعك</h2>
          <p className="mb-4 text-sm text-stone-500">
            المشاريع المخصصة لك — سجّل عميلاً جديداً في أي وقت.
          </p>

          {projects === null ? (
            <p className="py-6 text-center text-sm text-stone-400">جارِ التحميل...</p>
          ) : projects.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-400">
              لا توجد مشاريع مخصصة لك حالياً.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-stone-800">
                      {project.title || project.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {project.lead_count} عميل مسجّل منك
                    </p>
                  </div>
                  <a
                    href={leadFormLink(project.id)}
                    className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm shadow-primary/20 active:scale-95"
                  >
                    + عميل جديد
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-stone-400">فريق العمل يفتخر بك 💛</p>
    </PageShell>
  );
}

function PageShell({
  children,
  wide,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  const router = useRouter();
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLogoClick() {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);

    if (clickCount.current >= 3) {
      clickCount.current = 0;
      router.push("/admin");
      return;
    }

    clickTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 1200);
  }

  return (
    <div className="safe-top safe-bottom flex min-h-dvh flex-col items-center bg-gradient-to-b from-primary/10 via-background to-background px-4 py-10">
      <div className="mb-6 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleLogoClick}
          aria-label="Leads"
          className="cursor-default"
        >
          <BrandMark height={wide ? 56 : 72} />
        </button>
        <span className="text-xs font-bold uppercase tracking-wide text-stone-400">
          مساحة عملك
        </span>
      </div>
      <div className={`w-full ${wide ? "max-w-md" : "max-w-sm"}`}>{children}</div>
    </div>
  );
}
