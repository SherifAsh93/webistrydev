"use client";
import { useState, useRef, useEffect } from "react";
import { CheckCircle2, Mic, Square, RotateCcw, Send, Play, Pause, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitInquiry } from "@/app/actions/submit-inquiry";
import { useLang } from "@/lib/language-context";

type RecordState = "idle" | "requesting" | "recording" | "recorded";
type FormStatus = "idle" | "sending" | "success";

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

const WAVE_CONFIG = [
  { dur: "0.5s", delay: "0s" },
  { dur: "0.7s", delay: "0.12s" },
  { dur: "0.4s", delay: "0.22s" },
  { dur: "0.6s", delay: "0.05s" },
  { dur: "0.8s", delay: "0.17s" },
  { dur: "0.45s", delay: "0.28s" },
  { dur: "0.65s", delay: "0.08s" },
  { dur: "0.55s", delay: "0.19s" },
  { dur: "0.7s", delay: "0.13s" },
  { dur: "0.5s", delay: "0.24s" },
];

const WHATSAPP_NUMBER = "201101997525";

export default function StartProject() {
  const { t } = useLang();
  const sp = t.startProject;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [textMessage, setTextMessage] = useState("");
  const [projectType, setProjectType] = useState<string | null>(null);
  const [showVoice, setShowVoice] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");

  const [chatToken, setChatToken] = useState<string | null>(null);
  const [chatLinkCopied, setChatLinkCopied] = useState(false);
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audioUrl]);

  const activePlaceholder = projectType
    ? (sp as any).typePlaceholders?.[projectType] ?? sp.textPlaceholder
    : sp.textPlaceholder;

  async function startRecording() {
    setRecordState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setRecordState("recorded");
        stream.getTracks().forEach((tr) => tr.stop());
      };

      recorder.start(250);
      setRecordState("recording");
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      setRecordState("idle");
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  function reRecord() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordState("idle");
    setRecordSeconds(0);
    setIsPlaying(false);
    setShowVoice(true);
  }

  function removeVoice() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordState("idle");
    setRecordSeconds(0);
    setIsPlaying(false);
    setShowVoice(false);
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  async function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  function validatePhone(value: string): string {
    const digits = value.replace(/\D/g, "");
    const normalized = digits.startsWith("20") ? "0" + digits.slice(2) : digits;
    if (!normalized) return t.lang === "ar" ? "رقم الموبايل مطلوب" : "Phone number is required";
    if (!/^(010|011|012|015)\d{8}$/.test(normalized))
      return t.lang === "ar"
        ? "رقم غير صحيح — لازم يبدأ بـ 010 أو 011 أو 012 أو 015"
        : "Invalid number — must start with 010, 011, 012, or 015";
    return "";
  }

  function handlePhoneChange(value: string) {
    setPhone(value);
    if (phoneError) setPhoneError(validatePhone(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validatePhone(phone);
    if (err) { setPhoneError(err); return; }
    if (!name.trim() || !textMessage.trim()) return;

    setFormStatus("sending");

    let voiceNote: string | null = null;
    if (audioBlob) {
      voiceNote = await blobToDataUrl(audioBlob);
    }

    const result = await submitInquiry({ name, phone, message: textMessage, voiceNote });
    if (result.chatToken) setChatToken(result.chatToken);
    setFormStatus("success");
  }

  const canSubmit =
    formStatus !== "sending" &&
    name.trim() !== "" &&
    phone.trim() !== "" &&
    !validatePhone(phone) &&
    textMessage.trim() !== "";

  if (formStatus === "success") {
    const chatUrl = chatToken ? `https://webistrydev.com/m/${chatToken}` : null;

    function copyChatLink() {
      if (!chatUrl) return;
      navigator.clipboard.writeText(chatUrl);
      setChatLinkCopied(true);
      setTimeout(() => setChatLinkCopied(false), 2500);
    }

    return (
      <section id="start-project" className="py-16 px-4 md:px-6 bg-white">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <CheckCircle2 size={44} className="text-emerald-500" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900">{sp.successTitle}</h2>
            <p className="text-slate-500 leading-relaxed text-lg">
              {sp.successMessage.replace("{name}", name)}
            </p>
            <p className="text-sm text-slate-400">{sp.successNote}</p>

            {chatUrl && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full card rounded-3xl p-6 text-start"
                style={{ borderColor: "rgba(124,58,237,0.2)", background: "linear-gradient(135deg, #faf8ff 0%, #f3f0ff 100%)" }}
              >
                <p className="text-base font-extrabold text-violet-700 mb-2">{sp.chatSaveTitle}</p>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{sp.chatSaveDesc}</p>

                <div className="bg-white border border-violet-200 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono break-all flex-1">{chatUrl}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyChatLink}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                      chatLinkCopied
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-white border-violet-200 text-violet-700 hover:bg-violet-50"
                    }`}
                  >
                    {chatLinkCopied ? sp.chatCopied : sp.chatCopy}
                  </button>
                  <a
                    href={chatUrl}
                    target="_blank"
                    className="flex-1 btn-primary py-3 rounded-xl text-sm flex items-center justify-center"
                  >
                    {sp.chatOpen}
                  </a>
                </div>
              </motion.div>
            )}

            <button
              onClick={() => {
                setFormStatus("idle");
                setName(""); setPhone(""); setPhoneError(""); setTextMessage("");
                setAudioBlob(null); setAudioUrl(null);
                setRecordState("idle"); setRecordSeconds(0);
                setShowVoice(false);
                setChatToken(null); setChatLinkCopied(false);
                setProjectType(null);
              }}
              className="text-sm font-bold text-violet-600 hover:text-violet-800 underline"
            >
              {sp.successAgain}
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  const projectTypes: { key: string; label: string }[] = (sp as any).projectTypes ?? [];
  const trustBadges: string[] = (sp as any).trustBadges ?? [];
  const nextSteps: string[] = (sp as any).nextSteps ?? [];

  return (
    <section id="start-project" className="py-16 px-4 md:px-6 bg-white">
      <div className="max-w-lg mx-auto">

        {/* ── Trust badges ─────────────────────────────────── */}
        {trustBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {trustBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700"
              >
                {badge}
              </span>
            ))}
          </motion.div>
        )}

        {/* ── Header ───────────────────────────────────────── */}
        <div className="text-center mb-8">
          <p className="section-label justify-center mb-4">{sp.sectionLabel}</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {sp.title1}
            <br />
            <span className="text-gradient">{sp.title2}</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">{sp.desc}</p>
        </div>

        {/* ── Project type picker ───────────────────────────── */}
        {projectTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mb-6"
          >
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 text-center mb-3">
              {(sp as any).typePickerLabel}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {projectTypes.map((pt) => (
                <button
                  key={pt.key}
                  type="button"
                  onClick={() => setProjectType(projectType === pt.key ? null : pt.key)}
                  className={`py-2.5 px-2 rounded-2xl text-xs font-bold border transition-all text-center leading-snug ${
                    projectType === pt.key
                      ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200"
                      : "bg-white border-slate-200 text-slate-600 hover:border-violet-300 hover:bg-violet-50"
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* ── Message card ─────────────────────────────────── */}
          <div className="card rounded-3xl p-6 flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-2">
                {sp.textLabel} <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                rows={5}
                required
                placeholder={activePlaceholder}
                className="field w-full rounded-2xl px-4 py-3 text-sm resize-none"
              />
            </div>

            {/* Optional voice note */}
            <div className="border-t border-slate-100 pt-4">
              <AnimatePresence mode="wait">
                {!showVoice && recordState === "idle" && (
                  <motion.div key="voice-toggle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <button
                      type="button"
                      onClick={() => setShowVoice(true)}
                      className="flex items-center gap-2 text-xs text-violet-500 hover:text-violet-700 font-semibold transition-colors"
                    >
                      <Mic size={13} />
                      {sp.voiceAddNote}
                    </button>
                  </motion.div>
                )}

                {showVoice && recordState === "idle" && (
                  <motion.div key="idle-compact" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 border border-violet-200 text-violet-700 font-bold rounded-2xl hover:bg-violet-100 transition-all text-sm"
                    >
                      <Mic size={15} />
                      {sp.voiceTitle}
                    </button>
                    <button
                      type="button"
                      onClick={removeVoice}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors"
                    >
                      <X size={12} />
                      {sp.voiceRemoveNote}
                    </button>
                  </motion.div>
                )}

                {recordState === "requesting" && (
                  <motion.div key="requesting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 py-2">
                    <div className="w-5 h-5 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin shrink-0" />
                    <p className="text-sm text-slate-500 font-medium">{sp.voiceRequesting}</p>
                  </motion.div>
                )}

                {recordState === "recording" && (
                  <motion.div key="recording" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse shrink-0" />
                      <span className="text-xl font-black text-slate-900 tabular-nums">{formatTime(recordSeconds)}</span>
                      <span className="text-xs text-slate-400 font-semibold">{sp.voiceRecording}</span>
                    </div>
                    <div className="flex items-center gap-1.5 h-8">
                      {WAVE_CONFIG.map((cfg, i) => (
                        <div key={i} className="w-1.5 bg-violet-500 rounded-full origin-center animate-wave-bar" style={{ height: "100%", animationDuration: cfg.dur, animationDelay: cfg.delay }} />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition-all text-sm self-start"
                    >
                      <Square size={13} fill="currentColor" />
                      {sp.voiceStop}
                    </button>
                  </motion.div>
                )}

                {recordState === "recorded" && (
                  <motion.div key="recorded" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="flex flex-col gap-3">
                    {audioUrl && (
                      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 size={16} />
                        <span className="font-bold text-sm">{sp.voiceRecorded} — {formatTime(recordSeconds)}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <button type="button" onClick={togglePlay} className="flex items-center gap-1.5 px-3 py-2 bg-violet-50 border border-violet-200 text-violet-700 font-bold rounded-xl hover:bg-violet-100 transition-all text-xs">
                          {isPlaying ? <><Pause size={12} /> {sp.voicePause}</> : <><Play size={12} /> {sp.voicePlay}</>}
                        </button>
                        <button type="button" onClick={reRecord} className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all text-xs">
                          <RotateCcw size={12} />
                          {sp.voiceRerecord}
                        </button>
                        <button type="button" onClick={removeVoice} className="flex items-center gap-1 px-2 py-2 text-slate-400 hover:text-rose-500 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Contact card ─────────────────────────────────── */}
          <div className="card rounded-3xl p-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-violet-600 mb-4">
              {t.lang === "ar" ? "إزاي أوصلك؟" : "How to reach you"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">
                  {sp.nameLabel} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={sp.namePlaceholder}
                  className="field w-full rounded-xl px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">
                  {sp.phoneLabel} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => setPhoneError(validatePhone(phone))}
                  required
                  placeholder={sp.phonePlaceholder}
                  className={`field w-full rounded-xl px-4 py-3 text-sm ${phoneError ? "border-rose-400 focus:ring-rose-300" : ""}`}
                />
                {phoneError && (
                  <p className="text-xs text-rose-500 font-semibold mt-1.5">{phoneError}</p>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">{sp.contactNote}</p>
          </div>

          {/* ── Submit button ─────────────────────────────────── */}
          <div className="relative">
            {canSubmit && (
              <span className="absolute inset-0 rounded-2xl bg-violet-500 opacity-30 animate-ping pointer-events-none" />
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className="relative btn-primary flex items-center justify-center gap-2.5 py-4 text-base w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {formStatus === "sending" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {sp.sending}
                </>
              ) : (
                <>
                  <Send size={18} />
                  {sp.submit}
                </>
              )}
            </button>
          </div>

          {/* ── What happens next ────────────────────────────── */}
          {nextSteps.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="card rounded-2xl p-5"
              style={{ background: "linear-gradient(135deg, #faf8ff 0%, #f3f0ff 100%)", borderColor: "rgba(124,58,237,0.12)" }}
            >
              <p className="text-xs font-extrabold uppercase tracking-widest text-violet-500 mb-3 text-center">
                {(sp as any).nextStepsTitle}
              </p>
              <ol className="flex flex-col gap-2">
                {nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </motion.div>
          )}

          {/* ── WhatsApp direct fallback ─────────────────────── */}
          <div className="text-center pt-1">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <MessageCircle size={15} />
              {(sp as any).whatsappDirect}
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}
