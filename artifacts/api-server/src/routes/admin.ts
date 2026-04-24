import { Router } from "express";
import { db } from "@workspace/db";
import { leads, pageVisits, conversations } from "@workspace/db";
import { sql, gte, count } from "drizzle-orm";
import { TrackVisitBody } from "@workspace/api-zod";

const router = Router();

router.get("/admin/stats", async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalLeadsRes] = await db.select({ c: count() }).from(leads);
    const [newLeadsTodayRes] = await db
      .select({ c: count() })
      .from(leads)
      .where(gte(leads.createdAt, todayStart));

    const [totalVisitsRes] = await db.select({ c: count() }).from(pageVisits);
    const [visitsTodayRes] = await db
      .select({ c: count() })
      .from(pageVisits)
      .where(gte(pageVisits.createdAt, todayStart));

    const [totalConversationsRes] = await db.select({ c: count() }).from(conversations);

    const allLeads = await db.select().from(leads).orderBy(leads.createdAt);

    const leadsByServiceMap: Record<string, number> = {};
    const leadsByStatusMap: Record<string, number> = {};
    for (const lead of allLeads) {
      const svc = lead.service ?? "Sin especificar";
      leadsByServiceMap[svc] = (leadsByServiceMap[svc] ?? 0) + 1;
      leadsByStatusMap[lead.status] = (leadsByStatusMap[lead.status] ?? 0) + 1;
    }

    const recentLeads = [...allLeads].reverse().slice(0, 10);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const visitRows = await db
      .select({
        date: sql<string>`DATE(created_at)::text`,
        count: count(),
      })
      .from(pageVisits)
      .where(gte(pageVisits.createdAt, sevenDaysAgo))
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);

    const totalLeads = totalLeadsRes?.c ?? 0;
    const totalConversations = totalConversationsRes?.c ?? 0;
    const conversionRate = totalLeads > 0 ? Math.round((Number(totalConversations) / Number(totalLeads)) * 100) : 0;

    res.json({
      totalLeads: Number(totalLeads),
      newLeadsToday: Number(newLeadsTodayRes?.c ?? 0),
      totalVisits: Number(totalVisitsRes?.c ?? 0),
      visitsToday: Number(visitsTodayRes?.c ?? 0),
      totalConversations: Number(totalConversations),
      conversionRate,
      leadsByService: Object.entries(leadsByServiceMap).map(([service, count]) => ({ service, count })),
      leadsByStatus: Object.entries(leadsByStatusMap).map(([status, count]) => ({ status, count })),
      recentLeads,
      visitsLast7Days: visitRows.map(r => ({ date: r.date, count: Number(r.count) })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/track-visit", async (req, res) => {
  try {
    const body = TrackVisitBody.parse(req.body);
    await db.insert(pageVisits).values({
      page: body.page,
      referrer: body.referrer ?? null,
      userAgent: req.headers["user-agent"] ?? null,
    });
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to track visit");
    res.json({ ok: false });
  }
});

export default router;
