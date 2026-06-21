"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { getLeads } from "@/app/actions/get-leads";
import { updateLeadStatus } from "@/app/actions/update-lead";
import { deleteLead } from "@/app/actions/delete-lead";
import { LogOut, RefreshCw, MessageSquare, Phone, Mail, Calendar, Tag, DollarSign, Trash2, CheckCircle, Archive, Bell, Link2, Send, MessageCircle } from "lucide-react";
import { getMessagesByLeadId } from "@/app/actions/get-messages";
import { sendAdminMessage } from "@/app/actions/send-message";

type Status = "new" | "contacted" | "archived";

type Lead = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  projectType: string | null;
  reference: string | null;
  budget: string | null;
  message: string | null;
  voiceNote: string | null;
  chatToken: string | null;
  createdAt: Date | null;
  status: Status;
};

type ChatMessage = {
  id: number;
  sender: string;
  body: string;
  createdAt: Date | null;
};

const ADMIN_PW = "114891";

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const TYPE_COLORS: Record<string, string> = {
  ecommerce: "bg-amber-100 text-amber-700 border-amber-200",
  website:   "bg-pink-100 text-pink-700 border-pink-200",
  "web-app": "bg-violet-100 text-violet-700 border-violet-200",
  system:    "bg-teal-100 text-teal-700 border-teal-200",
  landing:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  other:     "bg-slate-100 text-slate-600 border-slate-200",
  fashion:   "bg-pink-100 text-pink-700 border-pink-200",
  clinic:    "bg-teal-100 text-teal-700 border-teal-200",
  corporate: "bg-sky-100 text-sky-700 border-sky-200",
};

const STATUS_CONFIG = {
  new:       { label: "New",       color: "bg-emerald-100 text-emerald-700 border-emerald-300", dot: "bg-emerald-500" },
  contacted: { label: "Contacted", color: "bg-sky-100 text-sky-700 border-sky-200",            dot: "bg-sky-500" },
  archived:  { label: "Archived",  color: "bg-slate-100 text-slate-500 border-slate-200",      dot: "bg-slate-400" },
};

const FILTER_TABS: { key: "all" | Status; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "new",       label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "archived",  label: "Archived" },
];

export default function AdminPage() {
  const [authed, setAuthed]         = useState(false);
  const [pw, setPw]                 = useState("");
  const [pwError, setPwError]       = useState(false);
  const [leads, setLeads]           = useState<Lead[]>([]);
  const [loading, setLoading]       = useState(false);
  const [expanded, setExpanded]     = useState<number | null>(null);
  const [filter, setFilter]         = useState<"all" | Status>("all");
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [updating, setUpdating]     = useState<number | null>(null);
  const [chatMsgs, setChatMsgs]     = useState<Record<number, ChatMessage[]>>({});
  const [chatInput, setChatInput]   = useState<Record<number, string>>({});
  const [chatSending, setChatSending] = useState<number | null>(null);
  const [copiedToken, setCopiedToken] = useState<number | null>(null);
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

  async function handleStatusChange(id: number, status: Status) {
    setUpdating(id);
    await updateLeadStatus(id, status);
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
    setUpdating(null);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this message permanently?")) return;
    setDeleting(id);
    await deleteLead(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setExpanded(null);
    setDeleting(null);
  }

  async function loadChat(leadId: number) {
    const msgs = await getMessagesByLeadId(leadId);
    setChatMsgs((prev) => ({ ...prev, [leadId]: msgs as ChatMessage[] }));
  }

  async function handleAdminReply(leadId: number) {
    const body = (chatInput[leadId] || "").trim();
    if (!body) return;
    setChatSending(leadId);
    setChatInput((prev) => ({ ...prev, [leadId]: "" }));
    await sendAdminMessage(leadId, body);
    await loadChat(leadId);
    setChatSending(null);
  }

  function copyClientLink(lead: Lead) {
    if (!lead.chatToken) return;
    navigator.clipboard.writeText(`https://webistrydev.com/m/${lead.chatToken}`);
    setCopiedToken(lead.id);
    setTimeout(() => setCopiedToken(null), 2500);
  }

  useEffect(() => {
    if (expanded !== null) loadChat(expanded);
  }, [expanded]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f7f6ff] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <Logo size={36} />
            <div>
              <div className="font-extrabold text-slate-900 text-lg leading-tight">Webistry<span className="text-gradient">dev</span></div>
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
              {pwError && <p className="text-xs text-rose-500 mt-1.5 font-semibold">Wrong password.</p>}
            </div>
            <button type="submit" className="btn-primary py-3 text-sm">Enter →</button>
          </form>
        </div>
      </div>
    );
  }

  const newCount  = leads.filter((l) => l.status === "new").length;
  const todayCount = leads.filter((l) => {
    if (!l.createdAt) return false;
    return new Date(l.createdAt).toDateString() === new Date().toDateString();
  }).length;
  const weekCount = leads.filter((l) => {
    if (!l.createdAt) return false;
    return Date.now() - new Date(l.createdAt).getTime() < 7 * 86400000;
  }).length;

  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  return (
    <div className="min-h-screen bg-[#f7f6ff]">
      {/* Header */}
      <header className="bg-white border-b border-violet-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Logo size={26} />
            <div className="min-w-0">
              <span className="font-extrabold text-slate-900 text-sm">Webistry<span className="text-gradient">dev</span></span>
              <span className="ml-2 text-xs font-bold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">Admin</span>
            </div>
            {newCount > 0 && (
              <span className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shrink-0">
                <Bell size={9} /> {newCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={load} disabled={loading} className="flex items-center gap-1 px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-violet-700 bg-slate-50 border border-slate-200 rounded-xl transition-all">
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={() => { sessionStorage.removeItem("wc-admin"); router.push("/"); }} className="flex items-center gap-1 px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 bg-slate-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all">
              <LogOut size={12} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total",   value: leads.length,  icon: MessageSquare, color: "text-violet-600 bg-violet-50 border-violet-200" },
            { label: "New",     value: newCount,       icon: Bell,          color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
            { label: "Today",   value: todayCount,     icon: Calendar,      color: "text-sky-600 bg-sky-50 border-sky-200" },
          ].map((stat, i) => (
            <div key={i} className="card rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon size={15} />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">{stat.value}</div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => {
            const count = tab.key === "all" ? leads.length : leads.filter((l) => l.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  filter === tab.key
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-white text-slate-500 border-slate-200 hover:border-violet-200"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${filter === tab.key ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="flex flex-col gap-2.5">
          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-[3px] border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="card rounded-2xl p-12 text-center">
              <MessageSquare size={28} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-semibold text-sm">
                {filter === "all" ? "No messages yet." : `No ${filter} messages.`}
              </p>
            </div>
          )}

          {filtered.map((lead) => {
            const sc = STATUS_CONFIG[lead.status];
            const isExpanded = expanded === lead.id;
            const isNew = lead.status === "new";

            return (
              <div
                key={lead.id}
                className={`card rounded-2xl overflow-hidden transition-all ${isNew ? "border-l-4 border-l-emerald-400" : ""}`}
              >
                {/* Summary row */}
                <button
                  className="w-full text-left p-4 flex items-start gap-3"
                  onClick={() => setExpanded(isExpanded ? null : lead.id)}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-sm font-black text-violet-700 shrink-0">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Name + badges row */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="font-extrabold text-slate-900 text-sm">{lead.name}</span>
                      {/* Status badge */}
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                      {/* Voice badge or type badge */}
                      {lead.voiceNote && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider bg-violet-100 text-violet-700 border-violet-200">
                          🎙️ voice
                        </span>
                      )}
                      {lead.projectType && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${TYPE_COLORS[lead.projectType] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {lead.projectType}
                        </span>
                      )}
                    </div>
                    {/* Message preview */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {lead.message || (lead.voiceNote ? "🎙️ Voice message" : "—")}
                    </p>
                    {/* Meta row */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {lead.phone && (
                        <span className="flex items-center gap-0.5 text-[10px] text-sky-600 font-semibold">
                          <Phone size={9} />{lead.phone}
                        </span>
                      )}
                      {lead.email && (
                        <span className="flex items-center gap-0.5 text-[10px] text-violet-600 font-semibold truncate max-w-[140px]">
                          <Mail size={9} />{lead.email}
                        </span>
                      )}
                      <span className="text-[9px] text-slate-300 ml-auto shrink-0">{formatDate(lead.createdAt)}</span>
                    </div>
                  </div>

                  <span className={`text-slate-300 text-xs shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}>▾</span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4 space-y-4">
                    {/* Voice note */}
                    {lead.voiceNote && (
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">🎙️ Voice Message</p>
                        <audio controls src={lead.voiceNote} className="w-full rounded-xl h-10" />
                      </div>
                    )}

                    {/* Text message */}
                    {lead.message && (
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Message</p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{lead.message}</p>
                      </div>
                    )}

                    {/* Details grid */}
                    {(lead.budget || lead.reference) && (
                      <div className="flex gap-4 flex-wrap">
                        {lead.budget && (
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Budget</p>
                            <p className="text-xs text-slate-700 font-semibold flex items-center gap-1"><DollarSign size={10} />{lead.budget}</p>
                          </div>
                        )}
                        {lead.reference && (
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Reference</p>
                            <p className="text-xs text-slate-700 font-semibold flex items-center gap-1"><Tag size={10} />{lead.reference}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status controls */}
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Status</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {(["new", "contacted", "archived"] as Status[]).map((s) => {
                          const cfg = STATUS_CONFIG[s];
                          const isActive = lead.status === s;
                          return (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(lead.id, s)}
                              disabled={updating === lead.id || isActive}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                isActive
                                  ? `${cfg.color} cursor-default`
                                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                              } disabled:opacity-60`}
                            >
                              {s === "new"       && <Bell size={10} />}
                              {s === "contacted" && <CheckCircle size={10} />}
                              {s === "archived"  && <Archive size={10} />}
                              {cfg.label}
                              {isActive && " ✓"}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
                      {lead.phone && (
                        <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#25D366] rounded-xl hover:bg-[#1eb85a] transition">
                          💬 WhatsApp
                        </a>
                      )}
                      {lead.email && (
                        <a href={`mailto:${lead.email}?subject=Re: Your project request`} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-violet-700 bg-violet-100 border border-violet-200 rounded-xl hover:bg-violet-200 transition">
                          ✉️ Email
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(lead.id)}
                        disabled={deleting === lead.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition ml-auto disabled:opacity-50"
                      >
                        <Trash2 size={11} />
                        {deleting === lead.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>

                    {/* Chat section */}
                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <MessageCircle size={10} /> Conversation
                        </p>
                        {lead.chatToken && (
                          <button
                            onClick={() => copyClientLink(lead)}
                            className={`flex items-center gap-1 text-[10px] font-bold transition ${copiedToken === lead.id ? "text-emerald-600" : "text-violet-600 hover:text-violet-800"}`}
                          >
                            <Link2 size={10} />
                            {copiedToken === lead.id ? "Copied!" : "Copy Client Link"}
                          </button>
                        )}
                      </div>

                      {/* Message thread */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-3 max-h-52 overflow-y-auto flex flex-col gap-2.5 mb-3">
                        {!(chatMsgs[lead.id]?.length) ? (
                          <p className="text-[11px] text-slate-400 text-center py-5">No messages yet — start the conversation below.</p>
                        ) : (
                          chatMsgs[lead.id].map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                                msg.sender === "admin"
                                  ? "text-white rounded-br-sm"
                                  : "bg-slate-100 text-slate-700 rounded-bl-sm"
                              }`} style={msg.sender === "admin" ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)" } : {}}>
                                <p className={`text-[9px] font-bold mb-1 ${msg.sender === "admin" ? "text-violet-200" : "text-slate-400"}`}>
                                  {msg.sender === "admin" ? "You" : lead.name}
                                </p>
                                <p>{msg.body}</p>
                                <p className={`text-[9px] mt-1 ${msg.sender === "admin" ? "text-violet-300" : "text-slate-400"}`}>
                                  {formatDate(msg.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Reply input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput[lead.id] || ""}
                          onChange={(e) => setChatInput((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && handleAdminReply(lead.id)}
                          placeholder="Type a reply..."
                          className="field flex-1 rounded-xl px-3 py-2 text-xs"
                          disabled={chatSending === lead.id}
                        />
                        <button
                          onClick={() => handleAdminReply(lead.id)}
                          disabled={chatSending === lead.id || !(chatInput[lead.id] || "").trim()}
                          className="btn-primary px-3 py-2 rounded-xl flex items-center gap-1 text-xs disabled:opacity-50"
                        >
                          {chatSending === lead.id
                            ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <><Send size={11} /> Send</>
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
