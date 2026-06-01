import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/src/lib/admin-auth";
import { createAdminClient } from "@/src/utils/supabase/admin";
import { createClient } from "@/src/utils/supabase/server";

const MISSION_STATUSES = ["Terbuka", "Penuh", "Selesai"] as const;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

type MissionStatus = (typeof MISSION_STATUSES)[number];
type MissionPayload = {
  judul?: string;
  lokasi?: string;
  latitude?: number | null;
  longitude?: number | null;
  deskripsi?: string;
  persyaratan?: string[];
  jenis?: string;
  koordinator?: string | null;
  tanggal_mulai?: string | null;
  tanggal_selesai?: string | null;
  kuota?: number;
  status?: MissionStatus;
};

type AuthenticatedUser = {
  id: string;
  email?: string | null;
};

type MissionRouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

type AuthResult =
  | { user: AuthenticatedUser; adminClient: SupabaseClient }
  | { error: NextResponse };
type NotificationResult =
  | { sent: number }
  | { error: "Misi tidak ditemukan"; status: 404 };

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalText(value: unknown) {
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

function parseStringArray(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null) return [];

  if (Array.isArray(value)) {
    return value.map((item) => asText(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    if (!value.trim()) return [];

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.map((item) => asText(item)).filter(Boolean)
        : [value.trim()];
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return null;
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isUniqueViolation(error: { code?: string; message?: string }) {
  return error.code === "23505" || /duplicate key/i.test(error.message ?? "");
}

function normalizeMission(row: Record<string, unknown>, registeredMissionIds?: Set<string>) {
  const { misi_relawan, ...mission } = row;
  const countRows = Array.isArray(misi_relawan) ? misi_relawan : [];
  const embeddedCount = countRows.length > 0
    ? Number((countRows[0] as { count?: unknown }).count ?? 0)
    : undefined;
  const registrationCount = Number(
    (row as { registration_count?: unknown }).registration_count ?? embeddedCount ?? 0
  );
  const missionId = typeof mission.id === "string" ? mission.id : "";

  return {
    ...mission,
    registration_count: Number.isFinite(registrationCount) ? registrationCount : 0,
    ...(registeredMissionIds
      ? { registered: registeredMissionIds.has(missionId) }
      : {}),
  };
}

function addRegistrationCounts(
  missions: Record<string, unknown>[],
  registrations: { misi_id: string | null }[] | null
) {
  const counts = new Map<string, number>();

  for (const registration of registrations ?? []) {
    if (registration.misi_id) {
      counts.set(registration.misi_id, (counts.get(registration.misi_id) ?? 0) + 1);
    }
  }

  return missions.map((mission) =>
    normalizeMission({
      ...mission,
      registration_count: counts.get(String(mission.id)) ?? 0,
    })
  );
}

function getBearerToken(request: NextRequest) {
  return request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null;
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

async function authorizeUser(request: NextRequest): Promise<AuthResult> {
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

  return {
    user: { id: user.id, email: user.email },
    adminClient,
  };
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

function parseMissionPayload(body: Record<string, unknown>, partial = false) {
  const payload: MissionPayload = {};

  if (!partial || "judul" in body) payload.judul = asText(body.judul);
  if (!partial || "lokasi" in body) payload.lokasi = asText(body.lokasi);
  if (!partial || "deskripsi" in body) payload.deskripsi = asText(body.deskripsi);
  if (!partial || "jenis" in body) payload.jenis = asText(body.jenis);
  if (!partial || "koordinator" in body) payload.koordinator = asOptionalText(body.koordinator);
  if (!partial || "tanggal_mulai" in body) payload.tanggal_mulai = asOptionalText(body.tanggal_mulai);
  if (!partial || "tanggal_selesai" in body) payload.tanggal_selesai = asOptionalText(body.tanggal_selesai);

  if (!partial || "latitude" in body) payload.latitude = asNumber(body.latitude);
  if (!partial || "longitude" in body) payload.longitude = asNumber(body.longitude);

  if (!partial || "kuota" in body) {
    const quota = asNumber(body.kuota);
    payload.kuota = quota === null ? Number.NaN : quota;
  }

  if (!partial || "status" in body) {
    payload.status = asText(body.status || "Terbuka") as MissionStatus;
  }

  if (!partial || "persyaratan" in body) {
    const requirements = parseStringArray(body.persyaratan);
    if (requirements !== undefined && Array.isArray(requirements)) {
      payload.persyaratan = requirements;
    } else if (requirements === null) {
      payload.persyaratan = undefined;
    }
  }

  return payload;
}

function validateMissionPayload(payload: MissionPayload, partial = false) {
  if (!partial || payload.judul !== undefined) {
    if (!payload.judul) return { error: "Judul wajib diisi", field: "judul" };
  }

  if (!partial || payload.lokasi !== undefined) {
    if (!payload.lokasi) return { error: "Lokasi wajib diisi", field: "lokasi" };
  }

  if (!partial || payload.deskripsi !== undefined) {
    if (!payload.deskripsi) return { error: "Deskripsi wajib diisi", field: "deskripsi" };
  }

  if (!partial || payload.jenis !== undefined) {
    if (!payload.jenis) return { error: "Jenis wajib diisi", field: "jenis" };
  }

  if (!partial || payload.kuota !== undefined) {
    const quota = payload.kuota;

    if (quota === undefined || !Number.isInteger(quota) || quota <= 0) {
      return { error: "Kuota harus berupa bilangan bulat positif", field: "kuota" };
    }
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

  if (payload.status !== undefined && !MISSION_STATUSES.includes(payload.status)) {
    return { error: "Status harus Terbuka, Penuh, atau Selesai", field: "status" };
  }

  if (payload.tanggal_mulai && !isValidDate(payload.tanggal_mulai)) {
    return { error: "Tanggal mulai tidak valid", field: "tanggal_mulai" };
  }

  if (payload.tanggal_selesai && !isValidDate(payload.tanggal_selesai)) {
    return { error: "Tanggal selesai tidak valid", field: "tanggal_selesai" };
  }

  if (
    payload.tanggal_mulai &&
    payload.tanggal_selesai &&
    payload.tanggal_selesai < payload.tanggal_mulai
  ) {
    return {
      error: "Tanggal selesai tidak boleh sebelum tanggal mulai",
      field: "tanggal_selesai",
    };
  }

  return null;
}

function requireValidMissionId(id: unknown): { id: string } | { error: NextResponse } {
  const normalizedId = String(id ?? "").trim();
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!normalizedId || !uuidPattern.test(normalizedId)) {
    return { error: jsonError("Misi id harus berupa UUID yang valid", 400, "misi_id") };
  }

  return { id: normalizedId };
}

export async function sendMissionNotifications(
  adminClient: SupabaseClient,
  misiId: string,
  judul: string
): Promise<NotificationResult> {
  const { data: misi, error: misiError } = await adminClient
    .from("misi")
    .select("id")
    .eq("id", misiId)
    .maybeSingle();

  if (misiError) {
    throw new Error(misiError.message);
  }

  if (!misi) {
    return { error: "Misi tidak ditemukan" as const, status: 404 as const };
  }

  const { data: relawan, error: relawanError } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "relawan");

  if (relawanError) {
    throw new Error(relawanError.message);
  }

  const recipients = relawan ?? [];

  if (recipients.length === 0) {
    return { sent: 0 };
  }

  const { error: notificationError } = await adminClient.from("notifikasi").insert(
    recipients.map((profile) => ({
      user_id: profile.id,
      type: "misi_baru",
      judul: "Misi Baru Tersedia",
      pesan: `Misi "${judul}" telah dibuka. Segera daftarkan diri kamu.`,
      misi_id: misiId,
    }))
  );

  if (notificationError) {
    throw new Error(notificationError.message);
  }

  return { sent: recipients.length };
}

export async function GET_ADMIN_MISSIONS(request: NextRequest) {
  try {
    const { authorizeAdmin } = await import("@/src/lib/admin-auth");
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const { data: missions, error: missionError } = await auth.adminClient
      .from("misi")
      .select("*")
      .order("created_at", { ascending: false });

    if (missionError) {
      return jsonError(missionError.message, 500);
    }

    const { data: registrations, error: registrationError } = await auth.adminClient
      .from("misi_relawan")
      .select("misi_id");

    if (registrationError) {
      return jsonError(registrationError.message, 500);
    }

    return NextResponse.json({
      missions: addRegistrationCounts((missions ?? []) as Record<string, unknown>[], registrations),
    });
  } catch (error) {
    console.error("List admin missions error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function POST_ADMIN_MISSION(request: NextRequest) {
  try {
    const { authorizeAdmin } = await import("@/src/lib/admin-auth");
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const body = await parseBody(request);

    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const payload = parseMissionPayload(body);
    const validationError = validateMissionPayload(payload);

    if (validationError) {
      return jsonError(validationError.error, 400, validationError.field);
    }

    const { data: mission, error: insertError } = await auth.adminClient
      .from("misi")
      .insert({
        ...payload,
        status: payload.status ?? "Terbuka",
      })
      .select("*")
      .single();

    if (insertError) {
      return jsonError(insertError.message, 500);
    }

    const notificationResult = await sendMissionNotifications(
      auth.adminClient,
      mission.id,
      mission.judul
    );

    if ("error" in notificationResult) {
      return jsonError(notificationResult.error, notificationResult.status);
    }

    return NextResponse.json(
      {
        mission: normalizeMission({ ...mission, registration_count: 0 }),
        notifications_sent: notificationResult.sent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin mission error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function GET_ADMIN_MISSION_DETAIL(
  request: NextRequest,
  context: MissionRouteContext
) {
  try {
    const { authorizeAdmin } = await import("@/src/lib/admin-auth");
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const { id: routeId } = await context.params;
    const idResult = requireValidMissionId(routeId);
    if ("error" in idResult) return idResult.error;
    const { id } = idResult;

    const { data: mission, error: missionError } = await auth.adminClient
      .from("misi")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (missionError) {
      return jsonError(missionError.message, 500);
    }

    if (!mission) {
      return jsonError("Misi tidak ditemukan", 404);
    }

    const { data: registrations, error: registrationError } = await auth.adminClient
      .from("misi_relawan")
      .select("id, misi_id, user_id, created_at, profiles(id, nama, nim, no_hp, role)")
      .eq("misi_id", id)
      .order("created_at", { ascending: false });

    if (registrationError) {
      const { data: basicRegistrations, error: basicError } = await auth.adminClient
        .from("misi_relawan")
        .select("id, misi_id, user_id, created_at")
        .eq("misi_id", id)
        .order("created_at", { ascending: false });

      if (basicError) {
        return jsonError(basicError.message, 500);
      }

      return NextResponse.json({
        mission: normalizeMission({
          ...(mission as Record<string, unknown>),
          registration_count: basicRegistrations?.length ?? 0,
        }),
        volunteers: basicRegistrations ?? [],
      });
    }

    return NextResponse.json({
      mission: normalizeMission({
        ...(mission as Record<string, unknown>),
        registration_count: registrations?.length ?? 0,
      }),
      volunteers: registrations ?? [],
    });
  } catch (error) {
    console.error("Get admin mission detail error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH_ADMIN_MISSION(
  request: NextRequest,
  context: MissionRouteContext
) {
  try {
    const { authorizeAdmin } = await import("@/src/lib/admin-auth");
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const params = await context.params;
    const { id: routeId } = params;
    console.log("PATCH mission params:", params);
    console.log("PATCH mission raw id:", routeId);
    const idResult = requireValidMissionId(routeId);
    if ("error" in idResult) {
      const normalizedId = String(routeId ?? "").trim();
      console.log("PATCH mission 400 invalid route id:", {
        routeId,
        normalizedId,
        matchesUuid: UUID_PATTERN.test(normalizedId),
      });
      return idResult.error;
    }
    const { id } = idResult;
    console.log("PATCH mission id:", id);

    const body = await parseBody(request);

    if (!body) {
      console.log("PATCH mission 400 invalid JSON body");
      return jsonError("Request body must be valid JSON", 400);
    }

    const payload = parseMissionPayload(body, true);
    const update = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(update).length === 0) {
      console.log("PATCH mission 400 no update fields:", body);
      return jsonError("Tidak ada field misi untuk diperbarui", 400);
    }

    const validationError = validateMissionPayload(payload, true);

    if (validationError) {
      console.log("PATCH mission 400 payload validation:", validationError);
      return jsonError(validationError.error, 400, validationError.field);
    }

    const { data: mission, error: updateError } = await auth.adminClient
      .from("misi")
      .update(update)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (updateError) {
      return jsonError(updateError.message, 500);
    }

    if (!mission) {
      return jsonError("Misi tidak ditemukan", 404);
    }

    const { count, error: countError } = await auth.adminClient
      .from("misi_relawan")
      .select("id", { count: "exact", head: true })
      .eq("misi_id", id);

    if (countError) {
      return jsonError(countError.message, 500);
    }

    return NextResponse.json({
      mission: normalizeMission({
        ...(mission as Record<string, unknown>),
        registration_count: count ?? 0,
      }),
    });
  } catch (error) {
    console.error("Update admin mission error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE_ADMIN_MISSION(
  request: NextRequest,
  context: MissionRouteContext
) {
  try {
    const { authorizeAdmin } = await import("@/src/lib/admin-auth");
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const { id: routeId } = await context.params;
    const idResult = requireValidMissionId(routeId);
    if ("error" in idResult) return idResult.error;
    const { id } = idResult;

    const { data: mission, error: findError } = await auth.adminClient
      .from("misi")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      return jsonError(findError.message, 500);
    }

    if (!mission) {
      return jsonError("Misi tidak ditemukan", 404);
    }

    const { error: notificationDeleteError } = await auth.adminClient
      .from("notifikasi")
      .delete()
      .eq("misi_id", id);

    if (notificationDeleteError) {
      return jsonError(notificationDeleteError.message, 500);
    }

    const { error: registrationDeleteError } = await auth.adminClient
      .from("misi_relawan")
      .delete()
      .eq("misi_id", id);

    if (registrationDeleteError) {
      return jsonError(registrationDeleteError.message, 500);
    }

    const { error: missionDeleteError } = await auth.adminClient
      .from("misi")
      .delete()
      .eq("id", id);

    if (missionDeleteError) {
      return jsonError(missionDeleteError.message, 500);
    }

    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    console.error("Delete admin mission error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function GET_MISSIONS(request: NextRequest) {
  try {
    const auth = await authorizeUser(request);
    if ("error" in auth) {
      return auth.error;
    }

    const { data: missions, error: missionError } = await auth.adminClient
      .from("misi")
      .select("*")
      .order("created_at", { ascending: false });

    if (missionError) {
      return jsonError(missionError.message, 500);
    }

    const { data: registrations, error: registrationError } = await auth.adminClient
      .from("misi_relawan")
      .select("misi_id");

    if (registrationError) {
      return jsonError(registrationError.message, 500);
    }

    const { data: ownRegistrations, error: ownRegistrationError } = await auth.adminClient
      .from("misi_relawan")
      .select("misi_id")
      .eq("user_id", auth.user.id);

    if (ownRegistrationError) {
      return jsonError(ownRegistrationError.message, 500);
    }

    const registeredMissionIds = new Set(
      (ownRegistrations ?? [])
        .map((registration) => registration.misi_id)
        .filter((id): id is string => Boolean(id))
    );
    const missionsWithCounts = addRegistrationCounts(
      (missions ?? []) as Record<string, unknown>[],
      registrations
    ).map((mission) => normalizeMission(mission, registeredMissionIds));

    return NextResponse.json({ missions: missionsWithCounts });
  } catch (error) {
    console.error("List missions error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function GET_MISSION_DETAIL(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeUser(request);
    if ("error" in auth) {
      return auth.error;
    }

    const { id: routeId } = await context.params;
    const idResult = requireValidMissionId(routeId);
    if ("error" in idResult) return idResult.error;
    const { id } = idResult;

    const { data: mission, error: missionError } = await auth.adminClient
      .from("misi")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (missionError) {
      return jsonError(missionError.message, 500);
    }

    if (!mission) {
      return jsonError("Misi tidak ditemukan", 404);
    }

    const { count, error: countError } = await auth.adminClient
      .from("misi_relawan")
      .select("id", { count: "exact", head: true })
      .eq("misi_id", id);

    if (countError) {
      return jsonError(countError.message, 500);
    }

    const { data: registration, error: registrationError } = await auth.adminClient
      .from("misi_relawan")
      .select("id")
      .eq("misi_id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (registrationError) {
      return jsonError(registrationError.message, 500);
    }

    return NextResponse.json({
      mission: {
        ...normalizeMission({
          ...(mission as Record<string, unknown>),
          registration_count: count ?? 0,
        }),
        registered: Boolean(registration),
      },
    });
  } catch (error) {
    console.error("Get mission detail error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function POST_MISSION_REGISTRATION(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeUser(request);
    if ("error" in auth) {
      return auth.error;
    }

    const { id: routeId } = await context.params;
    const idResult = requireValidMissionId(routeId);
    if ("error" in idResult) return idResult.error;
    const { id } = idResult;

    const { data: mission, error: missionError } = await auth.adminClient
      .from("misi")
      .select("id, status, kuota")
      .eq("id", id)
      .maybeSingle();

    if (missionError) {
      return jsonError(missionError.message, 500);
    }

    if (!mission) {
      return jsonError("Misi tidak ditemukan", 404);
    }

    if (mission.status !== "Terbuka") {
      return jsonError("Misi tidak terbuka untuk pendaftaran", 409, "status");
    }

    const quota = Number(mission.kuota);

    if (!Number.isInteger(quota) || quota <= 0) {
      return jsonError("Kuota misi tidak valid", 409, "kuota");
    }

    const { data: existingRegistration, error: existingError } = await auth.adminClient
      .from("misi_relawan")
      .select("id")
      .eq("misi_id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (existingError) {
      return jsonError(existingError.message, 500);
    }

    if (existingRegistration) {
      return jsonError("Kamu sudah terdaftar pada misi ini", 409);
    }

    const { count: countBefore, error: countBeforeError } = await auth.adminClient
      .from("misi_relawan")
      .select("id", { count: "exact", head: true })
      .eq("misi_id", id);

    if (countBeforeError) {
      return jsonError(countBeforeError.message, 500);
    }

    if ((countBefore ?? 0) >= quota) {
      await auth.adminClient.from("misi").update({ status: "Penuh" }).eq("id", id);
      return jsonError("Kuota misi sudah penuh", 409, "kuota");
    }

    const { data: registration, error: insertError } = await auth.adminClient
      .from("misi_relawan")
      .insert({
        misi_id: id,
        user_id: auth.user.id,
      })
      .select("id, misi_id, user_id, created_at")
      .single();

    if (insertError) {
      if (isUniqueViolation(insertError)) {
        return jsonError("Kamu sudah terdaftar pada misi ini", 409);
      }

      return jsonError(insertError.message, 500);
    }

    const { count: countAfter, error: countAfterError } = await auth.adminClient
      .from("misi_relawan")
      .select("id", { count: "exact", head: true })
      .eq("misi_id", id);

    if (countAfterError) {
      return jsonError(countAfterError.message, 500);
    }

    const registrationCount = countAfter ?? (countBefore ?? 0) + 1;
    const missionStatus = registrationCount >= quota ? "Penuh" : "Terbuka";

    if (missionStatus === "Penuh") {
      const { error: statusError } = await auth.adminClient
        .from("misi")
        .update({ status: "Penuh" })
        .eq("id", id);

      if (statusError) {
        return jsonError(statusError.message, 500);
      }
    }

    return NextResponse.json(
      {
        registration,
        registration_count: registrationCount,
        mission_status: missionStatus,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register mission error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE_MISSION_REGISTRATION(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeUser(request);
    if ("error" in auth) {
      return auth.error;
    }

    const { id: routeId } = await context.params;
    const idResult = requireValidMissionId(routeId);
    if ("error" in idResult) return idResult.error;
    const { id } = idResult;

    const { data: mission, error: missionError } = await auth.adminClient
      .from("misi")
      .select("id, status, kuota")
      .eq("id", id)
      .maybeSingle();

    if (missionError) {
      return jsonError(missionError.message, 500);
    }

    if (!mission) {
      return jsonError("Misi tidak ditemukan", 404);
    }

    const { data: registration, error: registrationError } = await auth.adminClient
      .from("misi_relawan")
      .select("id")
      .eq("misi_id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (registrationError) {
      return jsonError(registrationError.message, 500);
    }

    if (!registration) {
      return jsonError("Pendaftaran misi tidak ditemukan", 404);
    }

    const { error: deleteError } = await auth.adminClient
      .from("misi_relawan")
      .delete()
      .eq("misi_id", id)
      .eq("user_id", auth.user.id);

    if (deleteError) {
      return jsonError(deleteError.message, 500);
    }

    const { count, error: countError } = await auth.adminClient
      .from("misi_relawan")
      .select("id", { count: "exact", head: true })
      .eq("misi_id", id);

    if (countError) {
      return jsonError(countError.message, 500);
    }

    const quota = Number(mission.kuota);
    let missionStatus = mission.status as MissionStatus;

    if (mission.status === "Penuh" && Number.isInteger(quota) && quota > 0 && (count ?? 0) < quota) {
      const { error: statusError } = await auth.adminClient
        .from("misi")
        .update({ status: "Terbuka" })
        .eq("id", id);

      if (statusError) {
        return jsonError(statusError.message, 500);
      }

      missionStatus = "Terbuka";
    }

    return NextResponse.json({
      cancelled: true,
      registration_count: count ?? 0,
      mission_status: missionStatus,
    });
  } catch (error) {
    console.error("Cancel mission registration error:", error);
    return jsonError("Internal server error", 500);
  }
}
