import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

/**
 * Server-side enforcement for email-based 2FA (MFA).
 *
 * Problem this solves:
 *   `/api/login` calls `signInWithPassword` first, which mints a *fully valid*
 *   Supabase session before the OTP is ever checked. Returning `mfaRequired`
 *   was only a UI hint, so any protected API/page that merely checks
 *   `auth.getUser()` was reachable before the second factor was completed.
 *
 * Fix:
 *   After a successful OTP verification we set a short-lived, signed,
 *   httpOnly cookie ("mfa_verified") that records *which user* completed the
 *   second factor and *until when* that proof is valid. Every authorization
 *   path (`authorizeUser`, `authorizeAdmin`, `authorizeUserClient`, the report
 *   service, `/api/me`, and the protected admin pages) refuses access to a
 *   user who has 2FA enabled but does not present a valid marker.
 *
 * The marker is a JWT signed with the same `JWT_SECRET` already used by
 * `src/lib/session.ts`, so no new infrastructure/secret is required.
 */

const MFA_COOKIE = "mfa_verified";

// How long a completed OTP verification stays valid for the session.
// After this window the user must re-authenticate with a fresh OTP.
const MFA_TTL_SECONDS = 12 * 60 * 60; // 12 hours

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

type MaybeUser = {
  id: string;
  app_metadata?: Record<string, unknown> | null;
};

type MfaTokenPayload = {
  sub: string;
  purpose: "mfa";
};

/** True when the account has email-based 2FA turned on. */
export function isMfaEnabled(user: MaybeUser): boolean {
  return user.app_metadata?.email_2fa_enabled === true;
}

async function signMfaToken(userId: string): Promise<string> {
  return new SignJWT({ purpose: "mfa" } satisfies Omit<MfaTokenPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MFA_TTL_SECONDS}s`)
    .sign(secret);
}

async function verifyMfaToken(token: string): Promise<MfaTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    // jwtVerify already rejects expired tokens (enforces the verified window).
    if (payload.purpose !== "mfa" || typeof payload.sub !== "string") {
      return null;
    }
    return { sub: payload.sub, purpose: "mfa" };
  } catch {
    return null;
  }
}

/**
 * Core gate. Returns true when the request is allowed to proceed:
 *   - the account does not have 2FA enabled, OR
 *   - a valid, unexpired MFA marker for *this* user is present.
 * Reads the cookie from the ambient request (works in route handlers and
 * server components alike).
 */
export async function isMfaSatisfied(user: MaybeUser): Promise<boolean> {
  if (!isMfaEnabled(user)) {
    return true;
  }

  const token = (await cookies()).get(MFA_COOKIE)?.value;
  if (!token) {
    return false;
  }

  const payload = await verifyMfaToken(token);
  return payload?.sub === user.id;
}

/**
 * API guard. Returns a 403 response (with `mfaRequired: true`) when the user
 * has 2FA enabled but has not completed OTP verification; otherwise null.
 */
export async function enforceMfaApi(user: MaybeUser): Promise<NextResponse | null> {
  if (await isMfaSatisfied(user)) {
    return null;
  }

  return NextResponse.json(
    {
      error: "Verifikasi dua langkah (2FA) belum selesai. Masukkan kode OTP terlebih dahulu.",
      mfaRequired: true,
    },
    { status: 403 }
  );
}

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Attach a fresh MFA-verified marker to an outgoing response. */
export async function setMfaVerifiedCookie(response: NextResponse, userId: string): Promise<void> {
  const token = await signMfaToken(userId);
  response.cookies.set({
    name: MFA_COOKIE,
    value: token,
    ...baseCookieOptions,
    maxAge: MFA_TTL_SECONDS,
  });
}

/** Remove any MFA-verified marker (e.g. at the start of a fresh login). */
export function clearMfaVerifiedCookie(response: NextResponse): void {
  response.cookies.set({
    name: MFA_COOKIE,
    value: "",
    ...baseCookieOptions,
    maxAge: 0,
  });
}
