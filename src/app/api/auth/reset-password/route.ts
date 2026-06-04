import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/src/utils/supabase/server";

const RESET_MESSAGE = "Jika email terdaftar, link reset password telah dikirim.";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function parseBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (!body) {
      return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }

    const email = asText(body.email).toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email tidak boleh kosong", field: "email" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid", field: "email" },
        { status: 400 }
      );
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin).replace(/\/$/, "");
    const supabase = createClient(await cookies());
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (error) {
      console.error("Reset password email error:", error);
    }

    return NextResponse.json({ message: RESET_MESSAGE });
  } catch (error) {
    console.error("Reset password route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
