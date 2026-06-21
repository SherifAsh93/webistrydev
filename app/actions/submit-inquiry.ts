"use server";

import { db } from "@/db";
import { leads } from "@/db/schema";

export async function submitInquiry(formData: {
  name: string;
  phone: string;
  message?: string;
  voiceNote?: string | null;
}) {
  try {
    await db.insert(leads).values({
      name: formData.name,
      phone: formData.phone || null,
      message: formData.message || null,
      voiceNote: formData.voiceNote || null,
    });
  } catch (error) {
    console.error("[leads] DB insert failed:", error);
  }

  return { success: true };
}
