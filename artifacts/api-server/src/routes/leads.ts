import { Router } from "express";
import { db } from "@workspace/db";
import { leads } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateLeadBody, UpdateLeadStatusBody, UpdateLeadStatusParams } from "@workspace/api-zod";

const router = Router();

router.get("/leads", async (req, res, next) => {
  try {
    const all = await db.select().from(leads).orderBy(leads.createdAt);
    res.json(all.reverse());
  } catch (err) {
    next(err);
  }
});

router.post("/leads", async (req, res, next) => {
  try {
    const body = CreateLeadBody.parse(req.body);
    const [created] = await db
      .insert(leads)
      .values({
        name: body.name,
        email: body.email ?? null,
        phone: body.phone,
        service: body.service ?? null,
        message: body.message ?? null,
        status: "nuevo",
      })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.patch("/leads/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = UpdateLeadStatusBody.parse(req.body);
    const [updated] = await db
      .update(leads)
      .set({ status: body.status })
      .where(eq(leads.id, id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: "Lead not found" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
