import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const doctores = pgTable("doctores", {
  id: uuid("id").defaultRandom().primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").unique(),
  caldavUrl: text("caldav_url"),
  caldavUsername: text("caldav_username"),
  caldavPasswordEncrypted: text("caldav_password_encrypted"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
