export const CONTACT = {
  phone: "+201007526882",
  phoneDisplay: "+20 100 752 6882",
  whatsapp: "201007526882",
  email: "sherif.hany@proton.me",
  facebook: "https://www.facebook.com/WebistryDev",
} as const;

export function whatsappUrl(message?: string) {
  return `https://wa.me/${CONTACT.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
