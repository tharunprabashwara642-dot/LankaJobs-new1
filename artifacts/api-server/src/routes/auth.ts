import { randomBytes } from "node:crypto";
import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { otpChallenges, profiles } from "@workspace/db/schema";
import {
  consumeOtpChallenge,
  createOtpChallenge,
  createSession,
  destroySession,
  findOrCreateGoogleUser,
  findOrCreatePhoneUser,
  getAuthenticatedUser,
  normalizePhone,
  requireAuth,
  sendSmsOtp,
  setSessionCookie,
  SESSION_COOKIE,
  type AuthenticatedRequest,
} from "../lib/auth";
import { asyncRoute, validateBody } from "../lib/http";
import { z } from "zod";

const router = Router();

const phoneSchema = z.object({ phone: z.string().min(7).max(24) });
const verifySchema = phoneSchema.extend({ code: z.string().regex(/^\d{6}$/) });

function publicUser(user: NonNullable<AuthenticatedRequest["user"]>) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}

router.get("/auth/config", (_req, res) => {
  res.json({
    googleEnabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    phoneEnabled: Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_FROM_NUMBER,
    ),
  });
});

router.post(
  "/auth/phone/request",
  validateBody(phoneSchema),
  asyncRoute(async (req, res) => {
    const phone = normalizePhone(req.body.phone);
    const challenge = await createOtpChallenge(phone);
    try {
      await sendSmsOtp(phone, challenge.code);
    } catch (error) {
      await db.delete(otpChallenges).where(eq(otpChallenges.id, challenge.id));
      throw error;
    }
    res.status(202).json({ message: "Verification code sent", expiresAt: challenge.expiresAt });
  }),
);

router.post(
  "/auth/phone/verify",
  validateBody(verifySchema),
  asyncRoute(async (req, res) => {
    const phone = normalizePhone(req.body.phone);
    const valid = await consumeOtpChallenge(phone, req.body.code);
    if (!valid) {
      res.status(401).json({ error: "Invalid or expired verification code" });
      return;
    }
    const user = await findOrCreatePhoneUser(phone);
    const session = await createSession(user.id);
    setSessionCookie(res, session.token, session.expiresAt);
    res.json({ accessToken: session.token, expiresAt: session.expiresAt, user: publicUser(user) });
  }),
);

router.get("/auth/google/start", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET || !redirectUri) {
    res.status(503).json({ error: "Google sign-in is not configured: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI are required." });
    return;
  }
  const state = randomBytes(24).toString("base64url");
  res.cookie("lankajobs_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
  });
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  res.redirect(url.toString());
});

router.get(
  "/auth/google/callback",
  asyncRoute(async (req, res) => {
    const expectedState = req.cookies?.lankajobs_oauth_state;
    if (!expectedState || expectedState !== req.query.state) {
      res.status(400).json({ error: "Invalid OAuth state" });
      return;
    }
    const code = typeof req.query.code === "string" ? req.query.code : "";
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!code || !clientId || !clientSecret || !redirectUri) {
      res.status(400).json({ error: "Google authorization was incomplete" });
      return;
    }
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenResponse.ok) {
      res.status(502).json({ error: "Google token exchange failed" });
      return;
    }
    const token = (await tokenResponse.json()) as { access_token?: string };
    if (!token.access_token) {
      res.status(502).json({ error: "Google did not return an access token" });
      return;
    }
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!profileResponse.ok) {
      res.status(502).json({ error: "Google profile lookup failed" });
      return;
    }
    const profile = (await profileResponse.json()) as { sub: string; email?: string; name?: string };
    const user = await findOrCreateGoogleUser(profile);
    const session = await createSession(user.id);
    setSessionCookie(res, session.token, session.expiresAt);
    const redirect = process.env.GOOGLE_SUCCESS_REDIRECT;
    if (redirect) {
      const target = new URL(redirect);
      target.searchParams.set("accessToken", session.token);
      res.redirect(target.toString());
      return;
    }
    res.json({ accessToken: session.token, expiresAt: session.expiresAt, user: publicUser(user) });
  }),
);

router.get(
  "/auth/me",
  requireAuth,
  asyncRoute(async (req, res) => {
    const result = await getAuthenticatedUser(req);
    if (!result) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const profile = (
      await db.select().from(profiles).where(eq(profiles.userId, result.user.id)).limit(1)
    )[0] ?? null;
    res.json({ user: publicUser(result.user), profile });
  }),
);

router.post(
  "/auth/logout",
  asyncRoute(async (req, res) => {
    const authorization = req.header("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : req.cookies?.[SESSION_COOKIE];
    await destroySession(token);
    res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", path: "/" });
    res.status(204).send();
  }),
);

export default router;