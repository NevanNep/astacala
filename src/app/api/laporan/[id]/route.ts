import { NextRequest, NextResponse } from "next/server";
import { authorizeUserClient, jsonError } from "@/src/lib/auth-client";
import { signLaporanMediaUrls } from "@/src/lib/laporan-media";

type ReportRouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

async function getRouteId(context: ReportRouteContext) {
  const params = await context.params;
  return String(params.id ?? "").trim();
}

export async function GET(request: NextRequest, context: ReportRouteContext) {
  try {
    const auth = await authorizeUserClient(request);
    if ("error" in auth) {
      return auth.error;
    }

    const id = await getRouteId(context);
    if (!id) {
      return jsonError("Laporan id wajib diisi", 400, "id");
    }

    const { data, error } = await auth.supabase
      .from("laporan")
      .select("*, laporan_media(*)")
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (error) {
      return jsonError(error.message, 500);
    }

    if (!data) {
      return jsonError("Laporan tidak ditemukan", 404);
    }

    // The query above is scoped to the owner (.eq("user_id", auth.user.id)), so we
    // only sign media for laporan the caller owns. Bucket is private otherwise.
    const laporan_media = await signLaporanMediaUrls(auth.supabase, data.laporan_media);

    return NextResponse.json({ report: { ...data, laporan_media } });
  } catch (error) {
    console.error("Get report detail error:", error);
    return jsonError("Internal server error", 500);
  }
}
