"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminMissionDetail } from "./types";
import { normalizeMissionStatus } from "./types";

function getApiError(value: unknown) {
  if (value && typeof value === "object" && "error" in value) {
    const message = (value as { error?: unknown }).error;
    return typeof message === "string" ? message : null;
  }

  return null;
}

export function MissionDetailActions({ mission }: { mission: AdminMissionDetail }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const status = normalizeMissionStatus(mission.status);
  const canCloseRegistration = status === "Terbuka";
  const isCompleted = status === "Selesai";

  const closeRegistration = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/misi/${encodeURIComponent(mission.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Penuh" }),
      });
      const data: unknown = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        setMessage(getApiError(data) ?? "Pendaftaran belum dapat ditutup.");
        return;
      }

      router.refresh();
    } catch {
      setMessage("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => router.push(`/admin/misi/${encodeURIComponent(mission.id)}/edit`)}
          disabled={loading || isCompleted}
          className="flex h-[50px] items-center justify-center rounded-[8px] border border-[#7A7A7A] bg-white px-5 text-[14px] font-extrabold text-[#777777] transition hover:border-[#D3262E] hover:text-[#D3262E] disabled:cursor-not-allowed disabled:opacity-55 md:h-[56px] md:text-[16px]"
        >
          Edit Misi
        </button>
        <button
          type="button"
          onClick={closeRegistration}
          disabled={loading || !canCloseRegistration}
          className="flex h-[50px] items-center justify-center rounded-[8px] bg-[#FF1010] px-5 text-[14px] font-extrabold text-white transition hover:bg-[#D3262E] disabled:cursor-not-allowed disabled:opacity-55 md:h-[56px] md:text-[16px]"
        >
          {loading ? "Menutup..." : canCloseRegistration ? "Tutup Pendaftaran" : "Pendaftaran Ditutup"}
        </button>
      </div>
      {message ? (
        <p className="mt-4 rounded-[8px] border border-[#FF5B62] bg-white px-4 py-3 text-[13px] font-semibold text-[#D3262E]">
          {message}
        </p>
      ) : null}
    </div>
  );
}
