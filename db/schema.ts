import { pgTable, serial, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 30 }),
  projectType: varchar("project_type", { length: 50 }),
  reference: varchar("reference", { length: 100 }),
  budget: varchar("budget", { length: 100 }),
  message: text("message"),
  voiceNote: text("voice_note"),
  chatToken: varchar("chat_token", { length: 64 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
  status: varchar("status", { length: 20 }).notNull().default("new"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id, { onDelete: "cascade" }).notNull(),
  sender: varchar("sender", { length: 10 }).notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
