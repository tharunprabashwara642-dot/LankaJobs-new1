import type { NextFunction, Request, Response } from "express";
import { ZodError, type z } from "zod";

export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", issues: parsed.error.issues });
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function asyncRoute(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(400).json({ error: "Invalid request", issues: error.issues });
    return;
  }
  const message = error instanceof Error ? error.message : "Unexpected server error";
  if (message.includes("not configured")) {
    res.status(503).json({ error: message });
    return;
  }
  console.error(error);
  res.status(500).json({ error: "Unexpected server error" });
}