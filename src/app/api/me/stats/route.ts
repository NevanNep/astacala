import { NextRequest, NextResponse } from "next/server";
import { authorizeUser, jsonError } from "@/src/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeUser(request);
    if ("error" in auth) {
      return auth.error;
    }

    const userId = auth.user.id;
    const [
      totalLaporanResult,
      laporanDiterimaResult,
      laporanPendingResult,
      laporanDitolakResult,
      misiTerdaftarResult,
      completedMissionResult,
    ] = await Promise.all([
      auth.adminClient.from("laporan").select("id", { count: "exact", head: true }).eq("user_id", userId),
      auth.adminClient
        .from("laporan")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "Diterima"),
      auth.adminClient
        .from("laporan")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "Pending"),
      auth.adminClient
        .from("laporan")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "Ditolak"),
      auth.adminClient
        .from("misi_relawan")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      auth.adminClient
        .from("misi_relawan")
        .select("id, misi!inner(status)", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("misi.status", "Selesai"),
    ]);

    const countResults = [
      totalLaporanResult,
      laporanDiterimaResult,
      laporanPendingResult,
      laporanDitolakResult,
      misiTerdaftarResult,
      completedMissionResult,
    ];
    const countError = countResults.find((result) => result.error)?.error;
    if (countError) {
      throw new Error(countError.message);
    }

    if (completedMissionResult.error) {
      throw new Error(completedMissionResult.error.message);
    }

    return NextResponse.json({
      stats: {
        total_laporan: totalLaporanResult.count ?? 0,
        laporan_diterima: laporanDiterimaResult.count ?? 0,
        laporan_pending: laporanPendingResult.count ?? 0,
        laporan_ditolak: laporanDitolakResult.count ?? 0,
        misi_terdaftar: misiTerdaftarResult.count ?? 0,
        misi_selesai: completedMissionResult.count ?? 0,
      },
    });
  } catch (error) {
    console.error("Get profile stats error:", error);
    return jsonError("Internal server error", 500);
  }
}
