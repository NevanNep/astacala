import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/src/utils/supabase/server";

export async function GET() {
  try {
    const supabase = createClient(await cookies());

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enabled = user.app_metadata?.email_2fa_enabled === true;

    return NextResponse.json({ enabled, email: user.email ?? null });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
