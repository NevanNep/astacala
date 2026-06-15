import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/src/utils/supabase/server";
import { createAdminClient } from "@/src/utils/supabase/admin";

export async function POST() {
  try {
    const supabase = createClient(await cookies());

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, email_2fa_enabled: true },
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
