import type { ReportMediaRecord, ReportStatus } from "@/src/lib/report-flow";

export type ReporterProfile = {
  nama: string | null;
  nim: string | null;
  no_hp: string | null;
};

export type ReportMedia = ReportMediaRecord;

export type AdminReportListItem = {
  id: string;
  user_id: string | null;
  judul: string | null;
  jenis_bencana: string | null;
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
  keparahan: string | null;
  status: ReportStatus | string | null;
  created_at: string | null;
  laporan_media?: ReportMedia[] | null;
  profiles?: ReporterProfile | ReporterProfile[] | null;
};

export type AdminReportDetail = AdminReportListItem & {
  detail: string | null;
  deskripsi: string | null;
  kebutuhan: string[] | null;
  alasan_penolakan: string | null;
  verified_at: string | null;
  reporterStats?: {
    totalReports: number | null;
    acceptedReports: number | null;
  };
};

export type VerifyReportPayload = {
  status: "Diterima" | "Ditolak";
  alasan_penolakan?: string;
};

export const REPORT_STATUSES = ["Pending", "Diterima", "Ditolak"] as const;

export function normalizeReportStatus(status: string | null | undefined): ReportStatus {
  if (status === "Diterima" || status === "Ditolak" || status === "Pending") {
    return status;
  }

  return "Pending";
}

export function getReporterProfile(profile: AdminReportListItem["profiles"]) {
  if (Array.isArray(profile)) {
    return profile[0] ?? null;
  }

  return profile ?? null;
}
