"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AdminNewsListItem, normalizeBeritaStatus } from "./types";
import { formatMissionDate } from "../../misi/_components/admin-mission-ui"; // Reusing date formatter

export function StatusBadge({ status }: { status: "Draft" | "Publik" }) {
  const className =
    status === "Draft"
      ? "bg-[#FFEBC7] text-[#F2A21A]"
      : "bg-[#CFE8D2] text-[#2E7D32]";

  return (
    <span className={`inline-flex min-w-[68px] items-center justify-center rounded-full px-4 py-2 text-[12px] font-bold ${className}`}>
      {status}
    </span>
  );
}

export function NewsListCard({
  news,
  onPublishClick,
  onDeleteClick,
}: {
  news: AdminNewsListItem;
  onPublishClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
}) {
  const status = normalizeBeritaStatus(news.terverifikasi);
  const isDraft = status === "Draft";

  return (
    <article className="rounded-[8px] border border-[#747474] bg-white p-4 transition hover:border-[#D3262E] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className="flex min-h-[58px] items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="break-words text-[16px] font-extrabold leading-tight text-[#202124] md:text-[20px]">
            {news.judul || "Tanpa Judul"}
          </h3>
          <p className="mt-1 break-words text-[11px] font-semibold leading-tight text-[#777777] md:text-[13px]">
            {news.kategori}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 flex flex-col gap-1 text-[11px] font-semibold leading-tight text-[#202124] md:text-[13px]">
        <div className="flex items-center gap-1">
          <span className="text-[#D3262E]">&#128205;</span> {news.lokasi || "-"}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#2B60D4]">&#128100;</span> Pusat Kendali
        </div>
      </div>

      <p className="mt-3 text-[10px] font-semibold text-[#777777] md:text-[12px]">
        {formatMissionDate(news.created_at)}
      </p>

      <div className="mt-4 flex items-center gap-2">
        {isDraft ? (
          <>
            <button
              onClick={() => onPublishClick(news.id)}
              className="flex h-[32px] flex-1 items-center justify-center rounded-full bg-[#D3262E] text-[12px] font-bold text-white transition hover:bg-[#B71C1C] md:h-10 md:text-[13px]"
            >
              Publikasi
            </button>
            <Link
              href={`/admin/berita/${encodeURIComponent(news.id)}/edit`}
              className="flex h-[32px] flex-1 items-center justify-center rounded-full border border-[#7A7A7A] bg-white text-[12px] font-bold text-[#202124] transition hover:border-[#D3262E] hover:text-[#D3262E] md:h-10 md:text-[13px]"
            >
              Edit
            </Link>
          </>
        ) : (
          <Link
            href={`/admin/berita/${encodeURIComponent(news.id)}/edit`}
            className="flex h-[32px] flex-1 items-center justify-center rounded-full border border-[#7A7A7A] bg-white text-[12px] font-bold text-[#202124] transition hover:border-[#D3262E] hover:text-[#D3262E] md:h-10 md:text-[13px]"
          >
            Edit
          </Link>
        )}
        <button
          onClick={() => onDeleteClick(news.id)}
          className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[6px] border border-[#7A7A7A] bg-white transition hover:border-[#D3262E] hover:text-[#D3262E] md:h-10 md:w-10"
          aria-label="Hapus berita"
        >
          {/* Simple trash icon SVG */}
          <svg
            width="16"
            height="18"
            viewBox="0 0 16 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 md:h-5 md:w-5"
          >
            <path
              d="M3 18C2.45 18 1.97933 17.8043 1.588 17.413C1.19667 17.0217 1 16.551 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8043 17.021 14.413 17.413C14.0217 17.8043 13.551 18 13 18H3ZM13 3H3V16H13V3ZM5 14H7V5H5V14ZM9 14H11V5H9V14Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </article>
  );
}

export function ActionToast({
  message,
  variant = "error",
  onClose,
}: {
  message: string | null;
  variant?: "error" | "success";
  onClose: () => void;
}) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const accent = variant === "error" ? "#D3262E" : "#2E7D32";

  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[360px] -translate-x-1/2 rounded-[12px] border bg-white px-4 py-3 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
      style={{ borderColor: accent }}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-[2px] inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <p className="flex-1 text-[13px] font-semibold leading-snug text-[#202124]">
          {message}
        </p>
        <button
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="shrink-0 text-[16px] leading-none text-[#777777] transition hover:text-[#202124]"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Hapus",
  loading = false,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[340px] rounded-[16px] bg-white p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="mb-3 text-[20px] font-extrabold text-[#202124]">{title}</h2>
        {description ? (
          <p className="mb-6 text-[13px] font-semibold text-[#777777]">{description}</p>
        ) : (
          <div className="mb-6" />
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-11 flex-1 rounded-[12px] border border-[#7A7A7A] bg-white text-[15px] font-extrabold text-[#202124] transition hover:border-[#D3262E] hover:text-[#D3262E] disabled:opacity-60"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="h-11 flex-1 rounded-[12px] bg-[#D3262E] text-[15px] font-extrabold text-white transition hover:bg-[#B71C1C] disabled:opacity-60"
          >
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PublishSuccessModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[320px] rounded-[16px] bg-white p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FA777D]">
          {/* Check icon */}
          <svg
            width="40"
            height="30"
            viewBox="0 0 24 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#202124]"
          >
            <path
              d="M2.5 9L8.5 15L21.5 2"
              stroke="black"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mb-6 text-[22px] font-extrabold text-[#202124]">
          Publikasi Berhasil
        </h2>
        <button
          onClick={onClose}
          className="h-11 w-full rounded-[12px] bg-[#FA777D] text-[16px] font-extrabold text-white transition hover:bg-[#D3262E]"
        >
          Ok
        </button>
      </div>
    </div>
  );
}
