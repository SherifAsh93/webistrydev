"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lead } from "@/types/lead";
import { FormField } from "@/types/form";
import { Project, ProjectSummary } from "@/types/project";
import EditLeadModal from "@/components/EditLeadModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";
import FormBuilder from "@/components/FormBuilder";
import EmployeeManager from "@/components/EmployeeManager";
import ProjectEmployeeAssignment from "@/components/ProjectEmployeeAssignment";
import CompanyOverview from "@/components/CompanyOverview";
import AttendanceManager from "@/components/AttendanceManager";
import BrandMark from "@/components/BrandMark";

type ProjectTab = "leads" | "employees" | "builder";
type HomeTab = "overview" | "projects" | "employees" | "attendance";

export default function AdminPage() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(
    null
  );

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (selectedProject) {
    return (
      <ProjectWorkspace
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <CompanyHome onOpenProject={setSelectedProject} onLogout={handleLogout} />
  );
}

function CompanyHome({
  onOpenProject,
  onLogout,
}: {
  onOpenProject: (project: ProjectSummary) => void;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<HomeTab>("overview");
  const [refreshKey, setRefreshKey] = useState(0);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ProjectSummary | null>(null);
  const [editing, setEditing] = useState<ProjectSummary | null>(null);
  const [editingFull, setEditingFull] = useState<Project | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function fetchProjects() {
    setLoadingProjects(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch {
      setToast("تعذّر تحميل المشاريع");
    } finally {
      setLoadingProjects(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
    if (tab === "projects") fetchProjects();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setToast("من فضلك أدخل اسم المشروع");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setName("");
      fetchProjects();
      onOpenProject(data.project);
    } catch {
      setToast("تعذّر إنشاء المشروع");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/projects/${deleting.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setToast("تم حذف المشروع");
      fetchProjects();
    } catch {
      setToast("تعذّر حذف المشروع");
    } finally {
      setDeleting(null);
    }
  }

  async function openEdit(project: ProjectSummary) {
    setEditing(project);
    setEditingFull(null);
    try {
      const res = await fetch(`/api/projects/${project.id}`);
      const data = await res.json();
      setEditingFull(data.project ?? null);
    } catch {
      // fall back to name/title-only save below
    }
  }

  async function handleSaveEdit(newName: string, newTitle: string) {
    if (!editing) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/projects/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          title: newTitle,
          description: editingFull?.description ?? "",
          image_url: editingFull?.image_url ?? null,
          fields: editingFull?.fields ?? [],
        }),
      });
      if (!res.ok) throw new Error();
      setToast("تم حفظ التعديلات");
      setEditing(null);
      fetchProjects();
    } catch {
      setToast("تعذّر حفظ التعديلات");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <Header title="لوحة التحكم" onRefresh={handleRefresh} onLogout={onLogout} />

      <main className="app-scroll-area mx-auto max-w-4xl px-4 py-5">
        {tab === "overview" && <CompanyOverview key={refreshKey} />}
        {tab === "employees" && <EmployeeManager key={refreshKey} />}
        {tab === "attendance" && <AttendanceManager key={refreshKey} />}

        {tab === "projects" && (
          <div className="mx-auto max-w-xl">
            <form
              onSubmit={handleCreate}
              className="card mb-5 flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-stone-600">
                  اسم المشروع الجديد
                </label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: كمبوند الساحل الشمالي"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-primary px-5 py-3 font-bold text-white active:scale-95 disabled:opacity-60"
              >
                {creating ? "..." : "+ مشروع جديد"}
              </button>
            </form>

            {loadingProjects ? (
              <p className="py-10 text-center text-stone-400">جارِ التحميل...</p>
            ) : projects.length === 0 ? (
              <p className="py-10 text-center text-stone-400">
                لا توجد مشاريع بعد، أنشئ أول مشروع بالأعلى
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="card flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-stone-800">
                        {project.name}
                      </p>
                      {project.title && (
                        <p className="truncate text-sm text-stone-500">
                          {project.title}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => openEdit(project)}
                        aria-label="تعديل"
                        className="icon-btn h-9 w-9 text-primary"
                      >
                        <IconEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onOpenProject(project)}
                        className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white active:scale-95"
                      >
                        فتح
                      </button>
                      <button
                        onClick={() => setDeleting(project)}
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
          </div>
        )}
      </main>

      <BottomNav
        active={tab}
        onChange={setTab}
        items={[
          { id: "overview", label: "نظرة عامة", icon: IconOverview },
          { id: "projects", label: "المشاريع", icon: IconProjects },
          { id: "employees", label: "الموظفين", icon: IconEmployees },
          { id: "attendance", label: "الحضور", icon: IconAttendance },
        ]}
      />

      {editing && (
        <EditProjectModal
          initialName={editing.name}
          initialTitle={editing.title}
          saving={savingEdit}
          onSave={handleSaveEdit}
          onCancel={() => setEditing(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          message={`هل أنت متأكد من حذف مشروع "${deleting.name}"؟ سيتم حذف كل العملاء المرتبطين به (الموظفون أنفسهم يبقون في قائمة الشركة).`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function ProjectWorkspace({
  project,
  onBack,
  onLogout,
}: {
  project: ProjectSummary;
  onBack: () => void;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<ProjectTab>("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function fetchLeads() {
    setLoading(true);
    try {
      const [leadsRes, projectRes] = await Promise.all([
        fetch(`/api/leads?project_id=${project.id}`),
        fetch(`/api/projects/${project.id}`),
      ]);
      const leadsData = await leadsRes.json();
      const projectData = await projectRes.json();
      setLeads(leadsData.leads ?? []);
      setFields(projectData.project?.fields ?? []);
    } catch {
      setToast("تعذّر تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const filteredLeads = useMemo(() => {
    const q = search.trim();
    if (!q) return leads;
    return leads.filter(
      (lead) => lead.name.includes(q) || lead.phone.includes(q)
    );
  }, [leads, search]);

  const stats = useMemo(() => {
    const byEmployee = new Map<string, number>();
    for (const lead of leads) {
      const name = lead.employee_name || "غير محدد";
      byEmployee.set(name, (byEmployee.get(name) ?? 0) + 1);
    }
    return { total: leads.length, byEmployee: Array.from(byEmployee.entries()) };
  }, [leads]);

  async function handleSave(id: string, data: Partial<Lead>) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "حدث خطأ أثناء الحفظ");
    }
    setToast("تم حفظ التعديلات");
    fetchLeads();
  }

  async function handleDelete() {
    if (!deletingLead) return;
    try {
      const res = await fetch(`/api/leads/${deletingLead.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setToast("تم حذف العميل");
      fetchLeads();
    } catch {
      setToast("تعذّر حذف العميل");
    } finally {
      setDeletingLead(null);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <Header
        title={project.name}
        onBack={onBack}
        onRefresh={fetchLeads}
        onLogout={onLogout}
      />

      <main className="app-scroll-area mx-auto max-w-6xl px-4 py-5">
        {tab === "employees" && <ProjectEmployeeAssignment projectId={project.id} />}
        {tab === "builder" && <FormBuilder projectId={project.id} />}

        {tab === "leads" && (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard label="إجمالي العملاء المسجّلين" value={stats.total} />
              {stats.byEmployee.map(([name, count]) => (
                <StatCard key={name} label={name} value={count} />
              ))}
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو رقم الهاتف..."
                className="input"
              />
            </div>

            {/* Mobile: card list */}
            <div className="flex flex-col gap-3 md:hidden">
              {loading ? (
                <p className="py-10 text-center text-stone-400">جارِ التحميل...</p>
              ) : filteredLeads.length === 0 ? (
                <p className="py-10 text-center text-stone-400">لا توجد نتائج</p>
              ) : (
                filteredLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    fields={fields}
                    onEdit={() => setEditingLead(lead)}
                    onDelete={() => setDeletingLead(lead)}
                  />
                ))
              )}
            </div>

            {/* Desktop: table */}
            <div className="table-scroll hidden overflow-x-auto rounded-xl bg-white shadow-sm md:block">
              <table className="w-full min-w-[1000px] text-right text-sm">
                <thead className="sticky top-0 bg-stone-100 text-stone-600">
                  <tr>
                    <Th>الاسم</Th>
                    <Th>رقم الهاتف</Th>
                    {fields.map((field) => (
                      <Th key={field.key}>{field.label}</Th>
                    ))}
                    <Th>اسم الموظف</Th>
                    <Th>هاتف الموظف</Th>
                    <Th>وقت الإرسال</Th>
                    <Th>إجراءات</Th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5 + fields.length} className="py-10 text-center text-stone-400">
                        جارِ التحميل...
                      </td>
                    </tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5 + fields.length} className="py-10 text-center text-stone-400">
                        لا توجد نتائج
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="border-t hover:bg-stone-50">
                        <Td>{lead.name}</Td>
                        <Td>{lead.phone}</Td>
                        {fields.map((field) => (
                          <Td key={field.key}>{lead.answers?.[field.key] ?? "—"}</Td>
                        ))}
                        <Td>{lead.employee_name}</Td>
                        <Td>{lead.employee_phone}</Td>
                        <Td>{new Date(lead.created_at).toLocaleString("ar-EG")}</Td>
                        <Td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingLead(lead)}
                              className="rounded-lg bg-primary/10 px-3 py-1.5 font-bold text-primary"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => setDeletingLead(lead)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 font-bold text-red-600"
                            >
                              حذف
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <BottomNav
        active={tab}
        onChange={setTab}
        items={[
          { id: "leads", label: "الطلبات", icon: IconLeads },
          { id: "employees", label: "الموظفين", icon: IconEmployees },
          { id: "builder", label: "الاستمارة", icon: IconBuilder },
        ]}
      />

      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          fields={fields}
          onClose={() => setEditingLead(null)}
          onSave={handleSave}
        />
      )}

      {deletingLead && (
        <ConfirmDialog
          message="هل أنت متأكد من الحذف؟"
          onConfirm={handleDelete}
          onCancel={() => setDeletingLead(null)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function Header({
  title,
  onBack,
  onRefresh,
  onLogout,
}: {
  title: string;
  onBack?: () => void;
  onRefresh?: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="app-header sticky top-0 z-20 border-b border-stone-200 bg-white/95 px-3 pb-3 shadow-sm backdrop-blur">
      <div className="mx-auto grid max-w-4xl grid-cols-[44px_1fr_44px] items-center gap-2">
        <div className="flex justify-start">
          {onBack ? (
            <button onClick={onBack} className="icon-btn" aria-label="رجوع">
              <IconBack className="h-5 w-5" />
            </button>
          ) : (
            <span className="block h-11 w-11" />
          )}
        </div>

        <div className="flex justify-center">
          <BrandMark height={48} />
        </div>

        <div className="flex flex-col items-end gap-2">
          {onRefresh && (
            <button onClick={onRefresh} className="icon-btn" aria-label="تحديث">
              <IconRefresh className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={onLogout}
            className="icon-btn text-red-500"
            aria-label="خروج"
          >
            <IconExit className="h-5 w-5" />
          </button>
        </div>
      </div>

      <h1 className="mt-2 truncate text-center text-base font-bold text-stone-800">
        {title}
      </h1>
    </header>
  );
}

function BottomNav<T extends string>({
  items,
  active,
  onChange,
}: {
  items: { id: T; label: string; icon: (props: { className?: string }) => React.JSX.Element }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <nav className="app-bottom-nav fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 pt-1.5 shadow-nav backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-stretch justify-around px-2">
        {items.map((item) => {
          const isActive = item.id === active;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
                isActive ? "text-primary" : "text-stone-400"
              }`}
            >
              <span
                className={`flex h-8 w-9 items-center justify-center rounded-full transition ${
                  isActive ? "bg-primary/10" : ""
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function EditProjectModal({
  initialName,
  initialTitle,
  saving,
  onSave,
  onCancel,
}: {
  initialName: string;
  initialTitle: string;
  saving: boolean;
  onSave: (name: string, title: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [title, setTitle] = useState(initialTitle);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:px-4">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <h2 className="mb-4 text-lg font-bold text-stone-800">تعديل المشروع</h2>
        <div className="flex flex-col gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-600">
              اسم المشروع (داخلي)
            </span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-600">
              عنوان الاستمارة
            </span>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
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
            onClick={() => onSave(name, title)}
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

function LeadCard({
  lead,
  fields,
  onEdit,
  onDelete,
}: {
  lead: Lead;
  fields: FormField[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-bold text-stone-800">{lead.name}</p>
          <p className="text-sm text-stone-500" dir="ltr">
            {lead.phone}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            onClick={onEdit}
            aria-label="تعديل"
            className="icon-btn h-9 w-9 text-primary"
          >
            <IconEdit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            aria-label="حذف"
            className="icon-btn h-9 w-9 text-red-500"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      {fields.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-stone-100 pt-3">
          {fields.map((field) => (
            <span
              key={field.key}
              className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600"
            >
              {field.label}: {lead.answers?.[field.key] ?? "—"}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-400">
        <span className="truncate">{lead.employee_name || "—"}</span>
        <span dir="ltr">{new Date(lead.created_at).toLocaleString("ar-EG")}</span>
      </div>
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

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-bold">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-4 py-3">{children}</td>;
}

function IconBack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 4v5h5M20 20v-5h-5M5.5 9a7 7 0 0112.6-2.5M18.5 15a7 7 0 01-12.6 2.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconExit({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M15 17l5-5-5-5M20 12H9M12 4H6a2 2 0 00-2 2v12a2 2 0 002 2h6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

function IconOverview({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 20V10M12 20V4M20 20v-7"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconProjects({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 7l8-4 8 4-8 4-8-4zM4 12l8 4 8-4M4 17l8 4 8-4"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEmployees({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M17 20v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1M10 11a4 4 0 100-8 4 4 0 000 8zM19 8a3 3 0 010 6M22 20v-1a3.5 3.5 0 00-2.5-3.4"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconAttendance({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 9l1.8 1.8L14.5 7.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLeads({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M9 4h6a1 1 0 011 1v1H8V5a1 1 0 011-1zM6 6h12v14a1 1 0 01-1 1H7a1 1 0 01-1-1V6zM9 11h6M9 15h4"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBuilder({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 20h4l10.5-10.5a2.121 2.121 0 00-3-3L5 17v3zM14 6l4 4"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
