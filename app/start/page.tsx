import type { Metadata } from "next";
import StartQuiz from "./StartQuiz";

const TITLE = "شوف موك أب موقعك في 30 ثانية | WebistryDev";
const DESCRIPTION =
  "اختبار من 4 خطوات: نوع بيزنسك، بتبيع إيه، هدفك، والستايل اللي يعجبك — وتحصل على معاينة جاهزة لموك أب موقعك مع زرار واتساب مباشر. مجاني وبدون أي التزام.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/start" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://www.webistrydev.com/start",
    siteName: "WebistryDev",
    type: "website",
    locale: "ar_EG",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function StartPage() {
  return <StartQuiz />;
}
