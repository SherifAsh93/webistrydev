import { headers } from "next/headers";
import LeadPageClient from "./LeadPageClient";

// Accept-Language looks like "ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7" — pick the
// highest-weighted tag and check its primary subtag against Arabic.
function detectLang(acceptLanguage: string | null): "ar" | "en" {
  if (!acceptLanguage) return "en";

  const preferred = acceptLanguage
    .split(",")
    .map((entry) => {
      const [rawTag, rawQ] = entry.trim().split(";q=");
      const q = rawQ ? parseFloat(rawQ) : 1;
      return { tag: rawTag.trim().toLowerCase(), q: Number.isNaN(q) ? 1 : q };
    })
    .sort((a, b) => b.q - a.q)[0]?.tag;

  return preferred?.startsWith("ar") ? "ar" : "en";
}

export default async function LeadPage() {
  const headersList = await headers();
  const lang = detectLang(headersList.get("accept-language"));

  return <LeadPageClient lang={lang} />;
}
