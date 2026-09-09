"use client";

import { useEffect, useMemo, useState } from "react";
import { Employee } from "@/types/employee";
import Toast from "@/components/Toast";

export default function ProjectEmployeeAssignment({
  projectId,
}: {
  projectId: string;
}) {
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [assigned, setAssigned] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const [allRes, assignedRes] = await Promise.all([
        fetch("/api/employees"),
        fetch(`/api/projects/${projectId}/employees`),
      ]);
      const allData = await allRes.json();
      const assignedData = await assignedRes.json();
      setAllEmployees(allData.employees ?? []);
      setAssigned(assignedData.employees ?? []);
    } catch {
      setToast("تعذّر تحميل الموظفين");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const assignedIds = useMemo(() => new Set(assigned.map((e) => e.id)), [assigned]);
  const unassignedEmployees = allEmployees.filter((e) => !assignedIds.has(e.id));

  async function handleAssign(employeeId: string) {
    setBusyId(employeeId);
    try {
      const res = await fetch(`/api/projects/${projectId}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employeeId }),
      });
      if (!res.ok) throw new Error();
      fetchData();
    } catch {
      setToast("تعذّر تعيين الموظف");
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnassign(employeeId: string) {
    setBusyId(employeeId);
    try {
      const res = await fetch(`/api/projects/${projectId}/employees/${employeeId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      fetchData();
    } catch {
      setToast("تعذّر إزالة الموظف");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCopyLink(employee: Employee) {
    const link = `${window.location.origin}/form?project=${projectId}&employee=${
      employee.id
    }&emp=${encodeURIComponent(employee.name)}&phone=${encodeURIComponent(employee.phone)}`;

    try {
      await navigator.clipboard.writeText(link);
      setToast(`تم نسخ رابط ${employee.name}`);
    } catch {
      setToast(link);
    }
  }

  if (loading) {
    return <p className="py-10 text-center text-stone-400">جارِ التحميل...</p>;
  }

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="mb-1 text-lg font-bold text-stone-800">الموظفين المعيّنين</h2>
      <p className="mb-4 text-sm text-stone-500">
        عيّن موظفين من قائمة الشركة للعمل على هذا المشروع، ثم انسخ رابط كل موظف وأرسله له.
      </p>

      <div className="mb-6 flex flex-col gap-3">
        {assigned.length === 0 ? (
          <p className="py-8 text-center text-stone-400">لم يتم تعيين أي موظف بعد</p>
        ) : (
          assigned.map((employee) => (
            <div key={employee.id} className="card flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-bold text-stone-800">{employee.name}</p>
                <p className="truncate text-sm text-stone-500" dir="ltr">
                  {employee.phone}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => handleCopyLink(employee)}
                  className="rounded-full bg-accent/15 px-3 py-1.5 text-sm font-bold text-accent-dark active:scale-95"
                >
                  نسخ الرابط
                </button>
                <button
                  onClick={() => handleUnassign(employee.id)}
                  disabled={busyId === employee.id}
                  className="icon-btn h-9 w-9 text-red-500 disabled:opacity-60"
                  aria-label="إزالة"
                >
                  <IconRemove className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {unassignedEmployees.length > 0 && (
        <>
          <h3 className="mb-2 text-sm font-bold text-stone-600">
            موظفون آخرون في الشركة
          </h3>
          <div className="flex flex-col gap-3">
            {unassignedEmployees.map((employee) => (
              <div key={employee.id} className="card flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-bold text-stone-800">{employee.name}</p>
                  <p className="truncate text-sm text-stone-500" dir="ltr">
                    {employee.phone}
                  </p>
                </div>
                <button
                  onClick={() => handleAssign(employee.id)}
                  disabled={busyId === employee.id}
                  className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white active:scale-95 disabled:opacity-60"
                >
                  تعيين
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function IconRemove({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
