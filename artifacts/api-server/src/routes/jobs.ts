import { Router } from "express";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { categories, jobs, profiles, savedJobs } from "@workspace/db/schema";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { asyncRoute, validateBody } from "../lib/http";
import { z } from "zod";

const router = Router();

const jobSchema = z.object({
  title: z.string().trim().min(2).max(160),
  company: z.string().trim().min(2).max(160),
  description: z.string().trim().min(20).max(12000),
  categoryId: z.string().min(1).optional(),
  category: z.string().trim().max(80).optional(),
  location: z.string().trim().min(2).max(160),
  employmentType: z.enum(["Full-time", "Part-time", "Internship", "Contract"]),
  workMode: z.enum(["On-site", "Hybrid", "Remote"]),
  salary: z.string().trim().max(120).optional(),
  experience: z.string().trim().max(120).default(""),
  education: z.string().trim().max(240).default(""),
  skills: z.array(z.string().trim().min(1).max(80)).max(40).default([]),
  applicationEmail: z.string().email().optional(),
  applicationUrl: z.string().url().optional(),
  closingDate: z.string().date().optional(),
});

const updateJobSchema = jobSchema.partial();

function id() {
  return crypto.randomUUID();
}

function param(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function publicJob(row: { job: typeof jobs.$inferSelect; category: string | null }) {
  const job = row.job;
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    companyMark: job.company.slice(0, 2).toUpperCase(),
    description: job.description,
    category: row.category ?? "Other",
    categoryId: job.categoryId,
    location: job.location,
    employmentType: job.employmentType,
    salary: job.salary ?? undefined,
    experience: job.experience,
    education: job.education,
    skills: job.skills,
    postedAt: job.createdAt.toISOString(),
    closingDate: job.closingDate ?? "",
    applicationEmail: job.applicationEmail ?? undefined,
    applicationUrl: job.applicationUrl ?? undefined,
    workMode: job.workMode,
    status: job.status,
    createdBy: job.ownerId,
  };
}

function parsePage(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 100) : fallback;
}

async function getJobRow(jobId: string) {
  return (
    await db
      .select({ job: jobs, category: categories.name })
      .from(jobs)
      .leftJoin(categories, eq(categories.id, jobs.categoryId))
      .where(eq(jobs.id, jobId))
      .limit(1)
  )[0];
}

router.get(
  "/jobs",
  asyncRoute(async (req, res) => {
    const page = parsePage(req.query.page, 1);
    const pageSize = parsePage(req.query.pageSize, 20);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category : "";
    const location = typeof req.query.location === "string" ? req.query.location : "";
    const employmentType = typeof req.query.employmentType === "string" ? req.query.employmentType : "";
    const workMode = typeof req.query.workMode === "string" ? req.query.workMode : "";
    const sort = req.query.sort === "oldest" ? asc(jobs.createdAt) : desc(jobs.createdAt);
    const conditions = [eq(jobs.status, "PUBLISHED" as const)];
    if (search) {
      conditions.push(
        or(
          ilike(jobs.title, `%${search}%`),
          ilike(jobs.company, `%${search}%`),
          ilike(jobs.location, `%${search}%`),
          ilike(jobs.description, `%${search}%`),
        )!,
      );
    }
    if (location) conditions.push(ilike(jobs.location, `%${location}%`));
    if (employmentType) conditions.push(eq(jobs.employmentType, employmentType as typeof jobs.$inferSelect.employmentType));
    if (workMode) conditions.push(eq(jobs.workMode, workMode as typeof jobs.$inferSelect.workMode));
    if (category) conditions.push(eq(categories.slug, category));
    const rows = await db
      .select({ job: jobs, category: categories.name })
      .from(jobs)
      .leftJoin(categories, eq(categories.id, jobs.categoryId))
      .where(and(...conditions))
      .orderBy(sort)
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    res.json({ data: rows.map(publicJob), page, pageSize, hasMore: rows.length === pageSize });
  }),
);

router.get(
  "/jobs/recommendations",
  requireAuth,
  asyncRoute(async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const profile = (await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1))[0];
    if (!profile) {
      res.json({ data: [], reason: "Complete your profile to receive recommendations" });
      return;
    }
    const rows = await db
      .select({ job: jobs, category: categories.name })
      .from(jobs)
      .leftJoin(categories, eq(categories.id, jobs.categoryId))
      .where(eq(jobs.status, "PUBLISHED"))
      .orderBy(desc(jobs.createdAt))
      .limit(100);
    const interests = new Set(profile.interests.map((item) => item.toLowerCase()));
    const skills = new Set(profile.skills.map((item) => item.toLowerCase()));
    const ranked = rows
      .map((row) => {
        const job = row.job;
        const haystack = [job.title, job.description, job.location, job.experience, ...job.skills].join(" ").toLowerCase();
        let score = 0;
        if (row.category && interests.has(row.category.toLowerCase())) score += 5;
        if (profile.location && job.location.toLowerCase().includes(profile.location.toLowerCase())) score += 3;
        if (profile.workMode && profile.workMode === job.workMode) score += 3;
        if (profile.employmentType && profile.employmentType === job.employmentType) score += 2;
        for (const skill of skills) if (haystack.includes(skill)) score += 1;
        return { ...publicJob(row), score };
      })
      .sort((a, b) => b.score - a.score || b.postedAt.localeCompare(a.postedAt))
      .slice(0, 20);
    res.json({ data: ranked });
  }),
);

router.get(
  "/jobs/mine",
  requireAuth,
  asyncRoute(async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const rows = await db
      .select({ job: jobs, category: categories.name })
      .from(jobs)
      .leftJoin(categories, eq(categories.id, jobs.categoryId))
      .where(eq(jobs.ownerId, user.id))
      .orderBy(desc(jobs.updatedAt));
    res.json({ data: rows.map(publicJob) });
  }),
);

router.get(
  "/jobs/:id",
  asyncRoute(async (req, res) => {
    const row = await getJobRow(param(req.params.id));
    if (!row || row.job.status !== "PUBLISHED") {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json(publicJob(row));
  }),
);

router.post(
  "/jobs",
  requireAuth,
  validateBody(jobSchema),
  asyncRoute(async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    let categoryId = req.body.categoryId;
    if (!categoryId && req.body.category) {
      categoryId = (
        await db.select({ id: categories.id }).from(categories).where(eq(categories.name, req.body.category)).limit(1)
      )[0]?.id;
    }
    const record = {
      id: id(),
      ownerId: user.id,
      ...req.body,
      categoryId,
      category: undefined,
      closingDate: req.body.closingDate,
      status: "DRAFT" as const,
    };
    const { category: _category, ...values } = record;
    await db.insert(jobs).values(values);
    const row = await getJobRow(record.id);
    res.status(201).json(publicJob(row!));
  }),
);

router.put(
  "/jobs/:id",
  requireAuth,
  validateBody(updateJobSchema),
  asyncRoute(async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const current = await getJobRow(param(req.params.id));
    if (!current || current.job.ownerId !== user.id) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    const { category: _category, categoryId, ...values } = req.body;
    await db.update(jobs).set({ ...values, ...(categoryId !== undefined ? { categoryId } : {}), updatedAt: new Date() }).where(and(eq(jobs.id, param(req.params.id)), eq(jobs.ownerId, user.id)));
    const row = await getJobRow(param(req.params.id));
    res.json(publicJob(row!));
  }),
);

router.delete(
  "/jobs/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const deleted = await db.delete(jobs).where(and(eq(jobs.id, param(req.params.id)), eq(jobs.ownerId, user.id))).returning({ id: jobs.id });
    if (!deleted.length) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.status(204).send();
  }),
);

router.post(
  "/jobs/:id/submit",
  requireAuth,
  asyncRoute(async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const updated = await db
      .update(jobs)
      .set({ status: "PENDING_REVIEW", updatedAt: new Date() })
      .where(and(eq(jobs.id, param(req.params.id)), eq(jobs.ownerId, user.id), eq(jobs.status, "DRAFT")))
      .returning({ id: jobs.id });
    if (!updated.length) {
      res.status(404).json({ error: "Draft job not found" });
      return;
    }
    res.json({ status: "PENDING_REVIEW" });
  }),
);

router.get(
  "/saved-jobs",
  requireAuth,
  asyncRoute(async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const rows = await db
      .select({ job: jobs, category: categories.name })
      .from(savedJobs)
      .innerJoin(jobs, eq(jobs.id, savedJobs.jobId))
      .leftJoin(categories, eq(categories.id, jobs.categoryId))
      .where(eq(savedJobs.userId, user.id))
      .orderBy(desc(savedJobs.createdAt));
    res.json({ data: rows.map(publicJob) });
  }),
);

router.post(
  "/saved-jobs/:jobId",
  requireAuth,
  asyncRoute(async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const job = await getJobRow(param(req.params.jobId));
    if (!job || job.job.status !== "PUBLISHED") {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    await db.insert(savedJobs).values({ userId: user.id, jobId: param(req.params.jobId) }).onConflictDoNothing();
    res.status(204).send();
  }),
);

router.delete(
  "/saved-jobs/:jobId",
  requireAuth,
  asyncRoute(async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    await db.delete(savedJobs).where(and(eq(savedJobs.userId, user.id), eq(savedJobs.jobId, param(req.params.jobId))));
    res.status(204).send();
  }),
);

export default router;