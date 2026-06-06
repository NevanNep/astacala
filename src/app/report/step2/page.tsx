"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "../../../components/Navbar";
import { Stepper } from "../../../components/Stepper";
import {
  DISASTER_TYPES,
  DisasterType,
  NEED_OPTIONS,
  ReportMediaItem,
  SEVERITY_OPTIONS,
  Severity,
  addReportMediaFile,
  getReportMediaItems,
  removeReportMediaFile,
} from "../../../lib/report-flow";
import { useReportDraftStore } from "../../../lib/report-draft-store";

export default function Step2KondisiPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const draft = useReportDraftStore((state) => state.draft);
  const setCondition = useReportDraftStore((state) => state.setCondition);
  const [media, setMedia] = useState<ReportMediaItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { jenis_bencana: jenisBencana, keparahan: severity, deskripsi, kebutuhan } = draft;

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

    async function loadMedia() {
      try {
        const storedMedia = await getReportMediaItems();
        if (mounted) setMedia(storedMedia);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Gagal memuat media laporan.");
        }
      }
    }

    loadMedia();
    return () => {
      mounted = false;
    };
  }, []);

  function updateCondition(fields: Partial<{
    jenis_bencana: DisasterType | "";
    keparahan: Severity | "";
    deskripsi: string;
    kebutuhan: string[];
  }>) {
    setCondition({
      jenis_bencana: fields.jenis_bencana ?? jenisBencana,
      keparahan: fields.keparahan ?? severity,
      deskripsi: fields.deskripsi ?? deskripsi,
      kebutuhan: fields.kebutuhan ?? kebutuhan,
    });
  }

  function toggleKebutuhan(item: string) {
    updateCondition({
      kebutuhan: kebutuhan.includes(item)
        ? kebutuhan.filter((value) => value !== item)
        : [...kebutuhan, item],
    });
  }

  async function handleMediaChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setError(null);

    try {
      let nextMedia = await getReportMediaItems();
      for (const file of files) {
        await addReportMediaFile(file);
        nextMedia = await getReportMediaItems();
      }
      setMedia(nextMedia);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan media.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleRemoveMedia(id: string) {
    await removeReportMediaFile(id);
    setMedia(await getReportMediaItems());
  }

  async function handleLanjut() {
    setError(null);

    if (!jenisBencana) {
      setError("Pilih jenis bencana.");
      return;
    }

    if (!severity) {
      setError("Pilih tingkat keparahan.");
      return;
    }

    if (deskripsi.trim().length < 30) {
      setError("Deskripsi kondisi minimal 30 karakter.");
      return;
    }

    setSaving(true);

    try {
      setCondition({
        jenis_bencana: jenisBencana,
        keparahan: severity,
        deskripsi: deskripsi.trim(),
        kebutuhan,
      });
      router.push("/report/step3");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan kondisi laporan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        variant="flow"
        showBack
        title="Buat Laporan"
        rightElement={<span className="text-[20px] font-semibold text-[var(--color-text-primary)]">2/3</span>}
      />

      <div className="border-b border-[#8E8E8E]">
        <div className="mx-auto w-full max-w-[860px] px-4 md:px-8">
          <Stepper steps={["Lokasi", "Kondisi", "Kirim"]} currentStep={2} />
        </div>
      </div>

      <main className="mx-auto w-full max-w-[860px] px-7 pb-36 pt-5 md:px-8">
        <h1 className="mb-3 text-[20px] font-semibold text-[var(--color-text-primary)]">
          Kondisi Bencana
        </h1>

        {error && (
          <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-[var(--color-primary)]">
            {error}
          </div>
        )}

        <div className="space-y-5 opacity-100">
          <label className="block">
            <span className="mb-2 block text-[14px] font-semibold text-[var(--color-text-primary)]">
              Jenis Bencana
            </span>
            <div className="relative">
              <select
                value={jenisBencana}
                onChange={(event) =>
                  updateCondition({ jenis_bencana: event.target.value as DisasterType | "" })
                }
                className="h-[52px] w-full appearance-none rounded-[8px] border border-[#8E8E8E] bg-white px-3 pr-10 text-[14px] font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
              >
                <option value="">Pilih jenis bencana</option>
                {DISASTER_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-b-[4px] border-r-[4px] border-[var(--color-text-primary)]" />
            </div>
          </label>

          <section>
            <h2 className="mb-3 text-[14px] font-semibold text-[var(--color-text-primary)]">
              Tingkat Keparahan
            </h2>
            <div className="flex flex-wrap gap-5">
              {SEVERITY_OPTIONS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateCondition({ keparahan: level })}
                  className={`h-7 rounded-full px-3 text-[12px] font-semibold ${
                    severity === level
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[#757575] text-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </section>

          <label className="block">
            <span className="mb-2 block text-[14px] font-semibold text-[var(--color-text-primary)]">
              Deskripsi Kondisi
            </span>
            <textarea
              value={deskripsi}
              onChange={(event) => updateCondition({ deskripsi: event.target.value })}
              placeholder="Tinggi air mencapai 2 meter"
              className="min-h-[100px] w-full resize-none rounded-[8px] border border-[#8E8E8E] bg-white px-3 py-3 text-[14px] leading-relaxed text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] md:min-h-[130px]"
            />
            <span className="mt-1 block text-[10px] text-[var(--color-text-secondary)]">
              Min. 30 Karakter- Jelaskan kondisi sejelas mungkin
            </span>
          </label>

            <section>
              <h2 className="mb-2 text-[14px] font-semibold text-[var(--color-text-primary)]">
                Kebutuhan Mendesak
              </h2>
              <div className="min-h-[112px] rounded-[8px] border border-[#8E8E8E] bg-white p-3">
                <div className="flex flex-wrap gap-2">
                  {NEED_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleKebutuhan(item)}
                      className={`h-6 rounded-full px-3 text-[12px] font-semibold ${
                        kebutuhan.includes(item)
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-[#757575] text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="h-6 rounded-full bg-[#757575] px-5 text-[16px] font-semibold leading-none text-white"
                    aria-label="Tambah kebutuhan lain"
                  >
                    +
                  </button>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-[20px] font-semibold text-[var(--color-text-primary)]">
                Foto Kejadian
              </h2>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={handleMediaChange}
              />
              <div className="grid grid-cols-3 gap-x-9 gap-y-7">
                {Array.from({ length: 5 }).map((_, index) => {
                  const preview = previews[index];

                  return preview ? (
                    <button
                      key={preview.id}
                      type="button"
                      onClick={() => handleRemoveMedia(preview.id)}
                      className="relative flex h-[76px] w-[82px] items-center justify-center overflow-hidden rounded-[8px] border-[3px] border-[var(--color-text-primary)] bg-white"
                      title="Hapus foto"
                    >
                      {/* TODO: Add video once the report API supports video uploads end to end. */}
                      <span
                        className="block h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url("${preview.url}")` }}
                        role="img"
                        aria-label={preview.name}
                      />
                    </button>
                  ) : (
                    <button
                      key={`empty-${index}`}
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-[76px] w-[82px] items-center justify-center rounded-[8px] border-[3px] border-[var(--color-text-primary)] bg-white"
                      aria-label="Tambah foto"
                    >
                      <span className="relative h-9 w-9 before:absolute before:left-1/2 before:top-0 before:h-full before:w-[3px] before:-translate-x-1/2 before:bg-[var(--color-text-primary)] after:absolute after:left-0 after:top-1/2 after:h-[3px] after:w-full after:-translate-y-1/2 after:bg-[var(--color-text-primary)]" />
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 flex gap-2 rounded-[8px] bg-[#FFD994] px-3 py-2 text-[13px] leading-tight text-[var(--color-primary)]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--color-text-primary)] text-[12px] font-bold text-[var(--color-text-primary)]">
                  !
                </span>
                <p>
                  Pastikan foto menunjukkan kondisi nyata di lapangan. Laporan dengan bukti yang jelas akan lebih cepat
                  diverifikasi.
                </p>
              </div>
            </section>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-[var(--color-border)] bg-white py-6">
        <div className="mx-auto flex w-full max-w-[860px] items-center justify-between gap-5 px-7 md:px-8">
          <button
            type="button"
            onClick={() => router.push("/report/step1")}
            disabled={saving}
            className="h-10 min-w-[132px] rounded-[8px] border border-[#8E8E8E] bg-white px-4 text-[18px] font-semibold text-[var(--color-text-primary)] disabled:opacity-60"
          >
            &larr; Kembali
          </button>
          <button
            type="button"
            onClick={handleLanjut}
            disabled={saving}
            className="h-10 min-w-[130px] rounded-[8px] bg-[var(--color-primary)] px-6 text-[18px] font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Simpan" : "Lanjut"}
          </button>
        </div>
      </div>
    </div>
  );
}
