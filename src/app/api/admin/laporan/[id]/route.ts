import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin, jsonError } from "@/src/lib/admin-auth";
import { GET_ADMIN_REPORT_DETAIL } from "@/src/lib/admin-laporan-service";

const REPORT_STATUSES = ["Diterima", "Ditolak"] as const;

type ReportStatus = (typeof REPORT_STATUSES)[number];

type RequestBody = {
  status?: unknown;
  alasan_penolakan?: unknown;
};

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export { GET_ADMIN_REPORT_DETAIL as GET };

async function parseBody(request: NextRequest): Promise<RequestBody | null> {
  try {
    return (await request.json()) as RequestBody;
  } catch {
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const { id } = await context.params;
    const body = await parseBody(request);

    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const status = asText(body.status) as ReportStatus;
    const rejectionReason = asText(body.alasan_penolakan);

    if (!REPORT_STATUSES.includes(status)) {
      return jsonError("Status harus Diterima atau Ditolak", 400, "status");
    }

    if (status === "Ditolak" && !rejectionReason) {
      return jsonError("Alasan penolakan wajib diisi", 400, "alasan_penolakan");
    }

    const { data: laporan, error: findError } = await auth.adminClient
      .from("laporan")
      .select("id, user_id")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      return jsonError(findError.message, 500);
    }

    if (!laporan) {
      return jsonError("Laporan tidak ditemukan", 404);
    }

    const alasanPenolakan = status === "Ditolak" ? rejectionReason : null;
    const { data: updatedLaporan, error: updateError } = await auth.adminClient
      .from("laporan")
      .update({
        status,
        alasan_penolakan: alasanPenolakan,
        verified_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, status")
      .single();

    if (updateError) {
      return jsonError(updateError.message, 500);
    }

    const isAccepted = status === "Diterima";
    const { data: notification, error: notificationError } = await auth.adminClient
      .from("notifikasi")
      .insert({
        user_id: laporan.user_id,
        type: isAccepted ? "laporan_diterima" : "laporan_ditolak",
        judul: isAccepted ? "Laporan Diterima" : "Laporan Ditolak",
        pesan: isAccepted
          ? `Laporan ${id} diterima.`
          : `Laporan ${id} ditolak. Alasan: ${alasanPenolakan}`,
        laporan_id: id,
      })
      .select("id")
      .single();

    if (notificationError) {
      return jsonError(notificationError.message, 500);
    }

    return NextResponse.json({
      id: updatedLaporan.id,
      status: updatedLaporan.status,
      notification_id: notification.id,
    });
  } catch (error) {
    console.error("Verify report error:", error);
    return jsonError("Internal server error", 500);
  }
}
