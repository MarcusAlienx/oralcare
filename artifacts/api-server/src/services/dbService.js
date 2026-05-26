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
import { createClient } from "@insforge/sdk";
// The bot uses its own environment credentials for secure access.
var insforge = createClient({ url: process.env.INSFORGE_URL || "", key: process.env.INSFORGE_ANON_KEY || "" });
export var createPaciente = function (pacienteData) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, insforge.from("pacientes").insert([pacienteData]).select()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw new Error("Error creating paciente: ".concat(error.message));
                return [2 /*return*/, data];
        }
    });
}); };
export var getPacienteById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, insforge.from("pacientes").select("*").eq("id", id).single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw new Error("Error fetching paciente: ".concat(error.message));
                return [2 /*return*/, data];
        }
    });
}); };
export var createLeadTurismo = function (leadData) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, insforge.from("leads_turismo").insert([leadData]).select()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw new Error("Error creating lead_turismo: ".concat(error.message));
                return [2 /*return*/, data];
        }
    });
}); };
export var updateLeadStatus = function (id, status) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, insforge.from("leads_turismo").update({ status: status }).eq("id", id).select()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw new Error("Error updating lead_turismo status: ".concat(error.message));
                return [2 /*return*/, data];
        }
    });
}); };
export var getDoctores = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, insforge.from("doctores").select("*")];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw new Error("Error fetching doctores: ".concat(error.message));
                return [2 /*return*/, data];
        }
    });
}); };
export var createCita = function (citaData) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, insforge.from("citas").insert([citaData]).select()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw new Error("Error creating cita: ".concat(error.message));
                return [2 /*return*/, data];
        }
    });
}); };
export var getCitasByPaciente = function (pacienteId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, insforge.from("citas").select("*").eq("paciente_id", pacienteId)];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw new Error("Error fetching citas: ".concat(error.message));
                return [2 /*return*/, data];
        }
    });
}); };
