import { Router } from "express";
import { db } from "@workspace/db";
import { reports } from "@workspace/db/schema";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { asyncRoute, validateBody } from "../lib/http";
import { z } from "zod";

const router = Router();
const reportSchema = z.object({
  jobId: z.string().optional(),
  reportedUserId: z.string().optional(),
  reason: z.string().trim().min(5).max(1000),
}).refine((value) => value.jobId || value.reportedUserId, { message: "A job or user is required" });

router.post(
  "/reports",
  requireAuth,
  validateBody(reportSchema),
  asyncRoute(async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const report = { id: crypto.randomUUID(), reporterId: user.id, ...req.body };
    await db.insert(reports).values(report);
    res.status(201).json(report);
  }),
);

export default router;