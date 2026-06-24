"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNewsListItem } from "./types";
import {
  ActionToast,
  ConfirmModal,
  NewsListCard,
  PublishSuccessModal,
} from "./admin-berita-ui";

export function BeritaListClient({
  initialNews,
}: {
  initialNews: AdminNewsListItem[];
}) {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handlePublishClick = async (id: string) => {
    if (processingId) return;
    setProcessingId(id);

    try {
      const response = await fetch(`/api/admin/berita/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ terverifikasi: true }),
      });

      if (!response.ok) {
        if (response.status === 401) router.push("/login");
        else if (response.status === 403) router.push("/dashboard");
        else setErrorMessage("Gagal mempublikasikan berita.");
        return;
      }

      setShowSuccess(true);
      router.refresh();
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    const id = pendingDeleteId;
    if (!id || processingId) return;

    setProcessingId(id);

    try {
      const response = await fetch(`/api/admin/berita/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        if (response.status === 401) router.push("/login");
        else if (response.status === 403) router.push("/dashboard");
        else setErrorMessage("Gagal menghapus berita.");
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setProcessingId(null);
      setPendingDeleteId(null);
    }
  };

  return (
    <>
      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 xl:grid-cols-3">
        {initialNews.map((news) => (
          <NewsListCard
            key={news.id}
            news={news}
            onPublishClick={handlePublishClick}
            onDeleteClick={(id) => setPendingDeleteId(id)}
          />
        ))}
      </div>

      <PublishSuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      <ConfirmModal
        isOpen={pendingDeleteId !== null}
        title="Hapus berita ini?"
        description="Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        loading={processingId !== null && processingId === pendingDeleteId}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (processingId) return;
          setPendingDeleteId(null);
        }}
      />

      <ActionToast
        message={errorMessage}
        variant="error"
        onClose={() => setErrorMessage(null)}
      />
    </>
  );
}
