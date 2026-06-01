import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin, jsonError } from "@/src/lib/admin-auth";
import { sendMissionNotifications } from "@/src/lib/misi-service";

type RequestBody = {
  misi_id?: unknown;
  judul?: unknown;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function parseBody(request: NextRequest): Promise<RequestBody | null> {
  try {
    return (await request.json()) as RequestBody;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const body = await parseBody(request);

    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const misiId = asText(body.misi_id);
    const judul = asText(body.judul);

    if (!misiId) {
      return jsonError("Misi id wajib diisi", 400, "misi_id");
    }

    if (!UUID_PATTERN.test(misiId)) {
      return jsonError("Misi id harus berupa UUID yang valid", 400, "misi_id");
    }

    if (!judul) {
      return jsonError("Judul wajib diisi", 400, "judul");
    }

    const notificationResult = await sendMissionNotifications(auth.adminClient, misiId, judul);

    if ("error" in notificationResult) {
      return jsonError(notificationResult.error, notificationResult.status);
    }

    return NextResponse.json({ sent: notificationResult.sent });
  } catch (error) {
    console.error("Notify mission error:", error);
    return jsonError("Internal server error", 500);
  }
}
