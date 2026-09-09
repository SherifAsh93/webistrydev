"use client";

import { useEffect, useState } from "react";
import { AttendanceStatus } from "@/types/attendance";
import Toast from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";

function todayInCairo(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
}

export default function AttendanceManager() {
  const [date, setDate] = useState(todayInCairo());
  const [employees, setEmployees] = useState<AttendanceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState<AttendanceStatus | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function fetchAttendance() {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?date=${date}`);
      const data = await res.json();
      setEmployees(data.employees ?? []);
    } catch {
      setToast("تعذّر تحميل بيانات الحضور");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function handleResetDevice() {
    if (!resetting) return;
    try {
      const res = await fetch("/api/attendance/reset-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: resetting.employee_id }),
      });
      if (!res.ok) throw new Error();
      setToast("تم فصل الجهاز، يمكنه اختيار اسمه من جديد على جهاز آخر");
      fetchAttendance();
    } catch {
      setToast("تعذّر فصل الجهاز");
    } finally {
      setResetting(null);
    }
  }

  const presentCount = employees.filter((e) => e.present).length;

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="mb-1 text-lg font-bold text-stone-800">الحضور</h2>
      <p className="mb-4 text-sm text-stone-500">
        يُسجَّل الحضور تلقائياً عند فتح رابط الحضور على موقع العمل.
      </p>

      <div className="card mb-4 flex items-center justify-between gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">
            التاريخ
          </label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">
            {presentCount}/{employees.length}
          </p>
          <p className="text-xs text-stone-500">حاضر</p>
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-stone-400">جارِ التحميل...</p>
      ) : employees.length === 0 ? (
        <p className="py-8 text-center text-stone-400">لا يوجد موظفون بعد</p>
      ) : (
        <div className="flex flex-col gap-3">
          {employees.map((employee) => (
            <div
              key={employee.employee_id}
              className="card flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="truncate font-bold text-stone-800">{employee.name}</p>
                {employee.present && employee.checked_in_at ? (
                  <p className="text-sm text-green-600" dir="ltr">
                    {new Date(employee.checked_in_at).toLocaleTimeString("ar-EG")}
                  </p>
                ) : (
                  <p className="text-sm text-stone-400">غائب</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    employee.present
                      ? "bg-green-100 text-green-700"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {employee.present ? "حاضر" : "غائب"}
                </span>
                <button
                  onClick={() => setResetting(employee)}
                  className="rounded-lg bg-stone-100 px-2.5 py-1.5 text-xs font-bold text-stone-600"
                >
                  فصل الجهاز
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {resetting && (
        <ConfirmDialog
          message={`سيتم فصل جهاز "${resetting.name}" الحالي، ويمكنه اختيار اسمه من جديد على أي جهاز.`}
          confirmLabel="فصل الجهاز"
          onConfirm={handleResetDevice}
          onCancel={() => setResetting(null)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
