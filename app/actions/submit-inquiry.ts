"use server";

import { db } from "@/db";
import { leads } from "@/db/schema";

export async function submitInquiry(formData: {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  reference: string;
  budget: string;
  message: string;
}) {
  // Best-effort DB save — WhatsApp is the primary contact channel
  try {
    await db.insert(leads).values({
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      projectType: formData.projectType,
      reference: formData.reference || null,
      budget: formData.budget || null,
      message: formData.message,
    });
  } catch (error) {
    // Log but don't fail — client will still receive WhatsApp link
    console.error("[leads] DB insert failed:", error);
  }

  return { success: true };
}
