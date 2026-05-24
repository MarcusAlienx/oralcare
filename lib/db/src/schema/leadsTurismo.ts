import { pgTable, uuid, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const leadsTurismo = pgTable("leads_turismo", {
  id: uuid("id").defaultRandom().primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email"),
  whatsapp: text("whatsapp").notNull(),
  paisOrigen: text("pais_origen"),
  tratamientoInteres: text("tratamiento_interes"),
  fechasViaje: text("fechas_viaje"),
  status: varchar("status", { length: 50 }).notNull().default("nuevo"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
