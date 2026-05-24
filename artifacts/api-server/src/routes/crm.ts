import { Router } from "express";
import { createPaciente, getPacienteById, createLeadTurismo, updateLeadStatus, getDoctores, createCita, getCitasByPaciente } from "../services/dbService";

const router = Router();

router.post("/pacientes", async (req, res, next) => { try { res.status(201).json(await createPaciente(req.body)); } catch (e) { next(e); } });
router.get("/pacientes/:id", async (req, res, next) => { try { res.json(await getPacienteById(req.params.id)); } catch (e) { next(e); } });
router.post("/leads-turismo", async (req, res, next) => { try { res.status(201).json(await createLeadTurismo(req.body)); } catch (e) { next(e); } });
router.patch("/leads-turismo/:id", async (req, res, next) => { try { res.json(await updateLeadStatus(req.params.id, req.body.status)); } catch (e) { next(e); } });
router.get("/doctores", async (req, res, next) => { try { res.json(await getDoctores()); } catch (e) { next(e); } });
router.post("/citas", async (req, res, next) => { try { res.status(201).json(await createCita(req.body)); } catch (e) { next(e); } });
router.get("/pacientes/:id/citas", async (req, res, next) => { try { res.json(await getCitasByPaciente(req.params.id)); } catch (e) { next(e); } });

export default router;
