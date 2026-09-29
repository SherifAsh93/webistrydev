declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackLead() {
  try { window.fbq?.("track", "Lead"); } catch { /* Tracking must never block an inquiry. */ }
}

export function trackContact(placement: string) {
  try { window.fbq?.("track", "Contact", { content_name: placement, content_category: "WhatsApp" }); } catch { /* Keep the contact link usable. */ }
}
