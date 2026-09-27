import { createHash, randomBytes, randomInt } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@workspace/db";
import { authSessions, otpChallenges, users, type User } from "@workspace/db/schema";

const SESSION_DAYS = 30;
export const SESSION_COOKIE = "lankajobs_session";

export type AuthenticatedRequest = Request & { user?: User; sessionId?: string };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function newId() {
  return randomBytes(16).toString("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(authSessions).values({
    id: newId(),
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });
  return { token, expiresAt };
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  await db.delete(authSessions).where(eq(authSessions.tokenHash, hashToken(token)));
}

function getToken(req: Request) {
  const authorization = req.header("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7).trim();
  return req.cookies?.[SESSION_COOKIE] as string | undefined;
}

export async function getAuthenticatedUser(req: Request) {
  const token = getToken(req);
  if (!token) return null;
  const rows = await db
    .select({ user: users, sessionId: authSessions.id })
    .from(authSessions)
    .innerJoin(users, eq(users.id, authSessions.userId))
    .where(and(eq(authSessions.tokenHash, hashToken(token)), gt(authSessions.expiresAt, new Date())))
    .limit(1);
  const result = rows[0];
  if (!result || result.user.status !== "ACTIVE") return null;
  return { ...result, token };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await getAuthenticatedUser(req);
    if (!result) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    req.user = result.user;
    req.sessionId = result.sessionId;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: User["role"][]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").replace(/^00/, "+");
}

export async function createOtpChallenge(phone: string) {
  const code = randomInt(100000, 1000000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const challenge = {
    id: newId(),
    phone,
    codeHash: hashToken(code),
    expiresAt,
  };
  await db.insert(otpChallenges).values(challenge);
  return { ...challenge, code };
}

export async function consumeOtpChallenge(phone: string, code: string) {
  const challenge = (
    await db
      .select()
      .from(otpChallenges)
      .where(
        and(
          eq(otpChallenges.phone, phone),
          isNull(otpChallenges.consumedAt),
          gt(otpChallenges.expiresAt, new Date()),
        ),
      )
      .orderBy(otpChallenges.createdAt)
      .limit(1)
  )[0];
  if (!challenge || challenge.attempts >= 5) return false;
  if (challenge.codeHash !== hashToken(code)) {
    await db
      .update(otpChallenges)
      .set({ attempts: challenge.attempts + 1 })
      .where(eq(otpChallenges.id, challenge.id));
    return false;
  }
  await db
    .update(otpChallenges)
    .set({ consumedAt: new Date() })
    .where(eq(otpChallenges.id, challenge.id));
  return true;
}

export async function sendSmsOtp(phone: string, code: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!accountSid || !authToken || !from) {
    throw new Error("Phone OTP is not configured: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER are required.");
  }
  const body = new URLSearchParams({
    To: phone,
    From: from,
    Body: `Your LankaJobs verification code is ${code}. It expires in 5 minutes.`,
  });
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );
  if (!response.ok) throw new Error("The SMS provider rejected the OTP request.");
}

export async function findOrCreatePhoneUser(phone: string) {
  const existing = (await db.select().from(users).where(eq(users.phone, phone)).limit(1))[0];
  const configuredAdminPhone = process.env.ADMIN_PHONE && normalizePhone(process.env.ADMIN_PHONE);
  if (existing) {
    if (configuredAdminPhone && phone === configuredAdminPhone && existing.role === "USER") {
      await db.update(users).set({ role: "ADMIN", updatedAt: new Date() }).where(eq(users.id, existing.id));
      return { ...existing, role: "ADMIN" as const };
    }
    return existing;
  }
  const user: User = {
    id: newId(),
    email: null,
    phone,
    googleSub: null,
    name: "",
    role: configuredAdminPhone && phone === configuredAdminPhone ? "ADMIN" : "USER",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.insert(users).values(user);
  return user;
}

export async function findOrCreateGoogleUser(profile: { sub: string; email?: string; name?: string }) {
  const configuredAdminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const existing = (
    await db.select().from(users).where(eq(users.googleSub, profile.sub)).limit(1)
  )[0];
  if (existing) {
    if (configuredAdminEmail && profile.email?.toLowerCase() === configuredAdminEmail && existing.role === "USER") {
      await db.update(users).set({ role: "ADMIN", updatedAt: new Date() }).where(eq(users.id, existing.id));
      return { ...existing, role: "ADMIN" as const };
    }
    return existing;
  }
  const byEmail = profile.email
    ? (await db.select().from(users).where(eq(users.email, profile.email)).limit(1))[0]
    : undefined;
  if (byEmail) {
    const updated = { ...byEmail, googleSub: profile.sub, name: profile.name || byEmail.name, updatedAt: new Date() };
    const role = configuredAdminEmail && profile.email?.toLowerCase() === configuredAdminEmail ? "ADMIN" as const : byEmail.role;
    await db.update(users).set({ googleSub: profile.sub, name: updated.name, role, updatedAt: updated.updatedAt }).where(eq(users.id, byEmail.id));
    return { ...updated, role };
  }
  const user: User = {
    id: newId(),
    email: profile.email ?? null,
    phone: null,
    googleSub: profile.sub,
    name: profile.name ?? "",
    role: configuredAdminEmail && profile.email?.toLowerCase() === configuredAdminEmail ? "ADMIN" : "USER",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.insert(users).values(user);
  return user;
}