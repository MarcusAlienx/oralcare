// @ts-nocheck
import { createClient } from "@insforge/sdk";

// The bot uses its own environment credentials for secure access.
const insforge = createClient({ url: process.env.INSFORGE_URL || "", key: process.env.INSFORGE_ANON_KEY || "" });

export const createPaciente = async (pacienteData: any) => {
  const { data, error } = await insforge.from("pacientes").insert([pacienteData]).select();
  if (error) throw new Error(`Error creating paciente: ${error.message}`);
  return data;
};

export const getPacienteById = async (id: string) => {
  const { data, error } = await insforge.from("pacientes").select("*").eq("id", id).single();
  if (error) throw new Error(`Error fetching paciente: ${error.message}`);
  return data;
};

export const createLeadTurismo = async (leadData: any) => {
  const { data, error } = await insforge.from("leads_turismo").insert([leadData]).select();
  if (error) throw new Error(`Error creating lead_turismo: ${error.message}`);
  return data;
};

export const updateLeadStatus = async (id: string, status: string) => {
  const { data, error } = await insforge.from("leads_turismo").update({ status }).eq("id", id).select();
  if (error) throw new Error(`Error updating lead_turismo status: ${error.message}`);
  return data;
};

export const getDoctores = async () => {
  const { data, error } = await insforge.from("doctores").select("*");
  if (error) throw new Error(`Error fetching doctores: ${error.message}`);
  return data;
};

export const createCita = async (citaData: any) => {
  const { data, error } = await insforge.from("citas").insert([citaData]).select();
  if (error) throw new Error(`Error creating cita: ${error.message}`);
  return data;
};

export const getCitasByPaciente = async (pacienteId: string) => {
  const { data, error } = await insforge.from("citas").select("*").eq("paciente_id", pacienteId);
  if (error) throw new Error(`Error fetching citas: ${error.message}`);
  return data;
};
