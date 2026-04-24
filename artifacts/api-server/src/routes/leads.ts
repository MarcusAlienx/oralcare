import { Router } from "express";
import { db } from "@workspace/db";
import { leads } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateLeadBody, UpdateLeadStatusBody, UpdateLeadStatusParams } from "@workspace/api-zod";

const router = Router();

router.get("/leads", async (req, res) => {
  try {
    const all = await db.select().from(leads).orderBy(leads.createdAt);
    res.json(all.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to list leads");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/leads", async (req, res) => {
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
    req.log.error({ err }, "Failed to create lead");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/leads/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = UpdateLeadStatusBody.parse(req.body);
    const [updated] = await db
      .update(leads)
      .set({ status: body.status })
      .where(eq(leads.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update lead status");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
