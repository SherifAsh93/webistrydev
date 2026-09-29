// Accept Egyptian local mobile numbers or international numbers with a country code.
// This validates formatting, not whether a number is active or registered on WhatsApp.
export function normalizePhone(value: string): string | null {
  const translated = value.trim()
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x6f0));
  if (!/^[+\d\s().-]+$/.test(translated)) return null;
  let compact = translated.replace(/[\s().-]/g, "");
  if (/^01[0125]\d{8}$/.test(compact)) return `+20${compact.slice(1)}`;
  if (/^201[0125]\d{8}$/.test(compact)) return `+${compact}`;
  if (compact.startsWith("00")) compact = `+${compact.slice(2)}`;
  if (!/^\+[1-9]\d{7,14}$/.test(compact)) return null;
  if (/^\+201/.test(compact) && !/^\+201[0125]\d{8}$/.test(compact)) return null;
  return compact;
}
