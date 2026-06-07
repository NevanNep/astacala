"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import { Footer } from "../../../components/Footer";
import { Navbar } from "../../../components/Navbar";

interface MissionDetail {
  id: string;
  judul: string;
  lokasi: string;
  latitude: number | null;
  longitude: number | null;
  deskripsi: string;
  persyaratan: string[];
  jenis: string;
  koordinator: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  kuota: number;
  status: "Terbuka" | "Penuh" | "Selesai";
  created_at: string;
  registration_count: number;
  registered: boolean;
}

const MISSION_DETAIL_CONTAINER = "w-full max-w-[1000px] mx-auto px-4 md:px-8 lg:px-12";
const MISSION_DETAIL_NAV_CONTAINER = "max-w-[1000px] lg:px-12";
const DETAIL_SECTION_CLASS = "md:bg-white md:border md:border-[var(--color-border)] md:rounded-xl md:p-6";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function statusBadgeVariant(
  status: MissionDetail["status"]
): "success" | "warning" | "neutral" {
  if (status === "Terbuka") return "success";
  if (status === "Penuh") return "warning";
  return "neutral";
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--color-border)] rounded-xl p-4 flex flex-col gap-1">
      <span className="text-[11px] text-[var(--color-text-tertiary)] font-medium">{label}</span>
      <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}

function RegisteredAvatars({ count }: { count: number }) {
  const displayCount = Math.min(count, 3);
  const initials = ["AB", "BC", "CD"];
  const colors = [
    "bg-[var(--color-danger)]",
    "bg-[var(--color-success)]",
    "bg-[var(--color-secondary)]",
  ];
  const overflow = count - 3;

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {initials.slice(0, displayCount).map((init, i) => (
          <div
            key={i}
            className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-white ${colors[i]}`}
          >
            {init}
          </div>
        ))}
        {overflow > 0 && (
          <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-white bg-gray-400">
            +{overflow}
          </div>
        )}
      </div>
      <span className="text-[13px] text-[var(--color-text-secondary)]">
        {count} relawan sudah mendaftar
      </span>
    </div>
  );
}

export default function MisiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [mission, setMission] = useState<MissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const retry = () => {
    setLoading(true);
    setError(null);
    setFetchTrigger((n) => n + 1);
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch(`/api/misi/${id}`);
        if (cancelled) return;
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.status === 404) {
          if (!cancelled) {
            setError("Misi tidak ditemukan.");
            setLoading(false);
          }
          return;
        }
        if (!res.ok) {
          const data: { error?: string } = await res.json().catch(() => ({}));
          if (!cancelled) {
            setError(data.error ?? "Gagal memuat detail misi.");
            setLoading(false);
          }
          return;
        }
        const data: { mission: MissionDetail } = await res.json();
        if (!cancelled) {
          setMission(data.mission);
          setError(null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id, fetchTrigger, router]);

  const handleRegister = async () => {
    if (!mission) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/misi/${mission.id}/daftar`, { method: "POST" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setActionError(data.error ?? "Pendaftaran gagal. Silakan coba lagi.");
        return;
      }
      const data: { registration_count: number; mission_status: MissionDetail["status"] } =
        await res.json();
      setMission((prev) =>
        prev
          ? { ...prev, registered: true, registration_count: data.registration_count, status: data.mission_status }
          : prev
      );
    } catch {
      setActionError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!mission) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/misi/${mission.id}/daftar`, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setActionError(data.error ?? "Pembatalan pendaftaran gagal. Silakan coba lagi.");
        return;
      }
      const data: { registration_count: number; mission_status: MissionDetail["status"] } =
        await res.json();
      setMission((prev) =>
        prev
          ? { ...prev, registered: false, registration_count: data.registration_count, status: data.mission_status }
          : prev
      );
    } catch {
      setActionError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-bg-default)]">
        <Navbar
          variant="flow"
          title="Detail Misi"
          showBack
          containerClassName={MISSION_DETAIL_NAV_CONTAINER}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className={`${MISSION_DETAIL_CONTAINER} text-center text-[var(--color-text-secondary)] text-[14px]`}>
            Memuat detail misi…
          </div>
        </main>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-bg-default)]">
        <Navbar
          variant="flow"
          title="Detail Misi"
          showBack
          containerClassName={MISSION_DETAIL_NAV_CONTAINER}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className={`${MISSION_DETAIL_CONTAINER} flex flex-col items-center gap-4`}>
          <p className="text-[var(--color-danger)] text-[14px] text-center">
            {error ?? "Misi tidak ditemukan."}
          </p>
          <button
            onClick={retry}
            className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-full text-[14px] font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Coba Lagi
          </button>
          </div>
        </main>
      </div>
    );
  }

  const slotsLeft = Math.max(0, mission.kuota - mission.registration_count);
  const descTruncated =
    !expanded && mission.deskripsi.length > 200
      ? mission.deskripsi.slice(0, 200).trimEnd() + "…"
      : mission.deskripsi;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-default)]">
      <Navbar
        variant="flow"
        title="Detail Misi"
        showBack
        containerClassName={MISSION_DETAIL_NAV_CONTAINER}
      />

      <main className="flex-1 pb-36">
        {/* Hero */}
        <section className="bg-[var(--color-secondary)] py-6 md:py-10 lg:py-12">
          <div className={MISSION_DETAIL_CONTAINER}>
            <h1 className="text-[22px] md:text-[34px] font-bold text-white mb-1">
              {mission.judul}
            </h1>
            <p className="text-[14px] md:text-[16px] text-white/70 mb-3">{mission.lokasi}</p>
            <Badge variant={statusBadgeVariant(mission.status)} text={mission.status} />
          </div>
        </section>

        <div className={`${MISSION_DETAIL_CONTAINER} space-y-8 mt-8 md:mt-10`}>
          {/* Mission info */}
          <section className={DETAIL_SECTION_CLASS}>
            <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-4">
              Informasi Misi
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <InfoBox label="Tanggal Mulai" value={formatDate(mission.tanggal_mulai)} />
              <InfoBox label="Tanggal Selesai" value={formatDate(mission.tanggal_selesai)} />
              <InfoBox label="Jenis Misi" value={mission.jenis} />
              <InfoBox label="Koordinator" value={mission.koordinator ?? "-"} />
            </div>
          </section>

          {/* Location */}
          <section className={DETAIL_SECTION_CLASS}>
            <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-4">
              Lokasi Misi
            </h2>
            <div className="bg-gray-100 rounded-xl flex items-center justify-center h-[160px] md:h-[260px]">
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21s-7-6.5-7-12a7 7 0 1114 0c0 5.5-7 12-7 12z"
                  />
                  <circle cx="12" cy="9" r="2.5" fill="currentColor" />
                </svg>
                <span className="text-[13px] text-center px-4">{mission.lokasi}</span>
                {mission.latitude && mission.longitude && (
                  <span className="text-[11px]">
                    {mission.latitude.toFixed(4)}, {mission.longitude.toFixed(4)}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-white p-4">
              <span className="text-[11px] font-medium text-[var(--color-text-tertiary)]">
                Alamat Lokasi
              </span>
              <p className="mt-1 text-[14px] md:text-[15px] font-medium leading-relaxed text-[var(--color-text-primary)]">
                {mission.lokasi}
              </p>
              {mission.latitude && mission.longitude && (
                <p className="mt-2 text-[12px] text-[var(--color-text-secondary)]">
                  Koordinat: {mission.latitude.toFixed(4)}, {mission.longitude.toFixed(4)}
                </p>
              )}
            </div>
          </section>

          {/* Description */}
          <section className={DETAIL_SECTION_CLASS}>
            <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-3">
              Deskripsi Misi
            </h2>
            <p className="text-[14px] md:text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
              {descTruncated}
            </p>
            {mission.deskripsi.length > 200 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 text-[13px] text-[var(--color-primary)] font-medium hover:underline"
              >
                {expanded ? "Sembunyikan" : "Baca Selengkapnya ›"}
              </button>
            )}
          </section>

          {/* Requirements */}
          {mission.persyaratan && mission.persyaratan.length > 0 && (
            <section className={DETAIL_SECTION_CLASS}>
              <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-3">
                Persyaratan Relawan
              </h2>
              <ul className="space-y-2">
                {mission.persyaratan.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[var(--color-success)] flex items-center justify-center shrink-0">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-[14px] md:text-[15px] text-[var(--color-text-secondary)] leading-snug">
                      {req}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Registered volunteers */}
          <section className={DETAIL_SECTION_CLASS}>
            <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-3">
              Relawan Terdaftar
            </h2>
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-4">
              {mission.registration_count > 0 ? (
                <RegisteredAvatars count={mission.registration_count} />
              ) : (
                <p className="text-[13px] text-[var(--color-text-secondary)]">
                  Belum ada relawan yang mendaftar.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] shadow-lg py-4 z-20">
        <div className={`${MISSION_DETAIL_CONTAINER} flex flex-col md:flex-row md:items-center gap-2 md:gap-4`}>
          {actionError && (
            <p className="text-[var(--color-danger)] text-[13px] text-center md:text-left md:flex-1">{actionError}</p>
          )}

          {mission.status === "Selesai" ? (
            <Button variant="outline" fullWidth disabled className="md:w-[320px] md:ml-auto">
              Misi Selesai
            </Button>
          ) : mission.registered ? (
            <Button
              variant="outline"
              fullWidth
              className="md:w-[320px] md:ml-auto"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              {actionLoading ? "Membatalkan…" : "Batalkan Pendaftaran"}
            </Button>
          ) : mission.status === "Penuh" ? (
            <Button variant="primary" fullWidth disabled className="md:w-[320px] md:ml-auto">
              Kuota Penuh
            </Button>
          ) : (
            <Button
              variant="primary"
              fullWidth
              className="md:w-[320px] md:ml-auto"
              onClick={handleRegister}
              disabled={actionLoading}
            >
              {actionLoading ? "Mendaftar…" : "Daftar Misi Ini"}
            </Button>
          )}

          {mission.status === "Terbuka" && !mission.registered && (
            <p className="text-[12px] text-[var(--color-text-tertiary)] text-center md:text-left md:flex-1 md:order-first">
              {slotsLeft} tempat tersisa · Tutup {formatDate(mission.tanggal_mulai)}
            </p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
