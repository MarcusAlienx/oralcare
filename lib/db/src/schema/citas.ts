import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core";
import { pacientes } from "./pacientes";
import { doctores } from "./doctores";

export const citas = pgTable("citas", {
  id: uuid("id").defaultRandom().primaryKey(),
  pacienteId: uuid("paciente_id").notNull().references(() => pacientes.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id").notNull().references(() => doctores.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  caldavEventUid: text("caldav_event_uid"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
