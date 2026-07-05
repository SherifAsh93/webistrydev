"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, CheckCircle2, Mic, Square, RotateCcw, Send, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitInquiry } from "@/app/actions/submit-inquiry";
import { useLang } from "@/lib/language-context";
import type { Project } from "@/lib/data";

type RecordState = "idle" | "requesting" | "recording" | "recorded";
type FormStatus = "idle" | "sending" | "success";

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

const WAVE_CONFIG = [
  { dur: "0.5s", delay: "0s" }, { dur: "0.7s", delay: "0.12s" },
  { dur: "0.4s", delay: "0.22s" }, { dur: "0.6s", delay: "0.05s" },
  { dur: "0.8s", delay: "0.17s" }, { dur: "0.45s", delay: "0.28s" },
  { dur: "0.65s", delay: "0.08s" }, { dur: "0.55s", delay: "0.19s" },
  { dur: "0.7s", delay: "0.13s" }, { dur: "0.5s", delay: "0.24s" },
];

interface Props {
  project: Project;
  projectDisplayName: string;
  onClose: () => void;
}

export default function ProjectInquiryModal({ project, projectDisplayName, onClose }: Props) {
  const { t } = useLang();
  const sp = t.startProject;
  const m = t.projectModal;
  const isAr = t.lang === "ar";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [textMessage, setTextMessage] = useState("");
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

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audioUrl]);

  async function startRecording() {
    setRecordState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob); setAudioUrl(url); setRecordState("recorded");
        stream.getTracks().forEach((tr) => tr.stop());
      };
      recorder.start(250);
      setRecordState("recording");
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch { setRecordState("idle"); }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  }

  function reRecord() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null); setAudioUrl(null); setRecordState("idle"); setRecordSeconds(0); setIsPlaying(false);
    setShowVoice(true);
  }

  function removeVoice() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null); setAudioUrl(null); setRecordState("idle"); setRecordSeconds(0); setIsPlaying(false);
    setShowVoice(false);
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  }

  async function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !textMessage.trim()) return;
    setFormStatus("sending");
    let voiceNote: string | null = null;
    if (audioBlob) voiceNote = await blobToDataUrl(audioBlob);
    const result = await submitInquiry({
      name,
      phone,
      message: textMessage,
      voiceNote,
      reference: projectDisplayName,
    });
    if (result.chatToken) setChatToken(result.chatToken);
    setFormStatus("success");
  }

  const canSubmit = formStatus !== "sending" && name.trim() !== "" && phone.trim() !== "" && textMessage.trim() !== "";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X size={16} className="text-slate-600" />
        </button>

        {/* Reference Banner */}
        <div className="flex items-center gap-3 p-4 pb-3 border-b border-slate-100">
          <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
            <Image src={project.screenshot} alt={projectDisplayName} fill sizes="56px" className="object-cover object-top" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-violet-500 mb-0.5">{m.referenceLabel}</p>
            <p className="text-sm font-extrabold text-slate-900 truncate">{projectDisplayName}</p>
          </div>
        </div>

        <div className="p-5">
          {/* Success state */}
          {formStatus === "success" ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-5 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{sp.successTitle}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{sp.successMessage.replace("{name}", name)}</p>
                <p className="text-xs text-slate-400 mt-2">{sp.successNote}</p>
              </div>

              {chatToken && (() => {
                const chatUrl = `https://webistrydev.com/m/${chatToken}`;
                function copyChatLink() {
                  navigator.clipboard.writeText(chatUrl);
                  setChatLinkCopied(true);
                  setTimeout(() => setChatLinkCopied(false), 2500);
                }
                return (
                  <div className="w-full card rounded-2xl p-4 text-start" style={{ borderColor: "rgba(124,58,237,0.2)", background: "linear-gradient(135deg,#faf8ff,#f3f0ff)" }}>
                    <p className="text-sm font-extrabold text-violet-700 mb-1">{sp.chatSaveTitle}</p>
                    <p className="text-xs text-slate-500 mb-3">{sp.chatSaveDesc}</p>
                    <div className="bg-white border border-violet-200 rounded-xl px-3 py-2 mb-3">
                      <span className="text-xs text-slate-500 font-mono break-all">{chatUrl}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={copyChatLink} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${chatLinkCopied ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-violet-200 text-violet-700 hover:bg-violet-50"}`}>
                        {chatLinkCopied ? sp.chatCopied : sp.chatCopy}
                      </button>
                      <a href={chatUrl} target="_blank" className="flex-1 btn-primary py-2.5 rounded-xl text-xs flex items-center justify-center">
                        {sp.chatOpen}
                      </a>
                    </div>
                  </div>
                );
              })()}

              <button onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline">{m.close}</button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 mb-0.5">{m.title}</h2>
                <p className="text-xs text-slate-400">{m.subtitle}</p>
              </div>

              {/* Message — text is primary */}
              <div className="card rounded-2xl p-4 flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1.5">
                    {sp.textLabel} <span className="text-rose-400">*</span>
                  </label>
                  <textarea value={textMessage} onChange={e => setTextMessage(e.target.value)} rows={4}
                    required placeholder={sp.textPlaceholder} className="field w-full rounded-xl px-4 py-3 text-sm resize-none" />
                </div>

                {/* Optional voice */}
                <div className="border-t border-slate-100 pt-3">
                  <AnimatePresence mode="wait">
                    {!showVoice && recordState === "idle" && (
                      <motion.div key="voice-toggle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <button type="button" onClick={() => setShowVoice(true)}
                          className="flex items-center gap-1.5 text-xs text-violet-500 hover:text-violet-700 font-semibold transition-colors">
                          <Mic size={12} />{sp.voiceAddNote}
                        </button>
                      </motion.div>
                    )}

                    {showVoice && recordState === "idle" && (
                      <motion.div key="idle-compact" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                        className="flex items-center justify-between gap-2">
                        <button type="button" onClick={startRecording}
                          className="flex items-center gap-1.5 px-3 py-2 bg-violet-50 border border-violet-200 text-violet-700 font-bold rounded-xl text-xs hover:bg-violet-100 transition-all">
                          <Mic size={13} />{sp.voiceTitle}
                        </button>
                        <button type="button" onClick={removeVoice}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors">
                          <X size={11} />{sp.voiceRemoveNote}
                        </button>
                      </motion.div>
                    )}

                    {recordState === "requesting" && (
                      <motion.div key="requesting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 py-1">
                        <div className="w-4 h-4 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin shrink-0" />
                        <p className="text-xs text-slate-500">{sp.voiceRequesting}</p>
                      </motion.div>
                    )}

                    {recordState === "recording" && (
                      <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                          <span className="text-lg font-black text-slate-900 tabular-nums">{formatTime(recordSeconds)}</span>
                          <span className="text-xs text-slate-400 font-semibold">{sp.voiceRecording}</span>
                        </div>
                        <div className="flex items-center gap-1 h-8">
                          {WAVE_CONFIG.map((cfg, i) => (
                            <div key={i} className="w-1 bg-violet-500 rounded-full origin-center animate-wave-bar"
                              style={{ height: "100%", animationDuration: cfg.dur, animationDelay: cfg.delay }} />
                          ))}
                        </div>
                        <button type="button" onClick={stopRecording}
                          className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-xl text-xs hover:bg-rose-100 transition-all self-start">
                          <Square size={11} fill="currentColor" />{sp.voiceStop}
                        </button>
                      </motion.div>
                    )}

                    {recordState === "recorded" && (
                      <motion.div key="recorded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 flex-wrap">
                        {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />}
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle2 size={14} />
                          <span className="font-bold text-xs">{sp.voiceRecorded} — {formatTime(recordSeconds)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <button type="button" onClick={togglePlay}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-50 border border-violet-200 text-violet-700 font-bold rounded-lg text-xs hover:bg-violet-100 transition-all">
                            {isPlaying ? <><Pause size={11} />{sp.voicePause}</> : <><Play size={11} />{sp.voicePlay}</>}
                          </button>
                          <button type="button" onClick={reRecord}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-lg text-xs hover:bg-slate-100 transition-all">
                            <RotateCcw size={11} />{sp.voiceRerecord}
                          </button>
                          <button type="button" onClick={removeVoice}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
                            <X size={13} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Contact */}
              <div className="card rounded-2xl p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-violet-600 mb-3">
                  {isAr ? "إزاي أوصلك؟" : "How to reach you"}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5">{sp.nameLabel} <span className="text-rose-400">*</span></label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required
                      placeholder={sp.namePlaceholder} className="field w-full rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5">{sp.phoneLabel} <span className="text-rose-400">*</span></label>
                    <input type="tel" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} required
                      placeholder={sp.phonePlaceholder} className="field w-full rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={!canSubmit}
                className="btn-primary flex items-center justify-center gap-2 py-3.5 text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                {formStatus === "sending" ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{sp.sending}</>
                ) : (
                  <><Send size={16} />{sp.submit}</>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
