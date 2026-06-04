import { NextRequest, NextResponse } from "next/server";
import { authorizeUserClient, jsonError } from "@/src/lib/auth-client";

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
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

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authorizeUserClient(request);
    if ("error" in auth) {
      return auth.error;
    }

    const body = await parseBody(request);
    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const password = asText(body.password);
    const confirmPassword = asText(body.confirmPassword);

    if (!password) {
      return jsonError("Password tidak boleh kosong", 400, "password");
    }

    if (password.length < 8) {
      return jsonError("Password minimal 8 karakter", 400, "password");
    }

    if (password !== confirmPassword) {
      return jsonError("Password tidak cocok", 400, "confirmPassword");
    }

    const { error } = await auth.supabase.auth.updateUser({ password });

    if (error) {
      return jsonError(error.message, 400);
    }

    return NextResponse.json({ message: "Password berhasil diperbarui." });
  } catch (error) {
    console.error("Update password route error:", error);
    return jsonError("Internal server error", 500);
  }
}
