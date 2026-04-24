import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  service: text("service"),
  message: text("message"),
  status: text("status").notNull().default("nuevo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
