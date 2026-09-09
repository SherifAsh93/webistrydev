"use client";

import { useEffect, useState } from "react";
import { MANAGER_NAME } from "@/lib/constants";
import { timeGreeting } from "@/lib/greeting";

type EmployeeOverview = {
  id: string;
  name: string;
  phone: string;
  total_leads: number;
  projects: { project_id: string; project_name: string; lead_count: number }[];
};

type Overview = {
  totals: { projects: number; employees: number; leads: number };
  employees: EmployeeOverview[];
};

export default function CompanyOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/overview")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <p className="py-10 text-center text-stone-400">جارِ التحميل...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 rounded-2xl bg-gradient-to-l from-primary to-primary-dark p-5 text-white shadow-md shadow-primary/20">
        <p className="text-lg font-bold">
          {timeGreeting()} يا {MANAGER_NAME} 🌸
        </p>
        <p className="mt-1 text-sm text-white/80">
          نتمنى لك يوماً موفقاً في قيادة الفريق!
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="المشاريع" value={data.totals.projects} />
        <StatCard label="الموظفين" value={data.totals.employees} />
        <StatCard label="إجمالي العملاء" value={data.totals.leads} />
      </div>

      <h2 className="mb-3 text-lg font-bold text-stone-800">أداء الموظفين</h2>

      {data.employees.length === 0 ? (
        <p className="py-10 text-center text-stone-400">لا يوجد موظفون بعد</p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.employees.map((employee) => (
            <div key={employee.id} className="card">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-bold text-stone-800">{employee.name}</p>
                  <p className="truncate text-sm text-stone-500" dir="ltr">
                    {employee.phone}
                  </p>
                </div>
                <div className="shrink-0 text-center">
                  <p className="text-xl font-bold text-primary">
                    {employee.total_leads}
                  </p>
                  <p className="text-xs text-stone-400">عميل</p>
                </div>
              </div>

              {employee.projects.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-stone-100 pt-3">
                  {employee.projects.map((p) => (
                    <span
                      key={p.project_id}
                      className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent-dark"
                    >
                      {p.project_name || "بدون اسم"}: {p.lead_count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{label}</p>
    </div>
  );
}
