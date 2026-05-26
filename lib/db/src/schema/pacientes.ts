import { pgTable, uuid, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const pacientes = pgTable("pacientes", {
  id: uuid("id").defaultRandom().primaryKey(),
  nombre: text("nombre").notNull(),
  whatsappJid: text("whatsapp_jid").unique(),
  email: text("email"),
  paisOrigen: text("pais_origen"),
  idiomaPreferido: varchar("idioma_preferido", { length: 5 }),
  historialClinico: text("historial_clinico"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
