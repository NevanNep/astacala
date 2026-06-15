import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/src/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST() {
  try {
    const supabase = createClient(await cookies());

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const anonClient = createAnonClient();
    if (!anonClient) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const { error: otpError } = await anonClient.auth.signInWithOtp({
      email: user.email,
      options: { shouldCreateUser: false },
    });

    if (otpError) {
      console.error("[2fa/send] signInWithOtp error:", otpError);
      const msg = otpError.message ?? "";
      const isRateLimit =
        msg.toLowerCase().includes("rate") || otpError.status === 429;
      return NextResponse.json(
        {
          error: isRateLimit
            ? "Terlalu banyak permintaan. Tunggu beberapa saat sebelum meminta kode baru."
            : `Gagal mengirim kode: ${msg}`,
        },
        { status: isRateLimit ? 429 : 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
