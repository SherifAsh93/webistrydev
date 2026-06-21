"use server";

import { db } from "@/db";
import { messages, leads } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function sendClientMessage(token: string, body: string) {
  try {
    const [lead] = await db
      .select({ id: leads.id })
      .from(leads)
      .where(eq(leads.chatToken, token));

    if (!lead) return { error: "Invalid token" };

    await db.insert(messages).values({ leadId: lead.id, sender: "client", body });
    return { success: true };
  } catch {
    return { error: "Failed" };
  }
}

export async function sendAdminMessage(leadId: number, body: string) {
  try {
    await db.insert(messages).values({ leadId, sender: "admin", body });
    return { success: true };
  } catch {
    return { error: "Failed" };
  }
}
