"use client";

import { useState } from "react";
import { Lead } from "@/types/lead";
import { FormField } from "@/types/form";

type EditLeadModalProps = {
  lead: Lead;
  fields: FormField[];
  onClose: () => void;
  onSave: (id: string, data: Partial<Lead>) => Promise<void>;
};

export default function EditLeadModal({
  lead,
  fields,
  onClose,
  onSave,
}: EditLeadModalProps) {
  const [name, setName] = useState(lead.name);
  const [phone, setPhone] = useState(lead.phone);
  const [employeeName, setEmployeeName] = useState(lead.employee_name);
  const [employeePhone, setEmployeePhone] = useState(lead.employee_phone);
  const [answers, setAnswers] = useState<Record<string, string>>({
    ...lead.answers,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("الاسم ورقم الهاتف مطلوبان");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(lead.id, {
        name,
        phone,
        answers,
        employee_name: employeeName,
        employee_phone: employeePhone,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <h2 className="mb-4 text-lg font-bold text-stone-800">تعديل بيانات العميل</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="الاسم">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </Field>

          <Field label="رقم الهاتف">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
            />
          </Field>

          {fields.map((field) => (
            <Field key={field.key} label={field.label}>
              {field.type === "select" ? (
                <select
                  value={answers[field.key] ?? ""}
                  onChange={(e) => updateAnswer(field.key, e.target.value)}
                  className="input"
                >
                  <option value="">—</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={answers[field.key] ?? ""}
                  onChange={(e) => updateAnswer(field.key, e.target.value)}
                  className="input"
                />
              )}
            </Field>
          ))}

          <Field label="اسم الموظف">
            <input
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="input"
            />
          </Field>

          <Field label="هاتف الموظف">
            <input
              value={employeePhone}
              onChange={(e) => setEmployeePhone(e.target.value)}
              className="input"
            />
          </Field>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-stone-100 py-3 font-bold text-stone-700 active:scale-95"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-primary py-3 font-bold text-white active:scale-95 disabled:opacity-60"
            >
              {saving ? "جارِ الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-600">{label}</span>
      {children}
    </label>
  );
}
