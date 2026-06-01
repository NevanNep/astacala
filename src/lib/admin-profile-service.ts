import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin, jsonError } from "@/src/lib/admin-auth";

const PROFILE_ROLES = ["relawan", "admin"] as const;

type ProfileRole = (typeof PROFILE_ROLES)[number];
type ProfileRouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

function asNullableText(value: unknown) {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (typeof value !== "string") return undefined;

  const text = value.trim();
  return text.length > 0 ? text : null;
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

async function getRouteId(context: ProfileRouteContext) {
  const params = await context.params;
  return String(params.id ?? "").trim();
}

export async function GET_ADMIN_DASHBOARD_STATS(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const [
      totalLaporan,
      laporanPending,
      laporanDiterima,
      laporanDitolak,
      totalMisi,
      misiTerbuka,
      misiSelesai,
      totalRelawan,
      totalBerita,
      unreadNotifications,
    ] = await Promise.all([
      auth.adminClient.from("laporan").select("id", { count: "exact", head: true }),
      auth.adminClient
        .from("laporan")
        .select("id", { count: "exact", head: true })
        .eq("status", "Pending"),
      auth.adminClient
        .from("laporan")
        .select("id", { count: "exact", head: true })
        .eq("status", "Diterima"),
      auth.adminClient
        .from("laporan")
        .select("id", { count: "exact", head: true })
        .eq("status", "Ditolak"),
      auth.adminClient.from("misi").select("id", { count: "exact", head: true }),
      auth.adminClient
        .from("misi")
        .select("id", { count: "exact", head: true })
        .eq("status", "Terbuka"),
      auth.adminClient
        .from("misi")
        .select("id", { count: "exact", head: true })
        .eq("status", "Selesai"),
      auth.adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "relawan"),
      auth.adminClient.from("berita").select("id", { count: "exact", head: true }),
      auth.adminClient
        .from("notifikasi")
        .select("id", { count: "exact", head: true })
        .eq("dibaca", false),
    ]);

    const results = [
      totalLaporan,
      laporanPending,
      laporanDiterima,
      laporanDitolak,
      totalMisi,
      misiTerbuka,
      misiSelesai,
      totalRelawan,
      totalBerita,
      unreadNotifications,
    ];
    const error = results.find((result) => result.error)?.error;
    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({
      stats: {
        total_laporan: totalLaporan.count ?? 0,
        laporan_pending: laporanPending.count ?? 0,
        laporan_diterima: laporanDiterima.count ?? 0,
        laporan_ditolak: laporanDitolak.count ?? 0,
        total_misi: totalMisi.count ?? 0,
        misi_terbuka: misiTerbuka.count ?? 0,
        misi_selesai: misiSelesai.count ?? 0,
        total_relawan: totalRelawan.count ?? 0,
        total_berita: totalBerita.count ?? 0,
        unread_notifications: unreadNotifications.count ?? 0,
      },
    });
  } catch (error) {
    console.error("Get admin dashboard stats error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function GET_ADMIN_PROFILES(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    let query = auth.adminClient
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const role = request.nextUrl.searchParams.get("role");
    if (role) {
      if (!PROFILE_ROLES.includes(role as ProfileRole)) {
        return jsonError("Role tidak valid", 400, "role");
      }

      query = query.eq("role", role);
    }

    const search = cleanSearch(
      request.nextUrl.searchParams.get("q") ?? request.nextUrl.searchParams.get("search") ?? ""
    );
    if (search) {
      query = query.or(`nama.ilike.%${search}%,nim.ilike.%${search}%,no_hp.ilike.%${search}%`);
    }

    const limit = parseLimit(request);
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ profiles: data ?? [] });
  } catch (error) {
    console.error("List admin profiles error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function GET_ADMIN_PROFILE_DETAIL(
  request: NextRequest,
  context: ProfileRouteContext
) {
  try {
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const id = await getRouteId(context);
    if (!id) {
      return jsonError("Profile id wajib diisi", 400, "id");
    }

    const { data: profile, error: profileError } = await auth.adminClient
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (profileError) {
      return jsonError(profileError.message, 500);
    }

    if (!profile) {
      return jsonError("Profil tidak ditemukan", 404);
    }

    const [totalLaporan, totalMisiTerdaftar] = await Promise.all([
      auth.adminClient.from("laporan").select("id", { count: "exact", head: true }).eq("user_id", id),
      auth.adminClient
        .from("misi_relawan")
        .select("id", { count: "exact", head: true })
        .eq("user_id", id),
    ]);

    const countError = totalLaporan.error ?? totalMisiTerdaftar.error;
    if (countError) {
      return jsonError(countError.message, 500);
    }

    return NextResponse.json({
      profile: {
        ...profile,
        total_laporan: totalLaporan.count ?? 0,
        total_misi_terdaftar: totalMisiTerdaftar.count ?? 0,
      },
    });
  } catch (error) {
    console.error("Get admin profile detail error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH_ADMIN_PROFILE(
  request: NextRequest,
  context: ProfileRouteContext
) {
  try {
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const id = await getRouteId(context);
    if (!id) {
      return jsonError("Profile id wajib diisi", 400, "id");
    }

    const body = await parseBody(request);
    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const update: Record<string, string | null> = {};

    for (const field of ["nama", "nim", "no_hp"] as const) {
      if (field in body) {
        const value = asNullableText(body[field]);
        if (value === undefined) {
          return jsonError(`${field} harus berupa teks`, 400, field);
        }
        update[field] = value;
      }
    }

    if ("role" in body) {
      const role = asText(body.role);
      if (!PROFILE_ROLES.includes(role as ProfileRole)) {
        return jsonError("Role tidak valid", 400, "role");
      }
      update.role = role;
    }

    if (Object.keys(update).length === 0) {
      return jsonError("Tidak ada field profil untuk diperbarui", 400);
    }

    const { data: profile, error } = await auth.adminClient
      .from("profiles")
      .update(update)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return jsonError(error.message, 500);
    }

    if (!profile) {
      return jsonError("Profil tidak ditemukan", 404);
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Update admin profile error:", error);
    return jsonError("Internal server error", 500);
  }
}
