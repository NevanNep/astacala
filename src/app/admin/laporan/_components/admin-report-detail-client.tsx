"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/utils/supabase/client";
import type { AdminReportDetail, ReportMedia, VerifyReportPayload } from "./types";
import { getReporterProfile, normalizeReportStatus } from "./types";
import {
  DetailCard,
  DetailRow,
  displayValue,
  formatAdminDateTime,
  formatCoordinate,
  reportTitle,
  StatusBadge,
} from "./admin-report-ui";

type SubmitState = {
  busy: "accept" | "reject" | null;
  error: string | null;
  success: string | null;
};

function getInitials(name: string | null | undefined) {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "AR";
}

function parseApiError(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "error" in data) {
    const error = (data as { error?: unknown }).error;
    if (typeof error === "string" && error.trim()) return error;
  }

  return fallback;
}

function mediaPublicUrl(media: ReportMedia) {
  if (!media.storage_path) return null;

  return createClient().storage.from("laporan-media").getPublicUrl(media.storage_path).data.publicUrl;
}

function MediaPreview({ media }: { media: ReportMedia[] }) {
  if (media.length === 0) {
    return (
      <div className="rounded-[8px] border border-dashed border-[#C8C8C8] bg-[#F5F5F5] px-4 py-6 text-[13px] font-semibold text-[#777777]">
        Belum ada foto bukti.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {media.map((item, index) => {
        const url = mediaPublicUrl(item);

        if (!url) return null;

        return (
          <a
            key={`${item.id ?? item.storage_path ?? index}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="aspect-[1.3] overflow-hidden rounded-[16px] bg-[#8A8484] md:rounded-[18px]"
          >
            <span
              className="block h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url("${url}")` }}
              aria-label="Foto bukti laporan"
              role="img"
            />
          </a>
        );
      })}
    </div>
  );
}

function MapPreview({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

  return (
    <div className="overflow-hidden rounded-[20px] bg-[#D9D9D9] px-4 py-8 md:rounded-[22px] md:py-10">
      <div className="flex min-h-[86px] flex-col items-center justify-center gap-3 text-[#27272A]">
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-[4px] border-[#27272A] bg-transparent after:absolute after:-bottom-[13px] after:h-5 after:w-5 after:rotate-45 after:border-b-[4px] after:border-r-[4px] after:border-[#27272A] after:bg-[#D9D9D9]">
          <span className="h-3.5 w-3.5 rounded-full border-[4px] border-[#27272A]" />
        </span>
        {hasCoordinates ? (
          <a
            href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] font-bold text-[#27272A] underline-offset-4 hover:underline"
          >
            {formatCoordinate(latitude, longitude)}
          </a>
        ) : null}
      </div>
    </div>
  );
}

function ReporterCard({ report }: { report: AdminReportDetail }) {
  const reporter = getReporterProfile(report.profiles);
  const reporterName = displayValue(reporter?.nama ?? null);
  const totalReports = report.reporterStats?.totalReports;
  const acceptedReports = report.reporterStats?.acceptedReports;

  return (
    <DetailCard title="Data Relawan">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#DD3036] text-[24px] font-bold text-black">
          {getInitials(reporterName)}
        </div>
        <div className="min-w-0">
          <p className="break-words text-[14px] font-bold leading-tight text-[#202124] md:text-[16px]">
            {reporterName}
          </p>
          <p className="mt-1 break-words text-[11px] font-semibold text-[#777777] md:text-[13px]">
            {displayValue(reporter?.nim || reporter?.no_hp || null)}
          </p>
        </div>
      </div>
      {totalReports !== null && totalReports !== undefined && acceptedReports !== null && acceptedReports !== undefined ? (
        <div className="mt-4 grid grid-cols-2 gap-8">
          <div className="rounded-[8px] bg-[#D9D9D9] px-5 py-2 text-center">
            <p className="text-[48px] font-bold leading-none text-black md:text-[56px]">{totalReports}</p>
            <p className="mt-2 text-[12px] font-medium text-[#777777]">Laporan dikirim</p>
          </div>
          <div className="rounded-[8px] bg-[#D9D9D9] px-5 py-2 text-center">
            <p className="text-[48px] font-bold leading-none text-black md:text-[56px]">{acceptedReports}</p>
            <p className="mt-2 text-[12px] font-medium text-[#777777]">Diterima</p>
          </div>
        </div>
      ) : null}
    </DetailCard>
  );
}

export function AdminReportDetailClient({ initialReport }: { initialReport: AdminReportDetail }) {
  const router = useRouter();
  const [report, setReport] = useState(initialReport);
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({
    busy: null,
    error: null,
    success: null,
  });

  const status = normalizeReportStatus(report.status);
  const reporter = getReporterProfile(report.profiles);
  const reporterName = displayValue(reporter?.nama ?? null);
  const media = useMemo(() => report.laporan_media?.filter((item) => item.storage_path) ?? [], [report.laporan_media]);
  const kebutuhan = report.kebutuhan?.length ? report.kebutuhan.join(", ") : "-";
  const rejectionReason = report.alasan_penolakan?.trim() || "-";

  async function verify(payload: VerifyReportPayload, action: "accept" | "reject") {
    setSubmitState({ busy: action, error: null, success: null });
    setValidationError(null);

    try {
      const response = await fetch(`/api/admin/laporan/${encodeURIComponent(report.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiError(data, "Gagal memperbarui status laporan."));
      }

      setReport((current) => ({
        ...current,
        status: payload.status,
        alasan_penolakan: payload.status === "Ditolak" ? payload.alasan_penolakan ?? "" : null,
        verified_at: new Date().toISOString(),
      }));
      setSubmitState({
        busy: null,
        error: null,
        success: payload.status === "Diterima" ? "Laporan berhasil diterima." : "Laporan berhasil ditolak.",
      });
      router.refresh();
    } catch (error) {
      setSubmitState({
        busy: null,
        error: error instanceof Error ? error.message : "Gagal memperbarui status laporan.",
        success: null,
      });
    }
  }

  function handleReject() {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setValidationError("Alasan penolakan wajib diisi.");
      return;
    }

    void verify({ status: "Ditolak", alasan_penolakan: trimmedReason }, "reject");
  }

  return (
    <div className="space-y-4">
      <DetailCard title="Detail Laporan" action={<StatusBadge status={status} />}>
        <DetailRow label="Jenis" value={displayValue(report.jenis_bencana)} />
        <DetailRow label="Keparahan" value={displayValue(report.keparahan)} danger={report.keparahan === "Parah" || report.keparahan === "Kritis"} />
        <DetailRow label="Lokasi" value={displayValue(report.alamat)} />
        <DetailRow label="Koordinat" value={formatCoordinate(report.latitude, report.longitude)} />
        <DetailRow label="Kebutuhan" value={kebutuhan} />
        <DetailRow label="Deskripsi" value={displayValue(report.deskripsi)} />
      </DetailCard>

      <DetailCard title="Foto Bukti">
        <MediaPreview media={media} />
      </DetailCard>

      <DetailCard title="Lokasi Di Peta">
        <MapPreview latitude={report.latitude} longitude={report.longitude} />
      </DetailCard>

      <ReporterCard report={report} />

      {status === "Ditolak" ? (
        <section className="overflow-hidden rounded-[8px] border border-[#FF5B62] bg-white">
          <div className="bg-[#FA777D] px-6 py-4">
            <h2 className="text-[15px] font-bold text-[#E1111B] md:text-[17px]">Alasan Penolakan</h2>
          </div>
          <div className="p-3">
            <div className="min-h-[110px] rounded-[8px] border border-[#FF5B62] px-4 py-3 text-[14px] font-semibold leading-snug text-[#777777]">
              {rejectionReason}
            </div>
          </div>
        </section>
      ) : null}

      {status === "Pending" ? (
        <>
          <section className="overflow-hidden rounded-[8px] border border-[#FF5B62] bg-white">
            <div className="bg-[#FA777D] px-6 py-4">
              <h2 className="text-[15px] font-bold text-[#E1111B] md:text-[17px]">Alasan Penolakan (isi jika menolak)</h2>
            </div>
            <div className="p-3">
              <textarea
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Jelaskan Alasan Penolakan...."
                className="min-h-[110px] w-full resize-y rounded-[8px] border border-[#FF5B62] px-4 py-3 text-[14px] font-semibold leading-snug text-[#202124] outline-none placeholder:text-[#777777] focus:ring-2 focus:ring-[#FF5B62]/30"
              />
              {validationError ? <p className="mt-2 text-[12px] font-bold text-[#D3262E]">{validationError}</p> : null}
            </div>
          </section>

          <div className="sticky bottom-0 -mx-4 grid grid-cols-2 gap-3 bg-[#F5F5F5]/95 px-4 py-4 backdrop-blur md:static md:mx-0 md:px-0">
            <button
              type="button"
              onClick={handleReject}
              disabled={submitState.busy !== null}
              className="h-[52px] rounded-[8px] bg-[#FA777D] text-[14px] font-bold text-[#E1111B] transition hover:bg-[#F65E66] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitState.busy === "reject" ? "Menolak..." : "Tolak"}
            </button>
            <button
              type="button"
              onClick={() => void verify({ status: "Diterima" }, "accept")}
              disabled={submitState.busy !== null}
              className="h-[52px] rounded-[8px] bg-[#F80E16] text-[14px] font-bold text-white transition hover:bg-[#D70B11] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitState.busy === "accept" ? "Menerima..." : "Terima"}
            </button>
          </div>
        </>
      ) : null}

      {submitState.error ? (
        <div className="rounded-[8px] border border-[#FF5B62] bg-white px-4 py-3 text-[13px] font-bold text-[#D3262E]">
          {submitState.error}
        </div>
      ) : null}
      {submitState.success ? (
        <div className="rounded-[8px] border border-[#B9DDBD] bg-white px-4 py-3 text-[13px] font-bold text-[#2E7D32]">
          {submitState.success}
        </div>
      ) : null}

      <div className="sr-only">
        {reportTitle(report)} {reporterName} {formatAdminDateTime(report.created_at)}
      </div>
    </div>
  );
}
