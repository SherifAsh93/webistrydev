"use server";

import { db } from "@/db";
import { messages, leads } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getMessagesByToken(token: string) {
  try {
    const [lead] = await db
      .select({ id: leads.id, name: leads.name })
      .from(leads)
      .where(eq(leads.chatToken, token));

    if (!lead) return null;

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.leadId, lead.id))
      .orderBy(asc(messages.createdAt));

    return { lead, messages: msgs };
  } catch {
    return null;
  }
}

export async function getMessagesByLeadId(leadId: number) {
  try {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.leadId, leadId))
      .orderBy(asc(messages.createdAt));
  } catch {
    return [];
  }
}
