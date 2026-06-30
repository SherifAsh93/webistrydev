"use server";

import { db } from "@/db";
import { leads } from "@/db/schema";
import { randomUUID } from "crypto";

export async function submitInquiry(formData: {
  name: string;
  phone: string;
  message?: string;
  voiceNote?: string | null;
  reference?: string | null;
}) {
  const chatToken = randomUUID();

  try {
    await db.insert(leads).values({
      name: formData.name,
      phone: formData.phone || null,
      message: formData.message || null,
      voiceNote: formData.voiceNote || null,
      reference: formData.reference || null,
      chatToken,
    });
  } catch (error) {
    console.error("[leads] DB insert failed:", error);
    return { success: false, chatToken: null };
  }

  return { success: true, chatToken };
}
