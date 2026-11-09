export type BizType = "furniture" | "clinic" | "restaurant" | "store" | "courses" | "other";
export type Goal = "bookings" | "sales" | "premium" | "brand";
export type Style = "luxury" | "clean" | "bold";
export type Lang = "ar" | "en";

export type Answers = {
  type: BizType | null;
  sell: string;
  goal: Goal | null;
  style: Style | null;
};

export type Template = {
  id: string;
  image: string;
  domain: string;
  name: { ar: string; en: string };
  note: { ar: string; en: string };
  types: BizType[];
  goals: Goal[];
  styles: Style[];
};

export const TEMPLATES: Template[] = [
  {
    id: "qoya-showroom",
    image: "/projects/qoya-furniture.png",
    domain: "qoya.webistrydev.com",
    name: { ar: "شوروم أثاث فاخر", en: "Luxury Furniture Showroom" },
    note: {
      ar: "تصميم تحريري كامل الشاشة، 45 مجموعة، كتالوج PDF، ولوكيتور فروع — زي qoya.webistrydev.com",
      en: "Fullscreen editorial layout, 45 collections, PDF catalogue and branch locator — like qoya.webistrydev.com",
    },
    types: ["furniture"],
    goals: ["premium", "brand"],
    styles: ["luxury"],
  },
  {
    id: "store-full",
    image: "/projects/zahrtelkhlig.png",
    domain: "zahrtelkhlig.webistrydev.com",
    name: { ar: "متجر أونلاين كامل", en: "Full Online Store" },
    note: {
      ar: "كتالوج ومقاسات وعربة وأوردرات وتوصيل — كله من الموبايل",
      en: "Catalog, sizes, cart, orders and delivery — all from the phone",
    },
    types: ["store", "restaurant"],
    goals: ["sales"],
    styles: ["clean", "bold"],
  },
  {
    id: "clinic-booking",
    image: "/projects/batrawy-clinic.png",
    domain: "batrawy-clinic.webistrydev.com",
    name: { ar: "حجز مواعيد لعيادة", en: "Clinic Appointment Booking" },
    note: {
      ar: "حجز مواعيد وملفات مرضى وفواتير ولوحة تحكم — يشتغل من أي موبايل",
      en: "Appointments, patient files, billing and an admin panel — works on any phone",
    },
    types: ["clinic", "restaurant"],
    goals: ["bookings"],
    styles: ["clean"],
  },
  {
    id: "brand-premium",
    image: "/projects/ahmed-elakad.png",
    domain: "ahmedelakad.com",
    name: { ar: "موقع براند فاخر", en: "Premium Brand Site" },
    note: {
      ar: "جاليري مخصوص وإدارة مجموعات وهوية على مستوى البراند — زي ahmedelakad.com",
      en: "Custom gallery, collection management and brand-grade identity — like ahmedelakad.com",
    },
    types: ["other"],
    goals: ["premium", "brand"],
    styles: ["luxury"],
  },
  {
    id: "store-orders",
    image: "/projects/furniture-studio.png",
    domain: "furniture-studio.webistrydev.com",
    name: { ar: "متجر بأوردرات ومخزون", en: "Store With Orders & Stock" },
    note: {
      ar: "عربة شراء وإتمام طلب وتتبع أوردرات ولوحة تحكم للمخزون",
      en: "Cart, checkout, order tracking and an inventory dashboard",
    },
    types: ["store", "furniture"],
    goals: ["sales"],
    styles: ["bold", "clean"],
  },
  {
    id: "courses-platform",
    image: "/projects/mr-mohammed.png",
    domain: "mr-mohammed.webistrydev.com",
    name: { ar: "منصة دورات وكورسات", en: "Courses Platform" },
    note: {
      ar: "تسجيل ذاتي في الدورات ودفع أونلاين ولوحة تحكم للمدرب",
      en: "Self-serve enrollment, online payment and a coach dashboard",
    },
    types: ["courses"],
    goals: ["sales", "bookings"],
    styles: ["clean"],
  },
];

export const BIZ_TYPES: { key: BizType; emoji: string; ar: string; en: string }[] = [
  { key: "furniture", emoji: "🛋️", ar: "شوروم أثاث", en: "Furniture showroom" },
  { key: "clinic", emoji: "🏥", ar: "عيادة أو مركز", en: "Clinic or center" },
  { key: "restaurant", emoji: "🍽️", ar: "مطعم أو كافيه", en: "Restaurant or cafe" },
  { key: "store", emoji: "🛒", ar: "متجر أونلاين", en: "Online store" },
  { key: "courses", emoji: "🎓", ar: "دورات وكورسات", en: "Courses & training" },
  { key: "other", emoji: "✨", ar: "حاجة تانية", en: "Something else" },
];

export const GOALS: { key: Goal; emoji: string; ar: string; en: string }[] = [
  { key: "bookings", emoji: "📅", ar: "مواعيد وحجز أكتر", en: "More bookings" },
  { key: "sales", emoji: "💰", ar: "مبيعات أكتر", en: "More sales" },
  { key: "premium", emoji: "👑", ar: "أبدو فاخر ومحترم", en: "Look premium" },
  { key: "brand", emoji: "🚀", ar: "أطلق براند جديد", en: "Launch a new brand" },
];

export const STYLES: Style[] = ["luxury", "clean", "bold"];

export const SWATCHES: Record<Style, string> = {
  luxury: "bg-gradient-to-br from-slate-900 to-stone-600",
  clean: "bg-white border border-slate-200",
  bold: "bg-gradient-to-br from-violet-600 to-fuchsia-500",
};

const TYPE_LABELS: Record<Lang, Record<BizType, string>> = {
  ar: {
    furniture: "شوروم أثاث",
    clinic: "عيادة أو مركز",
    restaurant: "مطعم أو كافيه",
    store: "متجر أونلاين",
    courses: "دورات وكورسات",
    other: "حاجة تانية",
  },
  en: {
    furniture: "Furniture showroom",
    clinic: "Clinic or medical center",
    restaurant: "Restaurant or cafe",
    store: "Online store",
    courses: "Courses & training",
    other: "Something else",
  },
};

const GOAL_LABELS: Record<Lang, Record<Goal, string>> = {
  ar: {
    bookings: "مواعيد وحجز أكتر",
    sales: "مبيعات أكتر",
    premium: "أبدو فاخر ومحترم",
    brand: "أطلق براند جديد",
  },
  en: {
    bookings: "More bookings",
    sales: "More sales",
    premium: "Look premium",
    brand: "Launch a new brand",
  },
};

const STYLE_LABELS: Record<Lang, Record<Style, string>> = {
  ar: { luxury: "فاخر", clean: "نظيف وبسيط", bold: "جريء ومميز" },
  en: { luxury: "Luxury", clean: "Clean", bold: "Bold" },
};

export function pickTemplate(a: Answers): Template {
  const { type, goal, style } = a;
  if (!type || !goal || !style) return TEMPLATES[0];
  let best = TEMPLATES[0];
  let bestScore = -1;
  TEMPLATES.forEach((tpl) => {
    let score = 0;
    if (tpl.types.includes(type)) score += 4;
    if (tpl.goals.includes(goal)) score += 2;
    if (tpl.styles.includes(style)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = tpl;
    }
  });
  return best;
}

export function buildWaText(a: Answers, tpl: Template): string {
  const lines = [
    "أهلاً شريف 👋",
    "عملت اختبار /start على موقعك وحابب أبدأ:",
    "",
    `نوع البيزنس: ${a.type ? TYPE_LABELS.ar[a.type] : "—"}`,
    `اللي بيعه / بيقدّمه: ${a.sell.trim() || "—"}`,
    `الهدف: ${a.goal ? GOAL_LABELS.ar[a.goal] : "—"}`,
    `الستايل: ${a.style ? STYLE_LABELS.ar[a.style] : "—"}`,
    `الموك_up المقترح: ${tpl.name.ar}`,
    "",
    "https://www.webistrydev.com/start",
  ];
  return lines.join("\n");
}

export function summaryValue(
  lang: Lang,
  field: "type" | "goal" | "style",
  key: string
): string {
  if (field === "type") return TYPE_LABELS[lang][key as BizType] ?? "";
  if (field === "goal") return GOAL_LABELS[lang][key as Goal] ?? "";
  return STYLE_LABELS[lang][key as Style] ?? "";
}

export const TEXT = {
  ar: {
    badge: "اختبار سريع",
    stepOf: (n: number) => `الخطوة ${n} من 4`,
    back: "رجوع",
    next: "التالي ←",
    nextToPreview: "شوف الموك أب ←",
    q1: {
      title: "بيزنسك من أنهي نوع؟",
      sub: "اختار الأقرب ليك — هستخدمه أوصّل التصميم اللي يناسب شغلك.",
      options: BIZ_TYPES.map((o) => ({ key: o.key, label: `${o.emoji} ${o.ar}` })),
    },
    q2: {
      title: "بتعمل أو بتبيع إيه؟",
      sub: "جملة واحدة تكفي — كل ما توضّح كل ما بقت المعاينة أقرب لبيزنسك.",
      label: "اكتب باختصار",
      placeholder: "مثال: أثاث منزلي فاخر، تسليم لكل محافظات مصر",
      optional: "اختياري",
      presetsLabel: "اختيار سريع",
      presets: ["أثاث", "ملابس", "حجاب", "مكياج وعناية", "منتجات طبية", "كورسات أونلاين", "أكل ومشروبات", "عقارات"],
    },
    q3: {
      title: "إيه أهم هدف ليك دلوقتي؟",
      sub: "هدف واحد بس — هو اللي هيحدّد شكل الموقع.",
      options: GOALS.map((o) => ({ key: o.key, label: `${o.emoji} ${o.ar}` })),
    },
    q4: {
      title: "إيه الستايل اللي يعجبك؟",
      sub: "الستايل بتاع الموك_up اللي هتشوفه بعد الخطوة دي.",
      options: STYLES.map((k) => ({ key: k, label: STYLE_LABELS.ar[k] })),
      descs: {
        luxury: "ألوان غامقة وتفاصيل راقية",
        clean: "مساحات مرتّبة وخط هادي",
        bold: "ألوان قوية وتباين واضح",
      } as Record<Style, string>,
    },
    preview: {
      title: "دي معاينة جاهزة ليك",
      sub: "مبني على إجاباتك في الاختبار — ده أقرب ستايل لبيزنسك.",
      suggested: "الموك_up المقترح ليك",
      fromProject: "معاينة من مشروع حقيقي اتسلّم:",
      cta: "عجبك الشكل؟ ابدعلي ←",
    },
    cta: {
      title: "يلا نبعتها لي",
      sub: "دوس الزرار — الواتساب هيفتح برسالة جاهزة فيها نتايج اختبارك، وأنا برد في نفس اليوم.",
      send: "ابعت على واتساب",
      restart: "أعمل الاختبار من الأول",
      summaryTitle: "نتايج اختبارك",
      labels: { type: "نوع البيزنس", sell: "اللي بيعه / بيقدّمه", goal: "الهدف", style: "الستايل", mockup: "الموك_up" },
      note: "مفيش دفع ولا التزام — بندردش الأول وبعدين نتفق على كل حاجة.",
    },
    phoneNote: "معاينة حقيقية من شغلي — مش تصميم عام.",
  },
  en: {
    badge: "Quick quiz",
    stepOf: (n: number) => `Step ${n} of 4`,
    back: "Back",
    next: "Next →",
    nextToPreview: "See the mockup →",
    q1: {
      title: "What type of business is it?",
      sub: "Pick the closest one — it shapes the design I suggest.",
      options: BIZ_TYPES.map((o) => ({ key: o.key, label: `${o.emoji} ${o.en}` })),
    },
    q2: {
      title: "What do you sell or offer?",
      sub: "One line is enough — the more specific you are, the closer the preview gets.",
      label: "Short answer",
      placeholder: "e.g. luxury home furniture, delivery across Egypt",
      optional: "Optional",
      presetsLabel: "Quick pick",
      presets: ["Furniture", "Clothing", "Hijab", "Beauty & care", "Medical supplies", "Online courses", "Food & drink", "Real estate"],
    },
    q3: {
      title: "What's your main goal right now?",
      sub: "One goal only — it decides the shape of the site.",
      options: GOALS.map((o) => ({ key: o.key, label: `${o.emoji} ${o.en}` })),
    },
    q4: {
      title: "Which style speaks to you?",
      sub: "The style of the mockup you'll see next.",
      options: STYLES.map((k) => ({ key: k, label: STYLE_LABELS.en[k] })),
      descs: {
        luxury: "Dark tones, refined details",
        clean: "Balanced spacing, calm type",
        bold: "Strong colors, high contrast",
      } as Record<Style, string>,
    },
    preview: {
      title: "Here's your preview",
      sub: "Built from your answers — the closest style for your business.",
      suggested: "Suggested mockup",
      fromProject: "Preview from a real shipped project:",
      cta: "Like it? Send it to me →",
    },
    cta: {
      title: "Let's send it over",
      sub: "Tap the button — WhatsApp opens with your quiz results ready, and I reply the same day.",
      send: "Send on WhatsApp",
      restart: "Take the quiz again",
      summaryTitle: "Your results",
      labels: { type: "Business type", sell: "What you sell", goal: "Goal", style: "Style", mockup: "Mockup" },
      note: "No payment, no commitment — we talk first and agree on everything after.",
    },
    phoneNote: "Real preview from my work — not a generic template.",
  },
};

export type Texts = (typeof TEXT)[Lang];