"use client";

import { useEffect, useState } from "react";
import { FieldType, FormField } from "@/types/form";
import { Project } from "@/types/project";
import Toast from "@/components/Toast";

const TYPE_LABELS: Record<FieldType, string> = {
  text: "نص",
  select: "قائمة منسدلة",
  date: "تاريخ",
  time: "وقت",
};

export default function FormBuilder({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => setProject(data.project))
      .catch(() => setToast("تعذّر تحميل الاستمارة"))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading || !project) {
    return <p className="py-10 text-center text-stone-400">جارِ التحميل...</p>;
  }

  function update<K extends keyof Project>(key: K, value: Project[K]) {
    setProject((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function updateField(index: number, patch: Partial<FormField>) {
    setProject((prev) => {
      if (!prev) return prev;
      const fields = [...prev.fields];
      fields[index] = { ...fields[index], ...patch };
      return { ...prev, fields };
    });
  }

  function addField() {
    setProject((prev) => {
      if (!prev) return prev;
      const field: FormField = {
        key: `field_${Date.now()}`,
        label: "",
        type: "text",
        required: false,
      };
      return { ...prev, fields: [...prev.fields, field] };
    });
  }

  function removeField(index: number) {
    setProject((prev) => {
      if (!prev) return prev;
      const fields = prev.fields.filter((_, i) => i !== index);
      return { ...prev, fields };
    });
  }

  function moveField(index: number, direction: -1 | 1) {
    setProject((prev) => {
      if (!prev) return prev;
      const target = index + direction;
      if (target < 0 || target >= prev.fields.length) return prev;
      const fields = [...prev.fields];
      [fields[index], fields[target]] = [fields[target], fields[index]];
      return { ...prev, fields };
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذّر رفع الصورة");
      update("image_url", data.url);
      setToast("تم رفع الصورة");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "تعذّر رفع الصورة");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSave() {
    if (!project) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      if (!res.ok) throw new Error();
      setToast("تم حفظ الاستمارة");
    } catch {
      setToast("تعذّر حفظ الاستمارة");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-4 text-lg font-bold text-stone-800">تصميم الاستمارة</h2>

      <div className="card flex flex-col gap-4">
        <BField label="اسم المشروع (داخلي، لا يظهر للعميل)">
          <input
            className="input"
            value={project.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </BField>

        <BField label="عنوان الاستمارة">
          <input
            className="input"
            value={project.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </BField>

        <BField label="الوصف">
          <textarea
            className="input"
            rows={2}
            value={project.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </BField>

        <BField label="الشعار / الصورة">
          <div className="flex items-center gap-3">
            {project.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.image_url}
                alt=""
                className="h-16 w-16 rounded-lg border object-contain"
              />
            )}
            <label className="cursor-pointer rounded-lg bg-stone-100 px-3 py-2 text-sm font-bold text-stone-700">
              {uploading ? "جارِ الرفع..." : "اختر صورة"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
            {project.image_url && (
              <button
                type="button"
                onClick={() => update("image_url", null)}
                className="text-sm font-bold text-red-600"
              >
                إزالة
              </button>
            )}
          </div>
        </BField>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {project.fields.map((field, index) => (
          <div key={field.key} className="card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-stone-600">
                  اسم الحقل
                </label>
                <input
                  className="input"
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                  placeholder="مثال: نوع الوحدة"
                />
              </div>
              <div className="w-full sm:w-40">
                <label className="mb-1 block text-xs font-medium text-stone-600">
                  النوع
                </label>
                <select
                  className="input"
                  value={field.type}
                  onChange={(e) =>
                    updateField(index, { type: e.target.value as FieldType })
                  }
                >
                  {(Object.keys(TYPE_LABELS) as FieldType[]).map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {field.type === "select" && (
              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium text-stone-600">
                  الخيارات (افصل بينها بفاصلة ,)
                </label>
                <input
                  className="input"
                  value={(field.options ?? []).join(", ")}
                  onChange={(e) =>
                    updateField(index, {
                      options: e.target.value
                        .split(",")
                        .map((o) => o.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="مثال: سبت, أحد, اثنين"
                />
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    updateField(index, { required: e.target.checked })
                  }
                />
                إلزامي
              </label>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moveField(index, -1)}
                  disabled={index === 0}
                  className="rounded-lg bg-stone-100 px-2 py-1 text-stone-600 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveField(index, 1)}
                  disabled={index === project.fields.length - 1}
                  className="rounded-lg bg-stone-100 px-2 py-1 text-stone-600 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="rounded-lg bg-red-50 px-3 py-1 text-sm font-bold text-red-600"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addField}
          className="rounded-xl border-2 border-dashed border-stone-300 py-3 text-sm font-bold text-stone-500 hover:border-primary hover:text-primary"
        >
          + إضافة حقل
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full rounded-xl bg-primary py-4 text-lg font-bold text-white shadow-md active:scale-95 disabled:opacity-60"
      >
        {saving ? "جارِ الحفظ..." : "حفظ الاستمارة"}
      </button>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function BField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}
      </span>
      {children}
    </label>
  );
}
