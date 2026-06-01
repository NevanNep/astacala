import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/src/utils/supabase/admin";
import { createClient } from "@/src/utils/supabase/server";

type Profile = {
  role: string | null;
};

type AuthenticatedUser = {
  id: string;
  email?: string | null;
};

type AuthResult =
  | { user: AuthenticatedUser; adminClient: SupabaseClient }
  | { error: NextResponse };

export function jsonError(error: string, status: number, field?: string) {
  return NextResponse.json({ error, ...(field ? { field } : {}) }, { status });
}

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  return authHeader?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null;
}

function createBearerClient(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export async function authorizeAdmin(request: NextRequest) {
  const auth = await authorizeUser(request);
  if ("error" in auth) {
    return auth;
  }

  const bearerToken = getBearerToken(request);
  const cookieStore = await cookies();
  const authClient = bearerToken ? createBearerClient(bearerToken) : createClient(cookieStore);

  if (!authClient) {
    return { error: jsonError("Supabase client is not configured", 500) };
  }

  const { data: profile, error: profileError } = await authClient
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle<Profile>();

  if (profileError) {
    return { error: jsonError("Failed to load profile", 500) };
  }

  if (profile?.role !== "admin") {
    return { error: jsonError("Forbidden", 403) };
  }

  return auth;
}

export async function authorizeUser(request: NextRequest): Promise<AuthResult> {
  const cookieStore = await cookies();
  const cookieClient = createClient(cookieStore);
  const bearerToken = getBearerToken(request);
  const authClient = bearerToken ? createBearerClient(bearerToken) : cookieClient;

  if (!authClient) {
    return { error: jsonError("Supabase client is not configured", 500) };
  }

  const {
    data: { user },
    error: userError,
  } = bearerToken ? await authClient.auth.getUser(bearerToken) : await authClient.auth.getUser();

  if (userError || !user) {
    return { error: jsonError("Unauthorized", 401) };
  }

  const adminClient = createAdminClient();

  if (!adminClient) {
    return { error: jsonError("Supabase admin client is not configured", 500) };
  }

  return { user, adminClient };
}
