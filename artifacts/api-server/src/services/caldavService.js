var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// @ts-nocheck
import { DAVClient, createObject } from "tsdav";
import ical from "ical-generator";
import { v4 as uuidv4 } from "uuid";
import { getDoctores } from "./dbService";
// Helper para iniciar cliente de CalDAV
var getDavClient = function (doctorId) { return __awaiter(void 0, void 0, void 0, function () {
    var doctores, doc, client, calendars;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getDoctores()];
            case 1:
                doctores = _a.sent();
                doc = doctores.find(function (d) { return d.id === doctorId; });
                if (!doc)
                    throw new Error("Doctor no encontrado");
                if (!doc.caldavUrl || !doc.caldavUsername || !doc.caldavPasswordEncrypted) {
                    throw new Error("Doctor no tiene configuradas las credenciales de CalDAV");
                }
                client = new DAVClient({
                    serverUrl: doc.caldavUrl,
                    credentials: {
                        username: doc.caldavUsername,
                        password: doc.caldavPasswordEncrypted,
                    },
                    authMethod: "Basic",
                    defaultAccountType: "caldav",
                });
                return [4 /*yield*/, client.login()];
            case 2:
                _a.sent();
                return [4 /*yield*/, client.fetchCalendars()];
            case 3:
                calendars = _a.sent();
                if (!calendars || calendars.length === 0)
                    throw new Error("No se encontraron calendarios");
                return [2 /*return*/, { client: client, calendar: calendars[0], doc: doc }];
        }
    });
}); };
export var checkAvailability = function (doctorId, dateStr) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, client, calendar, startOfDay, endOfDay, events;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, getDavClient(doctorId)];
            case 1:
                _a = _b.sent(), client = _a.client, calendar = _a.calendar;
                startOfDay = new Date(dateStr);
                startOfDay.setHours(0, 0, 0, 0);
                endOfDay = new Date(dateStr);
                endOfDay.setHours(23, 59, 59, 999);
                return [4 /*yield*/, client.fetchCalendarObjects({
                        calendar: calendar,
                        timeRange: { start: startOfDay.toISOString(), end: endOfDay.toISOString() },
                    })];
            case 2:
                events = _b.sent();
                // Simplified logic: return busy slots or parse the actual ical output
                // For standard LLM consumption, we can return the array of busy objects.
                return [2 /*return*/, events.map(function (ev) { return ev.data; })]; // Return raw VEVENTs or parsed objects
        }
    });
}); };
export var bookAppointmentCalDav = function (doctorId, patientWhatsapp, datetimeStr) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, client, calendar, doc, start, end, uid, cal, icalString, filename;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, getDavClient(doctorId)];
            case 1:
                _a = _b.sent(), client = _a.client, calendar = _a.calendar, doc = _a.doc;
                start = new Date(datetimeStr);
                end = new Date(start.getTime() + 60 * 60 * 1000);
                uid = uuidv4();
                cal = ical({ name: "Citas A&E OralCare" });
                cal.createEvent({
                    start: start,
                    end: end,
                    summary: "Cita Cl\u00EDnica - ".concat(patientWhatsapp),
                    description: "Cita generada por IA",
                    location: "A&E OralCare",
                    uid: uid,
                });
                icalString = cal.toString();
                filename = "".concat(uid, ".ics");
                return [4 /*yield*/, createObject({
                        url: "".concat(calendar.url).concat(filename),
                        data: icalString,
                        headers: {
                            "Content-Type": "text/calendar; charset=utf-8",
                            Authorization: "Basic ".concat(Buffer.from("".concat(doc.caldavUsername, ":").concat(doc.caldavPasswordEncrypted)).toString("base64")),
                        },
                    })];
            case 2:
                _b.sent();
                return [2 /*return*/, { uid: uid, start: start, end: end }];
        }
    });
}); };
