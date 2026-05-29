"use server";

import { db } from "@/db";
import { leads } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function getLeads() {
  try {
    const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
    return rows;
  } catch {
    return [];
  }
}
