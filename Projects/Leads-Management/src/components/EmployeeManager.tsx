"use client";

import { useEffect, useState } from "react";
import { Employee } from "@/types/employee";
import Toast from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function EmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isManager, setIsManager] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function fetchEmployees() {
    setLoading(true);
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data.employees ?? []);
    } catch {
      setToast("تعذّر تحميل الموظفين");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setToast("من فضلك أدخل الاسم ورقم الهاتف");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, is_manager: isManager }),
      });
      if (!res.ok) throw new Error();
      setName("");
      setPhone("");
      setIsManager(false);
      setToast("تم إضافة الموظف");
      fetchEmployees();
    } catch {
      setToast("تعذّر إضافة الموظف");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/employees/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setToast("تم حذف الموظف");
      fetchEmployees();
    } catch {
      setToast("تعذّر حذف الموظف");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSaveEdit(
    newName: string,
    newPhone: string,
    newIsManager: boolean
  ) {
    if (!editing) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/employees/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          is_manager: newIsManager,
        }),
      });
      if (!res.ok) throw new Error();
      setToast("تم حفظ التعديلات");
      setEditing(null);
      fetchEmployees();
    } catch {
      setToast("تعذّر حفظ التعديلات");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="mb-1 text-lg font-bold text-stone-800">الموظفين</h2>
      <p className="mb-4 text-sm text-stone-500">
        موظفو الشركة — يمكن تعيين أي موظف للعمل على أي مشروع من داخل صفحة المشروع.
      </p>

      <form
        onSubmit={handleAdd}
        className="card mb-4 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-stone-600">
            الاسم
          </label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم الموظف"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-stone-600">
            رقم الهاتف
          </label>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+2010xxxxxxxx"
          />
        </div>
        <label className="flex items-center gap-2 pb-3 text-sm font-medium text-stone-600 sm:pb-3.5">
          <input
            type="checkbox"
            checked={isManager}
            onChange={(e) => setIsManager(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300"
          />
          مدير (لا يظهر في الحضور)
        </label>
        <button
          type="submit"
          disabled={adding}
          className="rounded-xl bg-primary px-5 py-3 font-bold text-white active:scale-95 disabled:opacity-60"
        >
          {adding ? "..." : "إضافة موظف"}
        </button>
      </form>

      {loading ? (
        <p className="py-8 text-center text-stone-400">جارِ التحميل...</p>
      ) : employees.length === 0 ? (
        <p className="py-8 text-center text-stone-400">لا يوجد موظفون بعد</p>
      ) : (
        <div className="flex flex-col gap-3">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="card flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="truncate font-bold text-stone-800">
                  {employee.name}
                  {employee.is_manager && (
                    <span className="mr-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent-dark">
                      مدير
                    </span>
                  )}
                </p>
                <p className="truncate text-sm text-stone-500" dir="ltr">
                  {employee.phone}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => setEditing(employee)}
                  aria-label="تعديل"
                  className="icon-btn h-9 w-9 text-primary"
                >
                  <IconEdit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeletingId(employee.id)}
                  aria-label="حذف"
                  className="icon-btn h-9 w-9 text-red-500"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EditEmployeeModal
          initialName={editing.name}
          initialPhone={editing.phone}
          initialIsManager={editing.is_manager}
          saving={savingEdit}
          onSave={handleSaveEdit}
          onCancel={() => setEditing(null)}
        />
      )}

      {deletingId && (
        <ConfirmDialog
          message="هل أنت متأكد من حذف هذا الموظف؟ سيُزال من كل المشاريع المعيّن لها."
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function EditEmployeeModal({
  initialName,
  initialPhone,
  initialIsManager,
  saving,
  onSave,
  onCancel,
}: {
  initialName: string;
  initialPhone: string;
  initialIsManager: boolean;
  saving: boolean;
  onSave: (name: string, phone: string, isManager: boolean) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [isManager, setIsManager] = useState(initialIsManager);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:px-4">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <h2 className="mb-4 text-lg font-bold text-stone-800">تعديل الموظف</h2>
        <div className="flex flex-col gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-600">
              الاسم
            </span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-600">
              رقم الهاتف
            </span>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-stone-600">
            <input
              type="checkbox"
              checked={isManager}
              onChange={(e) => setIsManager(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300"
            />
            مدير (لا يظهر في الحضور)
          </label>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl bg-stone-100 py-3 font-bold text-stone-700 active:scale-95"
          >
            إلغاء
          </button>
          <button
            onClick={() => onSave(name, phone, isManager)}
            disabled={saving}
            className="flex-1 rounded-xl bg-primary py-3 font-bold text-white active:scale-95 disabled:opacity-60"
          >
            {saving ? "..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}

function IconEdit({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 20h4l10.5-10.5a2.121 2.121 0 00-3-3L5 17v3z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m3 0l-1 13a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7h14z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
