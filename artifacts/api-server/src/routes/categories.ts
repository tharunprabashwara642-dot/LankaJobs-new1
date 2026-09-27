import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { categories } from "@workspace/db/schema";
import { requireAuth, requireRole } from "../lib/auth";
import { asyncRoute, validateBody } from "../lib/http";
import { z } from "zod";

const router = Router();
const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(80),
  icon: z.string().trim().max(80).default("briefcase-outline"),
  isActive: z.boolean().default(true),
});

function param(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

router.get(
  "/categories",
  asyncRoute(async (_req, res) => {
    const data = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name));
    res.json({ data });
  }),
);

router.get(
  "/admin/categories",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  asyncRoute(async (_req, res) => {
    res.json({ data: await db.select().from(categories).orderBy(asc(categories.name)) });
  }),
);

router.post(
  "/admin/categories",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  validateBody(categorySchema),
  asyncRoute(async (req, res) => {
    const category = { id: crypto.randomUUID(), ...req.body };
    await db.insert(categories).values(category);
    res.status(201).json(category);
  }),
);

router.patch(
  "/admin/categories/:id",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  validateBody(categorySchema.partial()),
  asyncRoute(async (req, res) => {
    const updated = await db.update(categories).set({ ...req.body, updatedAt: new Date() }).where(eq(categories.id, param(req.params.id))).returning();
    if (!updated.length) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(updated[0]);
  }),
);

router.delete(
  "/admin/categories/:id",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  asyncRoute(async (req, res) => {
    const deleted = await db.delete(categories).where(eq(categories.id, param(req.params.id))).returning({ id: categories.id });
    if (!deleted.length) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.status(204).send();
  }),
);

export default router;