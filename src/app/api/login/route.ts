import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/src/utils/supabase/server";

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

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
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

    return NextResponse.json({
      user: data.user,
      session: data.session,
      role,
      redirectTo: getPostLoginRoute(role),
    });
  } catch (error: unknown) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
