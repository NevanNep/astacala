"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Navbar } from "../../../components/Navbar"
import { Stepper } from "../../../components/Stepper"
import { useEffect } from "react"

const MapPicker = dynamic(() => import("../../../components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[160px] bg-[#D9D9D9] rounded-[16px] flex items-center justify-center">
      <span className="text-[13px] text-[var(--color-text-tertiary)]">Memuat peta...</span>
    </div>
  ),
})

export default function Step1LokasiPage() {
  const router = useRouter()
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [alamat, setAlamat] = useState("")
  const [detail, setDetail] = useState("")
  const [geocoding, setGeocoding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

useEffect(() => {
  async function loadDraft() {
    try {
      const res = await fetch("/api/report/draft")
      const data = await res.json()

      if (data.draft) {
        setAlamat(data.draft.alamat || "")
        setDetail(data.draft.detail || "")

        if (data.draft.latitude !== null && data.draft.longitude !== null) {
          setLatitude(data.draft.latitude)
          setLongitude(data.draft.longitude)
        }
      }
    } catch {
      // silent fail
    }
  }

  loadDraft()
}, [])

  async function handleLocationSelect(lat: number, lng: number) {
    setLatitude(lat)
    setLongitude(lng)
    setError(null)
    setGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            "Accept-Language": "id",
            "User-Agent": "AstacalaRescue/1.0",
          },
        }
      )
      if (res.ok) {
        const data = await res.json()
        if (data.display_name) {
          setAlamat(data.display_name)
        }
      }
    } catch {
      // Geocoding failure is non-fatal — user can type the address manually
    } finally {
      setGeocoding(false)
    }
  }

  async function handleLanjut() {
    setError(null)

    if (latitude === null || longitude === null) {
      setError("Pilih lokasi pada peta terlebih dahulu.")
      return
    }
    if (!alamat.trim()) {
      setError("Alamat lengkap wajib diisi.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/report/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude,
          longitude,
          alamat: alamat.trim(),
          ...(detail.trim() ? { detail: detail.trim() } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan. Coba lagi.")
        return
      }

      router.push("/report/step2")
    } catch {
      setError("Gagal terhubung ke server. Periksa koneksi Anda.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar
        variant="flow"
        showBack={true}
        title="Buat Laporan"
        rightElement={
          <span className="text-[16px] font-medium text-[var(--color-text-primary)]">1/3</span>
        }
      />

      <div className="w-full border-b border-[var(--color-border)]">
        <Stepper steps={["Lokasi", "Kondisi", "Kirim"]} currentStep={1} />
      </div>

      <main className="w-full flex-1 overflow-y-auto px-5 md:px-6 lg:px-8 pt-6 pb-32 max-w-[800px] mx-auto">
        <h1 className="text-[20px] font-medium text-[var(--color-text-primary)] mb-4">
          Lokasi Kejadian
        </h1>

        {/* Map */}
        <div className="mb-2">
          <MapPicker
            onLocationSelect={handleLocationSelect}
            selected={
              latitude !== null && longitude !== null ? { lat: latitude, lng: longitude } : null
            }
          />
        </div>

        {/* Coordinate hint below map */}
        <p className="text-[12px] text-[var(--color-text-tertiary)] mb-4">
          {latitude !== null && longitude !== null
            ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            : "Ketuk peta untuk memilih lokasi"}
        </p>

        {/* Inline error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-[12px] bg-red-50 border border-red-200">
            <p className="text-[13px] text-red-600">{error}</p>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-5">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[14px] font-medium text-[var(--color-text-primary)]">
                Alamat Lengkap
              </label>
              {geocoding && (
                <span className="text-[12px] text-[var(--color-text-tertiary)]">
                  Mengambil alamat...
                </span>
              )}
            </div>
            <textarea
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder={geocoding ? "Mengambil alamat..." : "Jl......"}
              disabled={geocoding}
              className="w-full bg-white border border-[var(--color-border)] rounded-[16px] py-3 px-4 text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] transition-colors resize-none min-h-[80px] disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[14px] font-medium text-[var(--color-text-primary)] mb-2">
              Catatan Tambahan
            </label>
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Misal: dekat pom bensin, depan sekolah, dsb."
              className="w-full bg-white border border-[var(--color-border)] rounded-[16px] py-3 px-4 text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
        </div>
      </main>

      {/* Fixed Bottom Button Row */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[var(--color-border)] px-5 py-4 z-50">
        <div className="max-w-[800px] mx-auto flex gap-3">
          <div className="flex-1">
            <button
              className="w-full py-3 px-4 rounded-[16px] border border-[var(--color-border)] text-[14px] font-medium text-[var(--color-text-secondary)] bg-white active:bg-gray-50 transition-colors"
              onClick={() => router.push("/dashboard")}
              disabled={loading}
            >
              Batal
            </button>
          </div>
          <div className="flex-[2]">
            <button
              className="w-full py-3 px-4 rounded-[16px] bg-[var(--color-primary)] text-[14px] font-medium text-white active:opacity-90 transition-colors disabled:opacity-60"
              onClick={handleLanjut}
              disabled={loading || geocoding}
            >
              {loading ? "Menyimpan..." : "Lanjut"}
            </button>
          </div>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  )
}
