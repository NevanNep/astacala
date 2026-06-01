import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin, jsonError } from "@/src/lib/admin-auth";

type ReportRouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

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

async function getRouteId(context: ReportRouteContext) {
  const params = await context.params;
  return String(params.id ?? "").trim();
}

export async function GET_ADMIN_REPORTS(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    let query = auth.adminClient
      .from("laporan")
      .select("*, laporan_media(*), profiles(nama, nim, no_hp)")
      .order("created_at", { ascending: false });

    const status = request.nextUrl.searchParams.get("status");
    if (status) {
      query = query.eq("status", status);
    }

    const disasterType = request.nextUrl.searchParams.get("jenis_bencana");
    if (disasterType) {
      query = query.eq("jenis_bencana", disasterType);
    }

    const search = cleanSearch(
      request.nextUrl.searchParams.get("q") ?? request.nextUrl.searchParams.get("search") ?? ""
    );
    if (search) {
      query = query.or(
        `id.ilike.%${search}%,judul.ilike.%${search}%,alamat.ilike.%${search}%,deskripsi.ilike.%${search}%`
      );
    }

    const limit = parseLimit(request);
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (!error) {
      return NextResponse.json({ reports: data ?? [] });
    }

    let fallbackQuery = auth.adminClient
      .from("laporan")
      .select("*, laporan_media(*)")
      .order("created_at", { ascending: false });

    if (status) {
      fallbackQuery = fallbackQuery.eq("status", status);
    }

    if (disasterType) {
      fallbackQuery = fallbackQuery.eq("jenis_bencana", disasterType);
    }

    if (search) {
      fallbackQuery = fallbackQuery.or(
        `id.ilike.%${search}%,judul.ilike.%${search}%,alamat.ilike.%${search}%,deskripsi.ilike.%${search}%`
      );
    }

    if (limit) {
      fallbackQuery = fallbackQuery.limit(limit);
    }

    const { data: fallbackData, error: fallbackError } = await fallbackQuery;

    if (fallbackError) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ reports: fallbackData ?? [] });
  } catch (error) {
    console.error("List admin reports error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function GET_ADMIN_REPORT_DETAIL(
  request: NextRequest,
  context: ReportRouteContext
) {
  try {
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const id = await getRouteId(context);
    if (!id) {
      return jsonError("Laporan id wajib diisi", 400, "id");
    }

    const { data, error } = await auth.adminClient
      .from("laporan")
      .select("*, laporan_media(*), profiles(nama, nim, no_hp)")
      .eq("id", id)
      .maybeSingle();

    if (!error) {
      if (!data) {
        return jsonError("Laporan tidak ditemukan", 404);
      }

      return NextResponse.json({ report: data });
    }

    const { data: fallbackData, error: fallbackError } = await auth.adminClient
      .from("laporan")
      .select("*, laporan_media(*)")
      .eq("id", id)
      .maybeSingle();

    if (fallbackError) {
      return jsonError(error.message, 500);
    }

    if (!fallbackData) {
      return jsonError("Laporan tidak ditemukan", 404);
    }

    return NextResponse.json({ report: fallbackData });
  } catch (error) {
    console.error("Get admin report detail error:", error);
    return jsonError("Internal server error", 500);
  }
}
