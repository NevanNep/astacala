import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/src/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { clearMfaVerifiedCookie } from "@/src/lib/mfa";

type LoginBody = {
  email: string;
  password: string;
};

type Profile = {
  role: string | null;
};

type PostLoginRoute = "/admin/dashboard" | "/dashboard";

const ADMIN_ROLES = new Set(["admin"]);

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function parseLoginBody(request: NextRequest): Promise<LoginBody | null> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return null;
    }

    const values = body as Record<string, unknown>;
    return {
      email: asText(values.email).toLowerCase(),
      password: asText(values.password),
    };
  } catch {
    return null;
  }
}

function getPostLoginRoute(role: string | null | undefined): PostLoginRoute {
  return role && ADMIN_ROLES.has(role) ? "/admin/dashboard" : "/dashboard";
}

function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseLoginBody(request);
    const email = body?.email ?? "";
    const password = body?.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const supabase = createClient(await cookies());

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle<Profile>();

    if (profileError) {
      return NextResponse.json(
        { error: "Gagal memuat profil pengguna" },
        { status: 500 }
      );
    }

    const role = profile?.role ?? null;

    // Check if email-based 2FA is enabled for this account
    const emailTwoFAEnabled = data.user.app_metadata?.email_2fa_enabled === true;

    if (emailTwoFAEnabled) {
      // Send OTP to the user's email using an unauthenticated client
      // to avoid session conflicts from the password auth above.
      const anonClient = createAnonClient();
      if (!anonClient) {
        return NextResponse.json(
          { error: "Server misconfiguration" },
          { status: 500 }
        );
      }

      const { error: otpError } = await anonClient.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });

      if (otpError) {
        return NextResponse.json(
          { error: "Gagal mengirim kode verifikasi ke email. Coba lagi." },
          { status: 500 }
        );
      }

      // A Supabase session already exists from the password step, but the
      // second factor is not complete. Invalidate any previous MFA marker so
      // protected routes stay blocked until this login's OTP is verified.
      const mfaPending = NextResponse.json({ mfaRequired: true });
      clearMfaVerifiedCookie(mfaPending);
      return mfaPending;
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
      role,
      redirectTo: getPostLoginRoute(role),
    });
  } catch (err: unknown) {
    console.error("Login route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
