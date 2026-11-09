"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { useLang } from "@/lib/language-context";
import { whatsappUrl } from "@/lib/contact";
import { trackLead } from "@/lib/fbpixel";
import Logo from "@/components/Logo";
import {
  TEXT,
  SWATCHES,
  pickTemplate,
  buildWaText,
  summaryValue,
  type Answers,
  type Template,
} from "./start-content";

const SCREENS = ["q1", "q2", "q3", "q4", "preview", "cta"] as const;
type Screen = (typeof SCREENS)[number];

type OptionList = { key: string; label: string }[];

function OptionCard({
  selected,
  onClick,
  label,
  emoji,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  emoji?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-[64px] w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-start transition-colors ${
        selected
          ? "border-violet-600 bg-violet-50"
          : "border-violet-100 bg-white hover:border-violet-300"
      }`}
    >
      {emoji ? <span className="text-2xl leading-none">{emoji}</span> : null}
      <span className="font-bold text-[15px] text-slate-800">{label}</span>
      {selected ? <span className="ms-auto text-violet-600 font-black">✓</span> : null}
    </button>
  );
}

function StyleOption({
  styleKey,
  label,
  desc,
  selected,
  onClick,
}: {
  styleKey: string;
  label: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-[64px] w-full flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-3 py-3 transition-colors ${
        selected ? "border-violet-600 bg-violet-50" : "border-violet-100 bg-white hover:border-violet-300"
      }`}
    >
      <span className={`h-7 w-7 rounded-lg shadow-sm ${SWATCHES[styleKey as keyof typeof SWATCHES]}`} />
      <span className="font-bold text-[14px] text-slate-800 leading-tight text-center">{label}</span>
      <span className="text-[11px] text-slate-500 leading-tight text-center">{desc}</span>
    </button>
  );
}

function PhoneFrame({ tpl, caption }: { tpl: Template; caption: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[min(72vw,270px)] aspect-[9/18.5] rounded-[2.5rem] bg-slate-900 p-2.5 shadow-[0_24px_60px_-16px_rgba(15,23,42,0.55)]">
        <div className="absolute left-1/2 top-3 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-900" />
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-white">
          <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-3 pb-1.5 pt-6">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span
              dir="ltr"
              className="ms-1 flex-1 truncate rounded-md bg-white px-2 py-0.5 text-[10px] text-slate-500"
            >
              {tpl.domain}
            </span>
          </div>
          <div className="relative min-h-0 flex-1">
            <Image
              src={tpl.image}
              alt={tpl.name.en}
              fill
              sizes="(max-width: 640px) 72vw, 270px"
              className="object-cover object-top"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-1.5 flex justify-center">
            <span className="h-1 w-24 rounded-full bg-slate-900/40" />
          </div>
        </div>
      </div>
      <p className="max-w-[280px] text-center text-[11px] leading-snug text-slate-400">{caption}</p>
    </div>
  );
}

export default function StartQuiz() {
  const { lang, toggle } = useLang();
  const t = TEXT[lang];
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    type: null,
    sell: "",
    goal: null,
    style: null,
  });

  const screen = SCREENS[idx] as Screen;
  const template = useMemo(() => pickTemplate(answers), [answers]);
  const waHref = useMemo(
    () => whatsappUrl(buildWaText(answers, template)),
    [answers, template]
  );

  const quizStep = idx < 4 ? idx + 1 : 4;
  const canNext =
    screen === "q1" ? answers.type !== null
    : screen === "q3" ? answers.goal !== null
    : screen === "q4" ? answers.style !== null
    : true;

  const go = (n: number) => setIdx(Math.min(Math.max(n, 0), SCREENS.length - 1));
  const startOver = () => {
    setAnswers({ type: null, sell: "", goal: null, style: null });
    setIdx(0);
  };

  const summaryRows: { label: string; value: string }[] = [
    { label: t.cta.labels.type, value: answers.type ? summaryValue(lang, "type", answers.type) : "" },
    { label: t.cta.labels.sell, value: answers.sell.trim() },
    { label: t.cta.labels.goal, value: answers.goal ? summaryValue(lang, "goal", answers.goal) : "" },
    { label: t.cta.labels.style, value: answers.style ? summaryValue(lang, "style", answers.style) : "" },
    { label: t.cta.labels.mockup, value: template.name[lang] },
  ];

  const previewChips: string[] = [
    answers.type ? summaryValue(lang, "type", answers.type) : "",
    answers.goal ? summaryValue(lang, "goal", answers.goal) : "",
    answers.style ? summaryValue(lang, "style", answers.style) : "",
  ].filter(Boolean);

  function renderOptions(list: OptionList, selectedKey: string | null, onPick: (key: string) => void) {
    return (
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {list.map((opt) => (
          <OptionCard
            key={opt.key}
            label={opt.label}
            selected={selectedKey === opt.key}
            onClick={() => onPick(opt.key)}
          />
        ))}
      </div>
    );
  }

  let body: ReactNode = null;
  if (screen === "q1") {
    body = (
      <>
        <h1 className="text-2xl font-black text-slate-900">{t.q1.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{t.q1.sub}</p>
        <div className="mt-5">
          {renderOptions(t.q1.options, answers.type, (key) =>
            setAnswers((p) => ({ ...p, type: key as Answers["type"] }))
          )}
        </div>
      </>
    );
  } else if (screen === "q2") {
    body = (
      <>
        <h1 className="text-2xl font-black text-slate-900">{t.q2.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{t.q2.sub}</p>
        <div className="mt-5 flex items-center justify-between gap-2">
          <label htmlFor="wc-sell" className="text-sm font-bold text-slate-700">
            {t.q2.label}
          </label>
          <span className="text-[11px] font-semibold text-slate-400">{t.q2.optional}</span>
        </div>
        <textarea
          id="wc-sell"
          rows={3}
          value={answers.sell}
          maxLength={160}
          onChange={(e) => setAnswers((p) => ({ ...p, sell: e.target.value }))}
          placeholder={t.q2.placeholder}
          className="mt-2 w-full resize-none rounded-2xl border-2 border-violet-100 bg-white px-4 py-3 text-[15px] text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none"
        />
        <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
          {t.q2.presetsLabel}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {t.q2.presets.map((chip) => {
            const active = answers.sell.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                onClick={() =>
                  setAnswers((p) => ({
                    ...p,
                    sell: active
                      ? p.sell.replace(chip, "").replace(/\s+/g, " ").trim()
                      : p.sell.trim()
                        ? `${p.sell.replace(/[،,]\s*$/, "").trim()}، ${chip}`
                        : chip,
                  }))
                }
                className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-violet-200 bg-white text-slate-600 hover:border-violet-400"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </>
    );
  } else if (screen === "q3") {
    body = (
      <>
        <h1 className="text-2xl font-black text-slate-900">{t.q3.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{t.q3.sub}</p>
        <div className="mt-5">
          {renderOptions(t.q3.options, answers.goal, (key) =>
            setAnswers((p) => ({ ...p, goal: key as Answers["goal"] }))
          )}
        </div>
      </>
    );
  } else if (screen === "q4") {
    body = (
      <>
        <h1 className="text-2xl font-black text-slate-900">{t.q4.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{t.q4.sub}</p>
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {t.q4.options.map((opt) => (
            <StyleOption
              key={opt.key}
              styleKey={opt.key}
              label={opt.label}
              desc={t.q4.descs[opt.key as keyof typeof t.q4.descs]}
              selected={answers.style === opt.key}
              onClick={() => setAnswers((p) => ({ ...p, style: opt.key as Answers["style"] }))}
            />
          ))}
        </div>
      </>
    );
  } else if (screen === "preview") {
    body = (
      <>
        <p className="text-xs font-black uppercase tracking-widest text-violet-600">
          {t.preview.suggested}
        </p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">{t.preview.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{t.preview.sub}</p>
        <div className="mt-5">
          <PhoneFrame tpl={template} caption={`${t.preview.fromProject} ${template.domain}`} />
        </div>
        <div className="mt-5 rounded-2xl border border-violet-100 bg-white p-4">
          <p className="text-lg font-black text-slate-900">{template.name[lang]}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{template.note[lang]}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {previewChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-slate-400">{t.phoneNote}</p>
      </>
    );
  } else {
    body = (
      <>
        <h1 className="text-2xl font-black text-slate-900">{t.cta.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{t.cta.sub}</p>
        <div className="mt-5 divide-y divide-violet-50 rounded-2xl border border-violet-100 bg-white px-4">
          {summaryRows.map((row) => (
            <div key={row.label} className="flex items-start gap-3 py-3">
              <span className="w-28 shrink-0 text-xs font-bold uppercase tracking-wider text-slate-400">
                {row.label}
              </span>
              <span className="flex-1 text-sm font-bold text-slate-800 break-words">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-violet-100 bg-white p-3">
          <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <Image
              src={template.image}
              alt={template.name.en}
              fill
              sizes="48px"
              className="object-cover object-top"
            />
          </div>
          <p className="text-xs leading-relaxed text-slate-500">{template.note[lang]}</p>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">{t.cta.note}</p>
      </>
    );
  }

  const showProgress = idx <= 3;

  return (
    <div className="min-h-dvh bg-[#f7f6ff] pb-36">
      <header className="sticky top-0 z-30 border-b border-violet-100 bg-[#f7f6ff]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-lg sm:max-w-xl lg:max-w-2xl items-center gap-2.5 px-4">
          <Logo size={26} />
          <span className="font-black tracking-tight text-slate-800">WebistryDev</span>
          <span className="ms-auto hidden rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-violet-600 sm:inline-block">
            {t.badge}
          </span>
          <button
            type="button"
            onClick={toggle}
            className="ms-auto min-h-11 rounded-xl border border-violet-200 bg-white px-3 text-xs font-black text-slate-600 sm:ms-0"
            aria-label={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
          >
            {lang === "ar" ? "EN" : "عربي"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg sm:max-w-xl lg:max-w-2xl px-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < quizStep ? "bg-violet-600" : "bg-violet-100"
                }`}
              />
            ))}
          </div>
          <span className="whitespace-nowrap text-[11px] font-black text-slate-400">
            {showProgress ? t.stepOf(quizStep) : "✓"}
          </span>
        </div>

        <div key={screen} className="animate-fade-in mt-6">{body}</div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-violet-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg sm:max-w-xl lg:max-w-2xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {screen === "cta" ? (
            <>
              <button
                type="button"
                onClick={startOver}
                className="min-h-12 shrink-0 rounded-xl border border-violet-200 px-4 text-sm font-bold text-slate-600"
              >
                {t.cta.restart}
              </button>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLead()}
                className="btn-primary flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-center text-[15px]"
              >
                💬 {t.cta.send}
              </a>
            </>
          ) : (
            <>
              {idx > 0 ? (
                <button
                  type="button"
                  onClick={() => go(idx - 1)}
                  className="min-h-12 shrink-0 rounded-xl border border-violet-200 px-4 text-sm font-bold text-slate-600"
                >
                  {t.back}
                </button>
              ) : null}
              <button
                type="button"
                disabled={!canNext}
                onClick={() => go(idx + 1)}
                className="btn-primary min-h-12 flex-1 rounded-xl px-4 text-center text-[15px] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {screen === "q4" ? t.nextToPreview : screen === "preview" ? t.preview.cta : t.next}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
