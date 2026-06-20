"use server";

import { db } from "@/db";
import { leads } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteLead(id: number) {
  await db.delete(leads).where(eq(leads.id, id));
}
