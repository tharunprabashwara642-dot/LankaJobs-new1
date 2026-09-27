import { Router } from "express";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  categories,
  jobs,
  platformSettings,
  reports,
  users,
} from "@workspace/db/schema";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../lib/auth";
import { asyncRoute, validateBody } from "../lib/http";
import { z } from "zod";

const router = Router();
const moderationSchema = z.object({
  status: z.enum(["PUBLISHED", "REJECTED", "SUSPENDED"]),
  rejectionReason: z.string().trim().max(500).optional(),
});
const userUpdateSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
});
const reportUpdateSchema = z.object({
  status: z.enum(["OPEN", "RESOLVED", "REJECTED"]),
  resolution: z.string().trim().max(1000).optional(),
});
const settingsSchema = z.object({
  postingPrice: z.string().regex(/^\d+(\.\d+)?$/).default("0"),
  featuredPrice: z.string().regex(/^\d+(\.\d+)?$/).default("0"),
  sponsoredPrice: z.string().regex(/^\d+(\.\d+)?$/).default("0"),
  paymentsEnabled: z.boolean().default(false),
  notificationsEnabled: z.boolean().default(false),
  moderationEnabled: z.boolean().default(true),
});

function param(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

router.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN"));

router.get(
  "/admin/dashboard",
  asyncRoute(async (_req, res) => {
    const [usersCount, jobsCount, pending, published, openReports] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(jobs),
      db.select({ count: count() }).from(jobs).where(eq(jobs.status, "PENDING_REVIEW")),
      db.select({ count: count() }).from(jobs).where(eq(jobs.status, "PUBLISHED")),
      db.select({ count: count() }).from(reports).where(eq(reports.status, "OPEN")),
    ]);
    res.json({
      users: Number(usersCount[0]?.count ?? 0),
      jobs: Number(jobsCount[0]?.count ?? 0),
      pendingModeration: Number(pending[0]?.count ?? 0),
      publishedJobs: Number(published[0]?.count ?? 0),
      openReports: Number(openReports[0]?.count ?? 0),
    });
  }),
);

router.get(
  "/admin/users",
  asyncRoute(async (req, res) => {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const where = search
      ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`), ilike(users.phone, `%${search}%`))
      : undefined;
    const data = await db.select().from(users).where(where).orderBy(desc(users.createdAt)).limit(100);
    res.json({ data });
  }),
);

router.patch(
  "/admin/users/:id",
  validateBody(userUpdateSchema),
  asyncRoute(async (req, res) => {
    const actor = (req as AuthenticatedRequest).user!;
    if (req.body.role && actor.role !== "SUPER_ADMIN") {
      res.status(403).json({ error: "Only a super admin can change roles" });
      return;
    }
    const updated = await db.update(users).set({ ...req.body, updatedAt: new Date() }).where(eq(users.id, param(req.params.id))).returning();
    if (!updated.length) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(updated[0]);
  }),
);

router.get(
  "/admin/jobs",
  asyncRoute(async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : "";
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const conditions = [];
    if (status) conditions.push(eq(jobs.status, status as typeof jobs.$inferSelect.status));
    if (search) conditions.push(or(ilike(jobs.title, `%${search}%`), ilike(jobs.company, `%${search}%`))!);
    const data = await db.select().from(jobs).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(jobs.createdAt)).limit(200);
    res.json({ data });
  }),
);

router.post(
  "/admin/jobs/:id/moderate",
  validateBody(moderationSchema),
  asyncRoute(async (req, res) => {
    const updated = await db.update(jobs).set({ status: req.body.status, rejectionReason: req.body.rejectionReason ?? null, updatedAt: new Date() }).where(eq(jobs.id, param(req.params.id))).returning();
    if (!updated.length) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json(updated[0]);
  }),
);

router.delete(
  "/admin/jobs/:id",
  asyncRoute(async (req, res) => {
    const deleted = await db.delete(jobs).where(eq(jobs.id, param(req.params.id))).returning({ id: jobs.id });
    if (!deleted.length) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.status(204).send();
  }),
);

router.get(
  "/admin/reports",
  asyncRoute(async (_req, res) => {
    res.json({ data: await db.select().from(reports).orderBy(desc(reports.createdAt)).limit(200) });
  }),
);

router.patch(
  "/admin/reports/:id",
  validateBody(reportUpdateSchema),
  asyncRoute(async (req, res) => {
    const updated = await db.update(reports).set({ ...req.body, updatedAt: new Date() }).where(eq(reports.id, param(req.params.id))).returning();
    if (!updated.length) {
      res.status(404).json({ error: "Report not found" });
      return;
    }
    res.json(updated[0]);
  }),
);

router.get(
  "/admin/settings",
  asyncRoute(async (_req, res) => {
    const rows = await db.select().from(platformSettings);
    const defaults = {
      postingPrice: "0",
      featuredPrice: "0",
      sponsoredPrice: "0",
      paymentsEnabled: false,
      notificationsEnabled: false,
      moderationEnabled: true,
    };
    for (const row of rows) {
      if (row.key in defaults) {
        (defaults as Record<string, string | boolean>)[row.key] =
          row.value === "true" ? true : row.value === "false" ? false : row.value;
      }
    }
    res.json(defaults);
  }),
);

router.put(
  "/admin/settings",
  validateBody(settingsSchema),
  asyncRoute(async (req, res) => {
    const actor = (req as AuthenticatedRequest).user!;
    for (const [key, value] of Object.entries(req.body)) {
      await db.insert(platformSettings).values({ key, value: String(value), updatedBy: actor.id }).onConflictDoUpdate({
        target: platformSettings.key,
        set: { value: String(value), updatedBy: actor.id, updatedAt: new Date() },
      });
    }
    res.json(req.body);
  }),
);

export default router;