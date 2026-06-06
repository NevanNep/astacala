"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "../../../components/Navbar";
import { Stepper } from "../../../components/Stepper";
import { useReportDraftStore } from "../../../lib/report-draft-store";

const MapPicker = dynamic(() => import("../../../components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[246px] w-full items-center justify-center rounded-[8px] bg-[#D9D9D9]">
      <span className="text-[13px] text-[var(--color-text-tertiary)]">Memuat peta...</span>
    </div>
  ),
});

export default function Step1LokasiPage() {
  const router = useRouter();
  const draft = useReportDraftStore((state) => state.draft);
  const hasHydrated = useReportDraftStore((state) => state.hasHydrated);
  const setLocation = useReportDraftStore((state) => state.setLocation);
  const [geocoding, setGeocoding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { latitude, longitude, alamat, detail } = draft;

  async function handleLocationSelect(lat: number, lng: number) {
    setLocation({ latitude: lat, longitude: lng, alamat, detail });
    setError(null);
    setMessage("Fetching address...");
    setGeocoding(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "id" } }
      );

      if (!response.ok) {
        throw new Error("Could not auto-fill address, please enter it manually.");
      }

      const data: unknown = await response.json();
      const displayName =
        data && typeof data === "object" && "display_name" in data
          ? String((data as { display_name?: unknown }).display_name ?? "")
          : "";

      if (displayName) {
        setLocation({ latitude: lat, longitude: lng, alamat: displayName, detail });
        setMessage("Alamat berhasil diisi otomatis.");
      } else {
        setMessage("Could not auto-fill address, please enter it manually.");
      }
    } catch {
      setMessage("Could not auto-fill address, please enter it manually.");
    } finally {
      setGeocoding(false);
    }
  }

  function handleLanjut() {
    setError(null);

    if (latitude === null || longitude === null) {
      setError("Pilih lokasi pada peta terlebih dahulu.");
      return;
    }

    if (!alamat.trim()) {
      setError("Alamat lengkap wajib diisi.");
      return;
    }

    setLocation({
      latitude,
      longitude,
      alamat: alamat.trim(),
      detail: detail.trim(),
    });
    router.push("/report/step2");
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        variant="flow"
        showBack
        title="Buat Laporan"
        rightElement={<span className="text-[20px] font-semibold text-[var(--color-text-primary)]">1/3</span>}
      />

      <div className="border-b border-[#8E8E8E]">
        <div className="mx-auto w-full max-w-[860px] px-4 md:px-8">
          <Stepper steps={["Lokasi", "Kondisi", "Kirim"]} currentStep={1} />
        </div>
      </div>

      <main className="mx-auto w-full max-w-[860px] px-7 pb-36 pt-5 md:px-8">
        <h1 className="mb-4 text-[20px] font-semibold leading-tight text-[var(--color-text-primary)]">
          Lokasi Kejadian
        </h1>

        <div className="space-y-5">
          <section>
            <div className="mb-3 overflow-hidden rounded-[8px] border border-[#8E8E8E]">
              <MapPicker
                onLocationSelect={handleLocationSelect}
                selected={latitude !== null && longitude !== null ? { lat: latitude, lng: longitude } : null}
              />
            </div>

            <p className="text-[12px] text-[var(--color-text-secondary)]">
              {latitude !== null && longitude !== null
                ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                : !hasHydrated
                  ? "Memuat draft lokasi..."
                  : "Ketuk peta untuk memilih lokasi"}
            </p>
          </section>

          <section>
            {(message || error) && (
              <div
                className={`mb-4 rounded-[8px] border px-3 py-2 text-[12px] ${
                  error
                    ? "border-red-200 bg-red-50 text-[var(--color-primary)]"
                    : "border-[#F4D188] bg-[#FFD994] text-[var(--color-primary)]"
                }`}
              >
                {error ?? message}
              </div>
            )}

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-[14px] font-semibold text-[var(--color-text-primary)]">
                  Alamat Lengkap
                </span>
                <textarea
                  value={alamat}
                  onChange={(event) =>
                    setLocation({ latitude, longitude, alamat: event.target.value, detail })
                  }
                  placeholder={geocoding ? "Fetching address..." : "Jl..."}
                  className="min-h-[94px] w-full resize-none rounded-[8px] border border-[#8E8E8E] bg-white px-3 py-3 text-[14px] leading-relaxed text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] md:min-h-[130px]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[14px] font-semibold text-[var(--color-text-primary)]">
                  Detail Lokasi
                </span>
                <input
                  type="text"
                  value={detail}
                  onChange={(event) =>
                    setLocation({ latitude, longitude, alamat, detail: event.target.value })
                  }
                  placeholder="Misal: dekat pom bensin, depan sekolah"
                  className="h-[52px] w-full rounded-[8px] border border-[#8E8E8E] bg-white px-3 text-[14px] text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)]"
                />
              </label>
            </div>
          </section>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-[var(--color-border)] bg-white py-6">
        <div className="mx-auto flex w-full max-w-[860px] items-center justify-between gap-5 px-7 md:px-8">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            disabled={geocoding}
            className="h-10 min-w-[132px] rounded-[8px] border border-[#8E8E8E] bg-white px-5 text-[18px] font-semibold text-[var(--color-text-primary)] disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleLanjut}
            disabled={geocoding}
            className="h-10 min-w-[130px] rounded-[8px] bg-[var(--color-primary)] px-6 text-[18px] font-semibold text-white disabled:opacity-60"
          >
            Lanjut
          </button>
        </div>
      </div>
    </div>
  );
}
