// @ts-nocheck
import tsdav from "tsdav";
const { DAVClient, createObject } = tsdav;
import ical from "ical-generator";
import { v4 as uuidv4 } from "uuid";
import { getDoctores } from "./dbService.js";

// Helper para iniciar cliente de CalDAV
const getDavClient = async (doctorId: string) => {
  const doctores = await getDoctores();
  const doc = doctores.find((d: any) => d.id === doctorId);
  if (!doc) throw new Error("Doctor no encontrado");
  if (!doc.caldavUrl || !doc.caldavUsername || !doc.caldavPasswordEncrypted) {
    throw new Error("Doctor no tiene configuradas las credenciales de CalDAV");
  }

  const client = new DAVClient({
    serverUrl: doc.caldavUrl,
    credentials: {
      username: doc.caldavUsername,
      password: doc.caldavPasswordEncrypted,
    },
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });

  await client.login();
  const calendars = await client.fetchCalendars();
  if (!calendars || calendars.length === 0) throw new Error("No se encontraron calendarios");

  return { client, calendar: calendars[0], doc };
};

export const checkAvailability = async (doctorId: string, dateStr: string) => {
  const { client, calendar } = await getDavClient(doctorId);
  
  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);

  // tsdav calendar-query para obtener eventos en el rango
  const events = await client.fetchCalendarObjects({
    calendar,
    timeRange: { start: startOfDay.toISOString(), end: endOfDay.toISOString() },
  });

  // Simplified logic: return busy slots or parse the actual ical output
  // For standard LLM consumption, we can return the array of busy objects.
  return events.map((ev) => ev.data); // Return raw VEVENTs or parsed objects
};

export const bookAppointmentCalDav = async (doctorId: string, patientWhatsapp: string, datetimeStr: string) => {
  const { client, calendar, doc } = await getDavClient(doctorId);
  const start = new Date(datetimeStr);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

  const uid = uuidv4();
  const cal = ical({ name: "Citas A&E OralCare" });
  cal.createEvent({
    start,
    end,
    summary: `Cita Clínica - ${patientWhatsapp}`,
    description: "Cita generada por IA",
    location: "A&E OralCare",
    uid,
  });

  const icalString = cal.toString();
  const filename = `${uid}.ics`;

  await createObject({
    url: `${calendar.url}${filename}`,
    data: icalString,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      Authorization: `Basic ${Buffer.from(`${doc.caldavUsername}:${doc.caldavPasswordEncrypted}`).toString("base64")}`,
    },
  });

  return { uid, start, end };
};
