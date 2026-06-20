import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 30 }),
  projectType: varchar("project_type", { length: 50 }).notNull(),
  reference: varchar("reference", { length: 100 }),
  budget: varchar("budget", { length: 100 }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  status: varchar("status", { length: 20 }).notNull().default("new"),
});
