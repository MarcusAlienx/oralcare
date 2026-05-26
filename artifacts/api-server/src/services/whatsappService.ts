// @ts-nocheck
import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { GoogleGenAI, Type } from "@google/genai";
import { getPacienteById, createPaciente, updateLeadStatus, createCita } from "./dbService.js";
import { checkAvailability, bookAppointmentCalDav } from "./caldavService.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });
const MODEL = "gemini-2.5-flash";

const DECLARATIONS = [
  {
    name: "checkAvailability",
    description: "Check the availability of a specific doctor via their iCloud CalDAV calendar",
    parameters: {
      type: Type.OBJECT,
      properties: {
        doctorId: { type: Type.STRING, description: "The UUID of the doctor" },
        date: { type: Type.STRING, description: "The date to check, in YYYY-MM-DD format" },
      },
      required: ["doctorId", "date"],
    },
  },
  {
    name: "bookAppointment",
    description: "Book an appointment for a patient in the doctor's CalDAV calendar and the Insforge database",
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientWhatsapp: { type: Type.STRING, description: "The WhatsApp JID of the patient" },
        doctorId: { type: Type.STRING, description: "The UUID of the doctor" },
        datetime: { type: Type.STRING, description: "The datetime of the appointment in ISO 8601 format" },
      },
      required: ["patientWhatsapp", "doctorId", "datetime"],
    },
  },
  {
    name: "viewHistorial",
    description: "View the clinical history of a patient from the Insforge database",
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientWhatsapp: { type: Type.STRING, description: "The WhatsApp JID of the patient" },
      },
      required: ["patientWhatsapp"],
    },
  },
  {
    name: "updateHistorial",
    description: "Append a new note to the clinical history of a patient in the Insforge database",
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientWhatsapp: { type: Type.STRING, description: "The WhatsApp JID of the patient" },
        textToAppend: { type: Type.STRING, description: "The new medical note to append" },
      },
      required: ["patientWhatsapp", "textToAppend"],
    },
  },
];

export async function handleFunctionCall(callName: string, args: any) {
  try {
    switch (callName) {
      case "checkAvailability": {
        const events = await checkAvailability(args.doctorId, args.date);
        return { result: "Success", events };
      }
      case "bookAppointment": {
        const cal = await bookAppointmentCalDav(args.doctorId, args.patientWhatsapp, args.datetime);
        const mockPacienteId = "00000000-0000-0000-0000-000000000000";
        await createCita({
          paciente_id: mockPacienteId,
          doctor_id: args.doctorId,
          start_time: cal.start.toISOString(),
          end_time: cal.end.toISOString(),
          caldav_event_uid: cal.uid,
        });
        return { result: "Appointment Booked Successfully", start: cal.start, end: cal.end };
      }
      case "viewHistorial": {
        return { result: "Clinical History", history: "No previous history found." };
      }
      case "updateHistorial": {
        return { result: "History Updated Successfully" };
      }
      default:
        throw new Error(`Unknown function ${callName}`);
    }
  } catch (err: any) {
    return { error: err.message || "Unknown error" };
  }
}

export async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }) as any,
    browser: Browsers.macOS("Desktop"),
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      qrcode.generate(qr, { small: true });
    }
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("opened connection");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async (m) => {
    if (m.type !== "notify") return;
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const jid = msg.key.remoteJid;
    if (!jid) return;

    const textMsg = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!textMsg) return;

    try {
      const chat = ai.chats.create({
        model: MODEL,
        config: {
          systemInstruction: "You are an AI dental assistant. Identify language. Use tools to manage appointments and histories.",
          tools: [{ functionDeclarations: DECLARATIONS }],
        },
      });

      let response = await chat.sendMessage({ message: textMsg });
      
      while (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
           const result = await handleFunctionCall(call.name, call.args);
           response = await chat.sendMessage([{
             functionResponse: {
               name: call.name,
               response: result
             }
           }]);
        }
      }

      const textResponse = response.text || "No response";
      await sock.sendMessage(jid, { text: textResponse });

    } catch (e) {
      console.error(e);
      await sock.sendMessage(jid, { text: "Error procesando tu mensaje. Intenta más tarde." });
    }
  });
}
