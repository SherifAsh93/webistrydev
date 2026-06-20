"use server";

import { db } from "@/db";
import { leads } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateLeadStatus(id: number, status: "new" | "contacted" | "archived") {
  await db.update(leads).set({ status }).where(eq(leads.id, id));
}
