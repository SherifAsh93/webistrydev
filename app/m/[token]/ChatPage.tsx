"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { getMessagesByToken } from "@/app/actions/get-messages";
import { sendClientMessage } from "@/app/actions/send-message";
import Logo from "@/components/Logo";

type Message = {
  id: number;
  sender: string;
  body: string;
  createdAt: Date | null;
};

function formatTime(d: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage({ token }: { token: string }) {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [clientName, setClientName] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const result = await getMessagesByToken(token);
    if (!result) { setNotFound(true); return; }
    setClientName(result.lead.name || "");
    setMsgs(result.messages as Message[]);
    setLoaded(true);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    setInput("");
    await sendClientMessage(token, body);
    await load();
    setSending(false);
    inputRef.current?.focus();
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#f7f6ff] flex items-center justify-center px-4" dir="rtl">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h1 className="text-xl font-extrabold text-slate-900 mb-2">الرابط غير صحيح</h1>
          <p className="text-slate-500 text-sm">تأكد من الرابط أو تواصل مع شريف مباشرةً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6ff] flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-violet-100 px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Logo size={28} />
          <div>
            <div className="font-extrabold text-slate-900 text-sm leading-tight">
              Webistry<span className="text-gradient">dev</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold tracking-wide">محادثتك مع شريف</div>
          </div>
        </div>
      </header>

      {/* Intro banner */}
      <div className="bg-white border-b border-violet-50 px-4 py-5">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-2xl mb-1">👋</p>
          <h1 className="text-base font-extrabold text-slate-900 mb-1">
            أهلاً {clientName}، أنا شريف
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            هذا فضاء محادثتنا الخاص — يمكنك إرسال أي تفاصيل إضافية وسأرد عليك في أقرب وقت
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-4">
        <div className="max-w-lg mx-auto flex flex-col gap-3">
          {!loaded && (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-[3px] border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          )}

          {loaded && msgs.length === 0 && (
            <div className="text-center py-14">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                لا توجد رسائل بعد — أرسل أول رسالة وسأرد عليك قريباً
              </p>
            </div>
          )}

          {msgs.map((msg) => {
            const isClient = msg.sender === "client";
            return (
              <div key={msg.id} className={`flex ${isClient ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isClient
                      ? "bg-white border border-slate-200 text-slate-800 rounded-tr-none"
                      : "text-white rounded-tl-none"
                  }`}
                  style={!isClient ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)" } : {}}
                >
                  <p className={`text-[10px] font-bold mb-1.5 ${isClient ? "text-slate-400" : "text-violet-200"}`}>
                    {isClient ? "أنت" : "شريف"}
                  </p>
                  <p>{msg.body}</p>
                  <p className={`text-[9px] mt-2 ${isClient ? "text-slate-400" : "text-violet-300"}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-violet-100 px-4 py-3 sticky bottom-0">
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="field flex-1 rounded-2xl px-4 py-3 text-sm"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="btn-primary w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {sending
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send size={16} />
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
