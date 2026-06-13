import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authorizeUserClient, jsonError } from "@/src/lib/auth-client";

// TODO: Legacy endpoint. Current S08-S10 report draft state is temporary client-side
// wizard state; keep this route unused until explicit backend draft storage is reintroduced.
const DISASTER_TYPES = ["Banjir", "Gempa", "Longsor", "Kebakaran", "Tsunami", "Lainnya"] as const;
const SEVERITIES = ["Ringan", "Sedang", "Parah", "Kritis"] as const;
const DRAFT_COOKIE = "report_draft";

type DraftPayload = {
  latitude?: number | null;
  longitude?: number | null;
  alamat?: string | null;
  detail?: string | null;
  jenis_bencana?: string | null;
  keparahan?: string | null;
  deskripsi?: string | null;
  kebutuhan?: string[] | null;
  media_paths?: string[] | null;
};

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asNullableText(value: unknown) {
  if (value === null) return null;
  if (value === undefined) return undefined;

  const text = asText(value);
  return text.length > 0 ? text : null;
}

function asNullableNumber(value: unknown) {
  if (value === null) return null;
  if (value === undefined || value === "") return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return Number.NaN;
}

function parseStringArray(value: unknown) {
  if (value === null) return null;
  if (value === undefined || value === "") return undefined;

  if (Array.isArray(value)) {
    return value.map((item) => asText(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map((item) => asText(item)).filter(Boolean) : [];
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
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

function parseDraftPayload(body: Record<string, unknown>) {
  const payload: DraftPayload = {};

  if ("latitude" in body) payload.latitude = asNullableNumber(body.latitude);
  if ("longitude" in body) payload.longitude = asNullableNumber(body.longitude);
  if ("alamat" in body) payload.alamat = asNullableText(body.alamat);
  if ("detail" in body) payload.detail = asNullableText(body.detail);
  if ("jenis_bencana" in body) payload.jenis_bencana = asNullableText(body.jenis_bencana);
  if ("keparahan" in body) payload.keparahan = asNullableText(body.keparahan);
  if ("deskripsi" in body) payload.deskripsi = asNullableText(body.deskripsi);
  if ("kebutuhan" in body) payload.kebutuhan = parseStringArray(body.kebutuhan);
  if ("media_paths" in body) payload.media_paths = parseStringArray(body.media_paths);
  if (!("media_paths" in body) && "media" in body) payload.media_paths = parseStringArray(body.media);

  return payload;
}

function validateDraftPayload(payload: DraftPayload) {
  if (payload.latitude !== undefined && payload.latitude !== null) {
    if (!Number.isFinite(payload.latitude) || payload.latitude < -90 || payload.latitude > 90) {
      return { error: "Latitude tidak valid", field: "latitude" };
    }
  }

  if (payload.longitude !== undefined && payload.longitude !== null) {
    if (!Number.isFinite(payload.longitude) || payload.longitude < -180 || payload.longitude > 180) {
      return { error: "Longitude tidak valid", field: "longitude" };
    }
  }

  if (payload.jenis_bencana && !DISASTER_TYPES.includes(payload.jenis_bencana as (typeof DISASTER_TYPES)[number])) {
    return { error: "Jenis bencana tidak valid", field: "jenis_bencana" };
  }

  if (payload.keparahan && !SEVERITIES.includes(payload.keparahan as (typeof SEVERITIES)[number])) {
    return { error: "Tingkat keparahan tidak valid", field: "keparahan" };
  }

  return null;
}

async function saveDraft(request: NextRequest) {
  const auth = await authorizeUserClient(request);
  if ("error" in auth) {
    return auth.error;
  }

  const body = await parseBody(request);
  if (!body) {
    return jsonError("Request body must be valid JSON", 400);
  }

  const payload = parseDraftPayload(body);
  const update = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );

  if (Object.keys(update).length === 0) {
    return jsonError("Tidak ada field draft untuk disimpan", 400);
  }

  const validationError = validateDraftPayload(payload);
  if (validationError) {
    return jsonError(validationError.error, 400, validationError.field);
  }

  const { data, error } = await auth.supabase
    .from("report_drafts")
    .upsert(
      {
        user_id: auth.user.id,
        ...update,
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();

  if (error) {
    return jsonError(error.message, 500);
  }

  const cookieStore = await cookies();
  cookieStore.delete(DRAFT_COOKIE);

  return NextResponse.json({ success: true, draft: data });
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeUserClient(request);
    if ("error" in auth) {
      return auth.error;
    }

    const { data, error } = await auth.supabase
      .from("report_drafts")
      .select("*")
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ draft: data ?? null });
  } catch (error) {
    console.error("Get report draft error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    return await saveDraft(request);
  } catch (error) {
    console.error("Save report draft error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    return await saveDraft(request);
  } catch (error) {
    console.error("Patch report draft error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authorizeUserClient(request);
    if ("error" in auth) {
      return auth.error;
    }

    const { error } = await auth.supabase
      .from("report_drafts")
      .delete()
      .eq("user_id", auth.user.id);

    if (error) {
      return jsonError(error.message, 500);
    }

    const cookieStore = await cookies();
    cookieStore.delete(DRAFT_COOKIE);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete report draft error:", error);
    return jsonError("Internal server error", 500);
  }
}
