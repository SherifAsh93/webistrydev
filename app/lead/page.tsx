"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Mic, Square, RotateCcw, Play, Pause, PhoneCall, X } from "lucide-react";
import { submitInquiry } from "@/app/actions/submit-inquiry";
import Logo from "@/components/Logo";

type RecordState = "idle" | "requesting" | "recording" | "recorded";
type FormStatus = "idle" | "sending" | "success" | "error";

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function validatePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("20") ? "0" + digits.slice(2) : digits;
  if (!normalized) return "من فضلك اكتب رقم تليفونك";
  if (!/^(010|011|012|015)\d{8}$/.test(normalized))
    return "الرقم مش صحيح — لازم يبدأ بـ 010 أو 011 أو 012 أو 015";
  return "";
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
];

export default function LeadPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
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

  function validateFields(): boolean {
    let ok = true;
    if (!name.trim()) {
      setNameError("من فضلك اكتب اسمك");
      ok = false;
    } else setNameError("");

    const pErr = validatePhone(phone);
    if (pErr) {
      setPhoneError(pErr);
      ok = false;
    } else setPhoneError("");

    return ok;
  }

  async function startRecording() {
    if (!validateFields()) return;
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
      timerRef.current = setInterval(() => setRecordSeconds((p) => p + 1), 1000);
    } catch {
      setRecordState("idle");
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  }

  function cancelVoice() {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordState("idle");
    setRecordSeconds(0);
    setIsPlaying(false);
  }

  function reRecord() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordState("idle");
    setRecordSeconds(0);
    setIsPlaying(false);
    startRecording();
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

  async function submitText() {
    if (!validateFields()) return;
    setFormStatus("sending");
    const result = await submitInquiry({ name, phone, reference: "تسجيل سريع" });
    setFormStatus(result.success ? "success" : "error");
  }

  async function submitVoice() {
    if (!audioBlob) return;
    setFormStatus("sending");
    const voiceNote = await blobToDataUrl(audioBlob);
    const result = await submitInquiry({ name, phone, voiceNote, reference: "تسجيل سريع" });
    setFormStatus(result.success ? "success" : "error");
  }

  function resetAll() {
    setName("");
    setPhone("");
    setNameError("");
    setPhoneError("");
    setFormStatus("idle");
    cancelVoice();
  }

  if (formStatus === "success") {
    return (
      <div dir="rtl" lang="ar" className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-teal-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">تم التسجيل بنجاح! 🎉</h1>
          <p className="text-slate-500 leading-relaxed">
            هنكلمك في أقرب وقت على الرقم اللي كتبته. خليك على استعداد 📞
          </p>
          <button
            onClick={resetAll}
            className="text-sm font-bold text-teal-600 hover:text-teal-800 underline mt-2"
          >
            تسجيل شخص تاني
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Logo size={30} />
          <span className="font-extrabold text-slate-900">
            Webistry<span className="text-teal-600">dev</span>
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-7">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 leading-snug">
            عايز تطور بزنيسك؟ خليك في السليم.
          </h1>
          <p className="text-slate-500 text-base leading-relaxed">
            مش محتاج تكتب كتير. سيبنا نكلمك ونفهم احتياجاتك.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white border border-teal-100 rounded-3xl shadow-xl shadow-teal-900/5 p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-2">اسمك</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              placeholder="اكتب اسمك هنا"
              className={`w-full rounded-2xl border-2 px-4 py-3.5 text-base outline-none transition-colors ${
                nameError ? "border-rose-300 bg-rose-50" : "border-teal-100 bg-teal-50/40 focus:border-teal-400"
              }`}
            />
            {nameError && <p className="text-xs text-rose-500 font-semibold mt-1.5">{nameError}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-2">رقم تلفونك</label>
            <input
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError("");
              }}
              placeholder="01000000000"
              className={`w-full rounded-2xl border-2 px-4 py-3.5 text-base text-right outline-none transition-colors ${
                phoneError ? "border-rose-300 bg-rose-50" : "border-teal-100 bg-teal-50/40 focus:border-teal-400"
              }`}
            />
            {phoneError && <p className="text-xs text-rose-500 font-semibold mt-1.5">{phoneError}</p>}
          </div>

          {/* Voice recording flow */}
          {recordState !== "idle" && (
            <div className="rounded-2xl border-2 border-teal-100 bg-teal-50/40 p-4">
              {recordState === "requesting" && (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-5 h-5 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin shrink-0" />
                  <p className="text-sm text-slate-500 font-medium">بناخد إذن الميكروفون...</p>
                </div>
              )}

              {recordState === "recording" && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <span className="text-xl font-black text-slate-900 tabular-nums">{formatTime(recordSeconds)}</span>
                    <span className="text-xs text-slate-400 font-semibold">بيسجل...</span>
                  </div>
                  <div className="flex items-center gap-1.5 h-8">
                    {WAVE_CONFIG.map((cfg, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-teal-500 rounded-full origin-center animate-wave-bar"
                        style={{ height: "100%", animationDuration: cfg.dur, animationDelay: cfg.delay }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition-all text-sm"
                    >
                      <Square size={13} fill="currentColor" /> وقف التسجيل
                    </button>
                    <button
                      type="button"
                      onClick={cancelVoice}
                      className="flex items-center gap-1 px-3 py-3 text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors"
                    >
                      <X size={13} /> إلغاء
                    </button>
                  </div>
                </div>
              )}

              {recordState === "recorded" && (
                <div className="flex flex-col gap-3">
                  {audioUrl && (
                    <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                  )}
                  <div className="flex items-center gap-2 text-teal-700">
                    <CheckCircle2 size={16} />
                    <span className="font-bold text-sm">الرسالة اتسجلت — {formatTime(recordSeconds)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-teal-200 text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-all text-xs"
                    >
                      {isPlaying ? (
                        <>
                          <Pause size={12} /> إيقاف
                        </>
                      ) : (
                        <>
                          <Play size={12} /> سماع
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={reRecord}
                      className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs"
                    >
                      <RotateCcw size={12} /> إعادة التسجيل
                    </button>
                    <button
                      type="button"
                      onClick={cancelVoice}
                      className="flex items-center gap-1 px-2 py-2.5 text-xs text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X size={13} /> إلغاء
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={submitVoice}
                    disabled={formStatus === "sending"}
                    className="mt-1 flex items-center justify-center gap-2 bg-teal-600 text-white py-4 rounded-2xl font-black text-base hover:bg-teal-700 disabled:opacity-60 shadow-lg shadow-teal-600/20 transition-all"
                  >
                    {formStatus === "sending" ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "ابعت الرسالة الصوتية"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {recordState === "idle" && (
            <>
              <button
                type="button"
                onClick={submitText}
                disabled={formStatus === "sending"}
                className="flex items-center justify-center gap-2 bg-teal-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-teal-600/25 transition-all"
              >
                {formStatus === "sending" ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <PhoneCall size={20} />
                )}
                سجل واستنى اتصالنا
              </button>

              <button
                type="button"
                onClick={startRecording}
                className="flex items-center justify-center gap-2 bg-white border-2 border-teal-200 text-teal-700 py-4 rounded-2xl font-bold text-sm hover:bg-teal-50 transition-all"
              >
                <Mic size={16} />
                سجل رسالة صوتية
              </button>
            </>
          )}

          {formStatus === "error" && (
            <p className="text-center text-xs text-rose-500 font-semibold">
              حصل خطأ، من فضلك حاول تاني.
            </p>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          بياناتك في أمان تام وهيتم التواصل معاك خلال وقت قصير.
        </p>
      </div>
    </div>
  );
}
