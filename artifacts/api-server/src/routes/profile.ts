import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { profiles, users } from "@workspace/db/schema";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { asyncRoute, validateBody } from "../lib/http";
import { z } from "zod";

const router = Router();
const profileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  location: z.string().trim().max(120).optional(),
  interests: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  experience: z.string().trim().max(120).optional(),
  education: z.string().trim().max(200).optional(),
  skills: z.array(z.string().trim().min(1).max(80)).max(40).optional(),
  employmentType: z.string().trim().max(40).optional(),
  workPreference: z.string().trim().max(80).optional(),
  workMode: z.string().trim().max(30).optional(),
});

router.get(
  "/profile",
  requireAuth,
  asyncRoute(async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const profile = (await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1))[0] ?? null;
    res.json({ user, profile });
  }),
);

router.put(
  "/profile",
  requireAuth,
  validateBody(profileSchema),
  asyncRoute(async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const { name, ...profileValues } = req.body;
    if (name !== undefined) {
      await db.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, user.id));
    }
    const existing = (await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1))[0];
    if (existing) {
      await db.update(profiles).set({ ...profileValues, updatedAt: new Date() }).where(eq(profiles.userId, user.id));
    } else {
      await db.insert(profiles).values({ userId: user.id, ...profileValues });
    }
    const updatedUser = (await db.select().from(users).where(eq(users.id, user.id)).limit(1))[0];
    const profile = (await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1))[0];
    res.json({ user: updatedUser, profile });
  }),
);

export default router;