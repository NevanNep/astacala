import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/src/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { setMfaVerifiedCookie } from "@/src/lib/mfa";
import { checkOtpRateLimit, recordOtpFailure, resetOtpAttempts } from "@/src/lib/otp-rate-limit";

type PostLoginRoute = "/admin/dashboard" | "/dashboard";

function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function parseBody(request: NextRequest): Promise<{ code: string } | null> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    const values = body as Record<string, unknown>;
    return { code: asText(values.code) };
  } catch {
    return null;
  }
}

function getRedirect(role: string | null | undefined): PostLoginRoute {
  return role === "admin" ? "/admin/dashboard" : "/dashboard";
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(await cookies());

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Brute-force guard: block rapid OTP guessing per account.
    const rateLimit = checkOtpRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak percobaan kode. Tunggu beberapa menit sebelum mencoba lagi.",
        },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const body = await parseBody(request);
    const code = body?.code ?? "";
    if (!code || code.length < 6 || !/^\d+$/.test(code)) {
      return NextResponse.json(
        { error: "Kode tidak valid. Periksa kembali kode dari email Anda." },
        { status: 400 }
      );
    }

    const anonClient = createAnonClient();
    if (!anonClient) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // Supabase consumes the OTP on success (single-use) and rejects expired
    // codes, so reuse and expiry are enforced at the source here.
    const { error: verifyError } = await anonClient.auth.verifyOtp({
      email: user.email,
      token: code,
      type: "email",
    });

    if (verifyError) {
      const failure = recordOtpFailure(user.id);
      return NextResponse.json(
        {
          error: failure.locked
            ? "Terlalu banyak percobaan gagal. Akun terkunci sementara. Coba lagi nanti."
            : "Kode tidak valid atau sudah kedaluwarsa. Minta kode baru jika perlu.",
        },
        {
          status: failure.locked ? 429 : 400,
          ...(failure.locked
            ? { headers: { "Retry-After": String(failure.retryAfterSeconds) } }
            : {}),
        }
      );
    }

    // OTP confirmed -> clear the failure counter and mark this session as
    // having completed the second factor (the server-side enforcement marker).
    resetOtpAttempts(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<{ role: string | null }>();

    const response = NextResponse.json({
      success: true,
      redirectTo: getRedirect(profile?.role),
    });
    await setMfaVerifiedCookie(response, user.id);
    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
