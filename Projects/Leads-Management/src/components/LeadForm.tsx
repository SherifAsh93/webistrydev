"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Project } from "@/types/project";
import BrandMark from "@/components/BrandMark";

export default function LeadForm() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project") ?? "";
  const employeeId = searchParams.get("employee") ?? "";
  const employeeName = searchParams.get("emp") ?? "";
  const employeePhone = searchParams.get("phone") ?? "";

  const [config, setConfig] = useState<Project | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!projectId) {
      setLoadError(true);
      return;
    }
    fetch(`/api/projects/${projectId}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setConfig(data.project))
      .catch(() => setLoadError(true));
  }, [projectId]);

  function updateAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim()) {
      setError("من فضلك أدخل الاسم ورقم الهاتف");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          employee_id: employeeId || null,
          name,
          phone,
          answers,
          employee_name: employeeName,
          employee_phone: employeePhone,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "حدث خطأ أثناء الإرسال");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء الإرسال");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <PageShell>
        <p className="text-center text-stone-500">
          تعذّر تحميل الاستمارة، حاول مرة أخرى
        </p>
      </PageShell>
    );
  }

  if (!config) {
    return (
      <PageShell>
        <p className="text-center text-stone-500">جارِ التحميل...</p>
      </PageShell>
    );
  }

  if (submitted) {
    return (
      <PageShell>
        <div className="w-full rounded-2xl bg-white p-8 text-center shadow-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✅
          </div>
          <h1 className="mb-2 text-xl font-bold text-stone-800">
            تم إرسال بياناتك بنجاح
          </h1>
          <p className="text-sm text-stone-500">
            شكراً لك، سيتم التواصل معك قريباً.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="w-full rounded-2xl bg-white p-6 shadow-md">
        {config.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.image_url}
            alt=""
            className="mx-auto mb-4 max-h-40 w-auto rounded-xl object-contain"
          />
        )}

        {config.title && (
          <h1 className="mb-1 text-center text-xl font-bold text-stone-800">
            {config.title}
          </h1>
        )}
        {config.description && (
          <p className="mb-6 text-center text-sm text-stone-500">
            {config.description}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="الاسم" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="اكتب اسمك بالكامل"
              required
            />
          </Field>

          <Field label="رقم الهاتف" required>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="01xxxxxxxxx"
              required
            />
          </Field>

          {config.fields.map((field) => (
            <Field key={field.key} label={field.label} required={field.required}>
              {field.type === "select" ? (
                <select
                  value={answers[field.key] ?? ""}
                  onChange={(e) => updateAnswer(field.key, e.target.value)}
                  className="input"
                  required={field.required}
                >
                  <option value="" disabled>
                    اختر...
                  </option>
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
                  required={field.required}
                />
              )}
            </Field>
          ))}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-primary py-4 text-lg font-bold text-white shadow-md transition active:scale-95 hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? "جارِ الإرسال..." : "إرسال"}
          </button>
        </form>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="safe-top safe-bottom flex min-h-dvh flex-col items-center bg-background px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <BrandMark height={32} />
        <span className="text-sm font-bold text-stone-400">Leads</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-stone-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
