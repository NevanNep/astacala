"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Navbar } from "../../../components/Navbar";
import { createClient } from "../../../utils/supabase/client";
import { Stepper } from "../../../components/Stepper";
import {
  ReportDraft,
  ReportMediaItem,
  clearReportMediaFiles,
  coordinateText,
  getReportMediaItems,
  truncateText,
  writeReportSuccessSummary,
} from "../../../lib/report-flow";
import { useReportDraftStore } from "../../../lib/report-draft-store";

function ReviewCard({
  title,
  editHref,
  rows,
  onEdit,
}: {
  title: string;
  editHref: string;
  rows: { label: string; value: ReactNode }[];
  onEdit: (href: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[8px] border border-[#8E8E8E] bg-white">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">{title}</h2>
        <button
          type="button"
          onClick={() => onEdit(editHref)}
          className="text-[16px] font-semibold text-[var(--color-primary)]"
        >
          Edit &gt;
        </button>
      </div>
      <div className="rounded-t-[8px] border-t border-[#8E8E8E] px-3 py-3">
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[104px_1fr] gap-4 text-[12px] leading-tight">
              <span className="text-[var(--color-text-secondary)]">{row.label}</span>
              <span className="font-semibold text-[var(--color-text-primary)]">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function safeFileName(fileName: string) {
  const sanitized = fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  return sanitized || "media";
}

async function uploadReportMedia(media: ReportMediaItem[]) {
  if (media.length === 0) return [];

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Pengguna belum terautentikasi.");
  }

  const paths: string[] = [];

  for (const [index, item] of media.entries()) {
    const storagePath = `${user.id}/${Date.now()}-${index}-${safeFileName(item.name)}`;
    const { error } = await supabase.storage.from("laporan-media").upload(storagePath, item.file, {
      contentType: item.type || undefined,
      upsert: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    paths.push(storagePath);
  }

  return paths;
}

export default function Step3ReviewPage() {
  const router = useRouter();
  const draft = useReportDraftStore((state) => state.draft);
  const clearDraft = useReportDraftStore((state) => state.clearDraft);
  const [media, setMedia] = useState<ReportMediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(
    () =>
      media.map((item) => ({
        id: item.id,
        name: item.name,
        url: URL.createObjectURL(item.file),
      })),
    [media]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  useEffect(() => {
    let mounted = true;

    async function loadReviewMedia() {
      try {
        const mediaData = await getReportMediaItems();
        if (!mounted) return;
        setMedia(mediaData);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Gagal memuat media laporan.");
        }
      } finally {
        if (mounted) setLoadingMedia(false);
      }
    }

    loadReviewMedia();
    return () => {
      mounted = false;
    };
  }, []);

  function validateDraft(current: ReportDraft) {
    if (current.latitude === null || current.longitude === null) return "Lokasi pada peta wajib dipilih.";
    if (!current.alamat.trim()) return "Alamat lengkap wajib diisi.";
    if (!current.jenis_bencana) return "Jenis bencana wajib diisi.";
    if (!current.keparahan) return "Tingkat keparahan wajib diisi.";
    if (current.deskripsi.trim().length < 30) return "Deskripsi kondisi minimal 30 karakter.";
    return null;
  }

  async function handleKirim() {
    const validationError = validateDraft(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const mediaPaths = await uploadReportMedia(media);
      const response = await fetch("/api/laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: `${draft.jenis_bencana} - ${truncateText(draft.alamat, 44)}`,
          latitude: draft.latitude,
          longitude: draft.longitude,
          alamat: draft.alamat.trim(),
          detail: draft.detail.trim(),
          jenis_bencana: draft.jenis_bencana,
          keparahan: draft.keparahan,
          deskripsi: draft.deskripsi.trim(),
          kebutuhan: draft.kebutuhan,
          media_paths: mediaPaths,
        }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        const apiError =
          data && typeof data === "object" && "error" in data
            ? String((data as { error?: unknown }).error ?? "")
            : "";
        throw new Error(apiError || "Gagal mengirim laporan.");
      }

      const id =
        data && typeof data === "object" && "id" in data ? String((data as { id?: unknown }).id ?? "") : "";
      const status =
        data && typeof data === "object" && "status" in data
          ? String((data as { status?: unknown }).status ?? "Pending")
          : "Pending";
      const mediaCount =
        data && typeof data === "object" && "media_count" in data
          ? Number((data as { media_count?: unknown }).media_count ?? media.length)
          : media.length;

      await clearReportMediaFiles();
      clearDraft();
      writeReportSuccessSummary({
        id,
        status,
        media_count: Number.isFinite(mediaCount) ? mediaCount : media.length,
        jenis_bencana: draft.jenis_bencana,
        alamat: draft.alamat,
        created_at: new Date().toISOString(),
      });
      router.push("/report/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim laporan.");
    } finally {
      setSubmitting(false);
    }
  }

  const needs = draft.kebutuhan.length ? draft.kebutuhan.join(", ") : "-";

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        variant="flow"
        showBack
        title="Buat Laporan"
        rightElement={<span className="text-[20px] font-semibold text-[var(--color-text-primary)]">3/3</span>}
      />

      <div className="border-b border-[#8E8E8E]">
        <div className="mx-auto w-full max-w-[860px] px-4 md:px-8">
          <Stepper steps={["Lokasi", "Kondisi", "Kirim"]} currentStep={3} />
        </div>
      </div>

      <div className="border-b border-[#8E8E8E] bg-[#EFEFEF] shadow-[0_2px_5px_rgba(0,0,0,0.25)]">
        <div className="mx-auto w-full max-w-[860px] px-4 py-3 md:px-8">
          <p className="text-center text-[16px] font-medium text-[var(--color-text-secondary)]">
            Periksa kembali sebelum mengirim laporan
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[860px] px-7 pb-36 pt-4 md:px-8">
        {error && (
          <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-[var(--color-primary)]">
            {error}
          </div>
        )}

        {loadingMedia ? (
          <div className="rounded-[8px] border border-[#8E8E8E] px-4 py-8 text-center text-[13px] text-[var(--color-text-secondary)]">
            Memuat ringkasan laporan...
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <ReviewCard
                title="Lokasi Kejadian"
                editHref="/report/step1"
                onEdit={(href) => router.push(href)}
                rows={[
                  { label: "Koordinat", value: coordinateText(draft.latitude, draft.longitude) },
                  { label: "Alamat", value: truncateText(draft.alamat, 28) },
                  { label: "Detail", value: truncateText(draft.detail, 28) },
                ]}
              />

              <ReviewCard
                title="Kondisi Bencana"
                editHref="/report/step2"
                onEdit={(href) => router.push(href)}
                rows={[
                  { label: "Jenis", value: draft.jenis_bencana || "-" },
                  { label: "Keparahan", value: draft.keparahan || "-" },
                  { label: "Kebutuhan", value: truncateText(needs, 28) },
                  { label: "Deskripsi", value: truncateText(draft.deskripsi, 28) },
                ]}
              />

              <section className="overflow-hidden rounded-[8px] border border-[#8E8E8E] bg-white">
                <div className="flex items-center justify-between px-3 py-2">
                  <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">Media Bukti</h2>
                  <button
                    type="button"
                    onClick={() => router.push("/report/step2")}
                    className="text-[16px] font-semibold text-[var(--color-primary)]"
                  >
                    Edit &gt;
                  </button>
                </div>
                <div className="rounded-t-[8px] border-t border-[#8E8E8E] px-3 py-3">
                  <div className="grid grid-cols-[104px_1fr] gap-4">
                    <span className="text-[12px] text-[var(--color-text-secondary)]">Foto</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {previews.slice(0, 6).map((preview) => (
                        <span
                          key={preview.id}
                          className="h-[42px] w-[44px] rounded-[6px] bg-cover bg-center md:h-14 md:w-14"
                          style={{ backgroundImage: `url("${preview.url}")` }}
                          role="img"
                          aria-label={preview.name}
                        />
                      ))}
                      <span className="rounded-[6px] bg-[#D9D9D9] px-2 py-3 text-[12px] font-medium text-[var(--color-text-secondary)]">
                        {media.length} Foto
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-3 rounded-[8px] bg-[#C9DDC9] px-4 py-4 text-[14px] font-semibold leading-tight text-[var(--color-success)]">
              Dengan mengirim laporan ini, saya menyatakan bahwa informasi yang diberikan adalah benar dan dapat
              dipertanggungjawabkan.
            </div>
          </>
        )}
      </main>

      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-[var(--color-border)] bg-white py-6">
        <div className="mx-auto flex w-full max-w-[860px] items-center justify-between gap-5 px-7 md:px-8">
          <button
            type="button"
            onClick={() => router.push("/report/step2")}
            disabled={submitting}
            className="h-10 min-w-[132px] rounded-[8px] border border-[#8E8E8E] bg-white px-4 text-[18px] font-semibold text-[var(--color-text-primary)] disabled:opacity-60"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={handleKirim}
            disabled={submitting || loadingMedia}
            className="h-10 min-w-[130px] rounded-[8px] bg-[var(--color-primary)] px-6 text-[18px] font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Mengirim" : "Kirim"}
          </button>
        </div>
      </div>
    </div>
  );
}
