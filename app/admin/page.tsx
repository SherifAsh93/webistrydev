"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { getLeads } from "@/app/actions/get-leads";
import { LogOut, RefreshCw, MessageSquare, Phone, Mail, Calendar, Tag, DollarSign } from "lucide-react";

type Lead = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  projectType: string;
  reference: string | null;
  budget: string | null;
  message: string;
  createdAt: Date | null;
};

const ADMIN_PW = "114891";

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const TYPE_COLORS: Record<string, string> = {
  ecommerce: "bg-amber-100 text-amber-700 border-amber-200",
  fashion: "bg-pink-100 text-pink-700 border-pink-200",
  clinic: "bg-teal-100 text-teal-700 border-teal-200",
  "web-app": "bg-violet-100 text-violet-700 border-violet-200",
  corporate: "bg-sky-100 text-sky-700 border-sky-200",
  landing: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getLeads();
    setLeads(data as Lead[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("wc-admin") === ADMIN_PW) {
      setAuthed(true);
      load();
    }
  }, [load]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PW) {
      sessionStorage.setItem("wc-admin", ADMIN_PW);
      setAuthed(true);
      load();
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 2000);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("wc-admin");
    router.push("/");
  }

  /* ── Login screen ── */
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f7f6ff] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <Logo size={36} />
            <div>
              <div className="font-extrabold text-slate-900 text-lg leading-tight">
                Web<span className="text-gradient">Corner</span>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Panel</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="card rounded-2xl p-8 flex flex-col gap-5">
            <h1 className="text-xl font-extrabold text-slate-900 text-center">Admin Access</h1>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Password</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Enter password"
                autoFocus
                className={`field w-full rounded-xl px-4 py-3 text-sm ${pwError ? "border-rose-400 bg-rose-50" : ""}`}
              />
              {pwError && <p className="text-xs text-rose-500 mt-1.5 font-semibold">Wrong password. Try again.</p>}
            </div>
            <button type="submit" className="btn-primary py-3 text-sm">
              Enter →
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Dashboard ── */
  const today = leads.filter((l) => {
    if (!l.createdAt) return false;
    const d = new Date(l.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div className="min-h-screen bg-[#f7f6ff]">
      {/* Header */}
      <header className="bg-white border-b border-violet-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <div>
              <span className="font-extrabold text-slate-900 text-sm">Web<span className="text-gradient">Corner</span></span>
              <span className="ml-2 text-xs font-bold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-violet-700 bg-slate-50 hover:bg-violet-50 border border-slate-200 rounded-xl transition-all"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all"
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Messages", value: leads.length, icon: MessageSquare, color: "text-violet-600 bg-violet-50 border-violet-200" },
            { label: "Today", value: today, icon: Calendar, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
            { label: "This Week", value: leads.filter((l) => { if (!l.createdAt) return false; const d = new Date(l.createdAt); const now = new Date(); return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000; }).length, icon: Tag, color: "text-sky-600 bg-sky-50 border-sky-200" },
          ].map((stat, i) => (
            <div key={i} className="card rounded-2xl p-5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-400 font-semibold">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Messages list */}
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">
          All Messages <span className="text-slate-400 font-semibold text-sm ml-1">({leads.length})</span>
        </h2>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        )}

        {!loading && leads.length === 0 && (
          <div className="card rounded-2xl p-12 text-center">
            <MessageSquare size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">No messages yet.</p>
            <p className="text-sm text-slate-300 mt-1">Project requests will appear here.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="card rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
            >
              {/* Row summary */}
              <div className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-base shrink-0 font-bold text-violet-700">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-extrabold text-slate-900 text-sm">{lead.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${TYPE_COLORS[lead.projectType] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {lead.projectType}
                    </span>
                    {lead.budget && (
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5">
                        <DollarSign size={9} />{lead.budget}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{lead.message}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[11px] text-sky-600 hover:underline font-semibold">
                        <Phone size={10} />{lead.phone}
                      </a>
                    )}
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[11px] text-violet-600 hover:underline font-semibold">
                        <Mail size={10} />{lead.email}
                      </a>
                    )}
                    <span className="text-[10px] text-slate-300 ml-auto">{formatDate(lead.createdAt)}</span>
                  </div>
                </div>
                <span className={`text-slate-300 text-xs transition-transform shrink-0 mt-1 ${expanded === lead.id ? "rotate-180" : ""}`}>▾</span>
              </div>

              {/* Expanded message */}
              {expanded === lead.id && (
                <div className="border-t border-violet-50 bg-violet-50/50 px-5 py-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Message</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{lead.message}</p>
                  {lead.reference && (
                    <p className="text-xs text-slate-400 mt-3">
                      <span className="font-bold">Reference project:</span> {lead.reference}
                    </p>
                  )}
                  <div className="flex gap-2 mt-4">
                    {lead.phone && (
                      <a
                        href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#25D366] rounded-xl hover:bg-[#1eb85a] transition"
                      >
                        💬 WhatsApp
                      </a>
                    )}
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}?subject=Re: Your project request`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-violet-700 bg-violet-100 border border-violet-200 rounded-xl hover:bg-violet-200 transition"
                      >
                        ✉️ Reply
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
