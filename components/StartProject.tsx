"use client";
import { useState, useRef, useEffect } from "react";
import { CheckCircle2, Mic, Square, RotateCcw, Send, Play, Pause, X } from "lucide-react";
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

export default function StartProject() {
  const { t } = useLang();
  const sp = t.startProject;

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !textMessage.trim()) return;

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
                setName(""); setPhone(""); setTextMessage("");
                setAudioBlob(null); setAudioUrl(null);
                setRecordState("idle"); setRecordSeconds(0);
                setShowVoice(false);
                setChatToken(null); setChatLinkCopied(false);
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

  return (
    <section id="start-project" className="py-16 px-4 md:px-6 bg-white">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="section-label justify-center mb-4">{sp.sectionLabel}</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {sp.title1}
            <br />
            <span className="text-gradient">{sp.title2}</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">{sp.desc}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Message card — text is primary */}
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
                placeholder={sp.textPlaceholder}
                className="field w-full rounded-2xl px-4 py-3 text-sm resize-none"
              />
            </div>

            {/* Optional voice note section */}
            <div className="border-t border-slate-100 pt-4">
              <AnimatePresence mode="wait">
                {/* Voice add toggle — shown when voice is not active */}
                {!showVoice && recordState === "idle" && (
                  <motion.div
                    key="voice-toggle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
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

                {/* IDLE — show compact recorder start */}
                {showVoice && recordState === "idle" && (
                  <motion.div
                    key="idle-compact"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-between gap-3"
                  >
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

                {/* REQUESTING */}
                {recordState === "requesting" && (
                  <motion.div
                    key="requesting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 py-2"
                  >
                    <div className="w-5 h-5 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin shrink-0" />
                    <p className="text-sm text-slate-500 font-medium">{sp.voiceRequesting}</p>
                  </motion.div>
                )}

                {/* RECORDING */}
                {recordState === "recording" && (
                  <motion.div
                    key="recording"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse shrink-0" />
                      <span className="text-xl font-black text-slate-900 tabular-nums">
                        {formatTime(recordSeconds)}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{sp.voiceRecording}</span>
                    </div>

                    <div className="flex items-center gap-1.5 h-8">
                      {WAVE_CONFIG.map((cfg, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-violet-500 rounded-full origin-center animate-wave-bar"
                          style={{
                            height: "100%",
                            animationDuration: cfg.dur,
                            animationDelay: cfg.delay,
                          }}
                        />
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

                {/* RECORDED */}
                {recordState === "recorded" && (
                  <motion.div
                    key="recorded"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3"
                  >
                    {audioUrl && (
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 size={16} />
                        <span className="font-bold text-sm">
                          {sp.voiceRecorded} — {formatTime(recordSeconds)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={togglePlay}
                          className="flex items-center gap-1.5 px-3 py-2 bg-violet-50 border border-violet-200 text-violet-700 font-bold rounded-xl hover:bg-violet-100 transition-all text-xs"
                        >
                          {isPlaying ? <><Pause size={12} /> {sp.voicePause}</> : <><Play size={12} /> {sp.voicePlay}</>}
                        </button>
                        <button
                          type="button"
                          onClick={reRecord}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all text-xs"
                        >
                          <RotateCcw size={12} />
                          {sp.voiceRerecord}
                        </button>
                        <button
                          type="button"
                          onClick={removeVoice}
                          className="flex items-center gap-1 px-2 py-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Contact card */}
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
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder={sp.phonePlaceholder}
                  className="field w-full rounded-xl px-4 py-3 text-sm"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">{sp.contactNote}</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary flex items-center justify-center gap-2.5 py-4 text-base w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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
        </form>
      </div>
    </section>
  );
}
