import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin, jsonError } from "@/src/lib/admin-auth";

const NEWS_CATEGORIES = ["Banjir", "Gempa", "Longsor", "Kebakaran", "Lainnya"] as const;

type NewsCategory = (typeof NEWS_CATEGORIES)[number];
type NewsRouteContext = {
  params: Promise<{ id: string }> | { id: string };
};
type NewsPayload = {
  judul?: string;
  konten?: string;
  kategori?: NewsCategory;
  lokasi?: string;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
  terverifikasi?: boolean;
};

function createPublicClient() {
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
  });
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asNullableText(value: unknown) {
  if (value === null) return null;
  if (value === undefined) return undefined;

  const text = asText(value);
  return text.length > 0 ? text : null;
}

function asNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return Number.NaN;
}

function asBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }

  return undefined;
}

function parseLimit(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("limit");
  if (!value) return undefined;

  const limit = Number(value);
  if (!Number.isInteger(limit) || limit <= 0) return undefined;

  return Math.min(limit, 100);
}

function cleanSearch(value: string) {
  return value.replace(/[%_,]/g, " ").trim();
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

function parseNewsPayload(body: Record<string, unknown>, partial = false) {
  const payload: NewsPayload = {};

  if (!partial || "judul" in body) payload.judul = asText(body.judul);
  if (!partial || "konten" in body) payload.konten = asText(body.konten);
  if (!partial || "kategori" in body) payload.kategori = asText(body.kategori) as NewsCategory;
  if (!partial || "lokasi" in body) payload.lokasi = asText(body.lokasi);
  if (!partial || "latitude" in body) payload.latitude = asNumber(body.latitude);
  if (!partial || "longitude" in body) payload.longitude = asNumber(body.longitude);
  if (!partial || "image_url" in body) payload.image_url = asNullableText(body.image_url);
  if (!partial || "terverifikasi" in body) payload.terverifikasi = asBoolean(body.terverifikasi);

  return payload;
}

function validateNewsPayload(payload: NewsPayload, partial = false) {
  if (!partial || payload.judul !== undefined) {
    if (!payload.judul) return { error: "Judul wajib diisi", field: "judul" };
  }

  if (!partial || payload.konten !== undefined) {
    if (!payload.konten) return { error: "Konten wajib diisi", field: "konten" };
  }

  if (!partial || payload.kategori !== undefined) {
    if (!NEWS_CATEGORIES.includes(payload.kategori as NewsCategory)) {
      return { error: "Kategori tidak valid", field: "kategori" };
    }
  }

  if (!partial || payload.lokasi !== undefined) {
    if (!payload.lokasi) return { error: "Lokasi wajib diisi", field: "lokasi" };
  }

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

  if ("terverifikasi" in payload && payload.terverifikasi === undefined) {
    return { error: "Terverifikasi harus boolean", field: "terverifikasi" };
  }

  return null;
}

async function getRouteId(context: NewsRouteContext) {
  const params = await context.params;
  return String(params.id ?? "").trim();
}

export async function GET_NEWS(request: NextRequest) {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return jsonError("Supabase client is not configured", 500);
    }

    let query = supabase
      .from("berita")
      .select("*")
      .order("created_at", { ascending: false });

    const kategori = request.nextUrl.searchParams.get("kategori");
    if (kategori) {
      query = query.eq("kategori", kategori);
    }

    const search = cleanSearch(
      request.nextUrl.searchParams.get("q") ?? request.nextUrl.searchParams.get("search") ?? ""
    );
    if (search) {
      query = query.or(`judul.ilike.%${search}%,konten.ilike.%${search}%,lokasi.ilike.%${search}%`);
    }

    const limit = parseLimit(request);
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ berita: data ?? [] });
  } catch (error) {
    console.error("List news error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function GET_NEWS_DETAIL(
  _request: NextRequest,
  context: NewsRouteContext
) {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return jsonError("Supabase client is not configured", 500);
    }

    const id = await getRouteId(context);
    if (!id) {
      return jsonError("Berita id wajib diisi", 400, "id");
    }

    const { data, error } = await supabase
      .from("berita")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return jsonError(error.message, 500);
    }

    if (!data) {
      return jsonError("Berita tidak ditemukan", 404);
    }

    return NextResponse.json({ berita: data });
  } catch (error) {
    console.error("Get news detail error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function POST_ADMIN_NEWS(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const body = await parseBody(request);
    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const payload = parseNewsPayload(body);
    const validationError = validateNewsPayload(payload);
    if (validationError) {
      return jsonError(validationError.error, 400, validationError.field);
    }

    const { data, error } = await auth.adminClient
      .from("berita")
      .insert({
        ...payload,
        created_by: auth.user.id,
      })
      .select("*")
      .single();

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ berita: data }, { status: 201 });
  } catch (error) {
    console.error("Create admin news error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH_ADMIN_NEWS(
  request: NextRequest,
  context: NewsRouteContext
) {
  try {
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const id = await getRouteId(context);
    if (!id) {
      return jsonError("Berita id wajib diisi", 400, "id");
    }

    const body = await parseBody(request);
    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const payload = parseNewsPayload(body, true);
    const update = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(update).length === 0) {
      return jsonError("Tidak ada field berita untuk diperbarui", 400);
    }

    const validationError = validateNewsPayload(payload, true);
    if (validationError) {
      return jsonError(validationError.error, 400, validationError.field);
    }

    const { data, error } = await auth.adminClient
      .from("berita")
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return jsonError(error.message, 500);
    }

    if (!data) {
      return jsonError("Berita tidak ditemukan", 404);
    }

    return NextResponse.json({ berita: data });
  } catch (error) {
    console.error("Update admin news error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE_ADMIN_NEWS(
  request: NextRequest,
  context: NewsRouteContext
) {
  try {
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const id = await getRouteId(context);
    if (!id) {
      return jsonError("Berita id wajib diisi", 400, "id");
    }

    const { data, error } = await auth.adminClient
      .from("berita")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      return jsonError(error.message, 500);
    }

    if (!data) {
      return jsonError("Berita tidak ditemukan", 404);
    }

    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    console.error("Delete admin news error:", error);
    return jsonError("Internal server error", 500);
  }
}
