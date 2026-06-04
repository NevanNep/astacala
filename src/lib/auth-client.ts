import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/utils/supabase/server";

type AuthenticatedUser = {
  id: string;
  email?: string | null;
};

type UserAuthResult =
  | { user: AuthenticatedUser; supabase: SupabaseClient }
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

export async function authorizeUserClient(request: NextRequest): Promise<UserAuthResult> {
  const cookieStore = await cookies();
  const cookieClient = createClient(cookieStore);
  const bearerToken = getBearerToken(request);
  const supabase = bearerToken ? createBearerClient(bearerToken) : cookieClient;

  if (!supabase) {
    return { error: jsonError("Supabase client is not configured", 500) };
  }

  const {
    data: { user },
    error,
  } = bearerToken ? await supabase.auth.getUser(bearerToken) : await supabase.auth.getUser();

  if (error || !user) {
    return { error: jsonError("Unauthorized", 401) };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    supabase,
  };
}
