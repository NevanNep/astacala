"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";

type NotificationType =
  | "laporan_diterima"
  | "laporan_ditolak"
  | "misi_baru"
  | "pengumuman"
  | string;

interface NotificationItem {
  id: string;
  user_id: string | null;
  type: NotificationType | null;
  judul: string | null;
  pesan: string | null;
  laporan_id: string | null;
  misi_id: string | null;
  dibaca: boolean;
  created_at: string;
}

interface NotificationGroup {
  label: string;
  items: NotificationItem[];
}

type ApiError = {
  error?: string;
};

type NotificationsResponse = {
  notifications?: NotificationItem[];
};

const NOTIFICATION_CONTAINER = "w-full max-w-[860px] mx-auto px-4 md:px-8";
const INITIAL_LIMIT = 20;
const PAGE_SIZE = 20;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(from: Date, to: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / msPerDay);
}

function formatGroupLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak diketahui";

  const diff = daysBetween(date, new Date());
  if (diff === 0) return "Hari Ini";
  if (diff === 1) return "Kemarin";
  if (diff > 1 && diff <= 6) return `${diff} hari lalu`;

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatClock(date: Date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSeconds < 60) return `${Math.max(1, diffSeconds)} Detik lalu`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} Menit lalu`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} Jam lalu`;

  return `${date.getDate()} ${MONTHS[date.getMonth()]} - ${formatClock(date)}`;
}

function groupNotifications(notifications: NotificationItem[]): NotificationGroup[] {
  return notifications.reduce<NotificationGroup[]>((groups, notification) => {
    const label = formatGroupLabel(notification.created_at);
    const existing = groups.find((group) => group.label === label);

    if (existing) {
      existing.items.push(notification);
      return groups;
    }

    groups.push({ label, items: [notification] });
    return groups;
  }, []);
}

function notificationHref(notification: NotificationItem) {
  if (notification.laporan_id) return `/report/${encodeURIComponent(notification.laporan_id)}`;
  if (notification.misi_id) return `/misi/${encodeURIComponent(notification.misi_id)}`;
  return null;
}

function iconColors(type: NotificationType | null) {
  if (type === "misi_baru") {
    return {
      bg: "bg-[var(--color-secondary-light)]",
      icon: "bg-[var(--color-secondary)]",
    };
  }

  if (type === "laporan_ditolak") {
    return {
      bg: "bg-[var(--color-danger-light)]",
      icon: "bg-[var(--color-danger)]",
    };
  }

  return {
    bg: "bg-[var(--color-success-light)]",
    icon: "bg-[var(--color-success)]",
  };
}

function parseNotifications(data: unknown): NotificationItem[] {
  if (!data || typeof data !== "object" || !("notifications" in data)) {
    console.log("[Notifications Page] Invalid data structure:", data);
    return [];
  }

  const notifications = (data as NotificationsResponse).notifications;
  if (!Array.isArray(notifications)) {
    console.log("[Notifications Page] notifications is not an array:", notifications);
    return [];
  }

  return notifications.map((item: any) => {
    // Ensure essential fields exist, provide defaults for others
    return {
      id: String(item.id || ""),
      user_id: item.user_id || null,
      type: item.type || "pengumuman",
      judul: item.judul || "Notifikasi",
      pesan: item.pesan || "",
      laporan_id: item.laporan_id || null,
      misi_id: item.misi_id || null,
      dibaca: !!item.dibaca,
      created_at: item.created_at || new Date().toISOString(),
    };
  }).filter(item => item.id);
}

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "error" in data) {
    const message = (data as ApiError).error;
    if (message) return message;
  }

  return fallback;
}

function NotificationIcon({ type }: { type: NotificationType | null }) {
  const colors = iconColors(type);

  return (
    <span className={`flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full ${colors.bg}`}>
      <span className={`flex h-7 w-7 items-center justify-center rounded-[4px] ${colors.icon} text-white`}>
        {type === "misi_baru" ? (
          <span className="h-3 w-3 rounded-full bg-white" aria-hidden="true" />
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-white"
          >
            <path
              d="M5 12.5L9.2 16.5L19 7"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </span>
  );
}

function NotificationRow({
  notification,
  disabled,
  onOpen,
}: {
  notification: NotificationItem;
  disabled: boolean;
  onOpen: (notification: NotificationItem) => void;
}) {
  const unread = !notification.dibaca;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onOpen(notification)}
      className={`group flex w-full items-start gap-3 border-b border-[#AFAFAF] px-4 py-4 text-left transition-colors md:gap-4 md:px-6 ${
        unread ? "bg-[var(--color-warning-light)]" : "bg-white hover:bg-[var(--color-bg-muted)]"
      } disabled:cursor-wait disabled:opacity-70`}
    >
      <NotificationIcon type={notification.type} />

      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-[var(--color-text-primary)] md:text-[16px]">
            {notification.judul || "Notifikasi Astacala"}
          </span>
          {unread && (
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-primary)]" aria-label="Belum dibaca" />
          )}
        </span>

        {notification.pesan && (
          <span className="mt-1 block text-[12px] leading-snug text-[var(--color-text-secondary)] md:text-[13px]">
            {notification.pesan}
          </span>
        )}

        <span className="mt-3 block text-[12px] font-medium text-[var(--color-text-tertiary)]">
          {formatNotificationTime(notification.created_at)}
        </span>
      </span>
    </button>
  );
}

function LoadingRows() {
  return (
    <div className="overflow-hidden border-y border-[#AFAFAF] bg-white">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex items-start gap-4 border-b border-[var(--color-border)] px-4 py-4 md:px-6">
          <div className="h-[56px] w-[56px] shrink-0 animate-pulse rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.dibaca).length,
    [notifications]
  );
  const groups = useMemo(() => groupNotifications(notifications), [notifications]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const response = await fetch(`/api/notifikasi?limit=${limit}`);
        const data: unknown = await response.json().catch(() => null);
        console.log("[Notifications Page] Received data:", data);

        if (cancelled) return;

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          setError(getErrorMessage(data, "Gagal memuat notifikasi."));
          return;
        }

        const nextNotifications = parseNotifications(data);
        setNotifications(nextNotifications);
        setHasMore(nextNotifications.length >= limit);
        setError(null);
      } catch {
        if (!cancelled) {
          setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [limit, refreshKey, router]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setRefreshKey((current) => current + 1);
  };

  const markNotificationRead = async (notification: NotificationItem) => {
    if (notification.dibaca) return true;

    const response = await fetch(`/api/notifikasi/${encodeURIComponent(notification.id)}/read`, {
      method: "PATCH",
    });
    const data: unknown = await response.json().catch(() => null);

    if (response.status === 401) {
      router.replace("/login");
      return false;
    }

    if (!response.ok) {
      setActionError(getErrorMessage(data, "Gagal menandai notifikasi sebagai dibaca."));
      return false;
    }

    setNotifications((current) =>
      current.map((item) => (item.id === notification.id ? { ...item, dibaca: true } : item))
    );
    return true;
  };

  const handleMarkAllRead = async () => {
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    setActionError(null);

    try {
      const response = await fetch("/api/notifikasi/read-all", { method: "PATCH" });
      const data: unknown = await response.json().catch(() => null);

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        setActionError(getErrorMessage(data, "Gagal menandai semua notifikasi sebagai dibaca."));
        return;
      }

      setNotifications((current) => current.map((notification) => ({ ...notification, dibaca: true })));
    } catch {
      setActionError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteAll = async () => {
    if (deletingAll || notifications.length === 0) return;
    if (!window.confirm("Hapus semua notifikasi?")) return;

    setDeletingAll(true);
    setActionError(null);

    try {
      const response = await fetch("/api/notifikasi", { method: "DELETE" });
      const data: unknown = await response.json().catch(() => null);

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        setActionError(getErrorMessage(data, "Gagal menghapus notifikasi."));
        return;
      }

      setNotifications([]);
      setHasMore(false);
    } catch {
      setActionError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setDeletingAll(false);
    }
  };

  const handleOpenNotification = async (notification: NotificationItem) => {
    if (openingId) return;

    setOpeningId(notification.id);
    setActionError(null);

    try {
      const marked = await markNotificationRead(notification);
      if (!marked) return;

      const href = notificationHref(notification);
      if (href) {
        router.push(href);
      }
    } catch {
      setActionError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setOpeningId(null);
    }
  };

  const handleLoadMore = () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setLimit((current) => current + PAGE_SIZE);
  };

  const initialLoading = loading && notifications.length === 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)]">
      <Navbar
        variant="flow"
        showBack
        title="Notifikasi"
        backHref="/dashboard"
        containerClassName="max-w-[860px]"
        rightElement={
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markingAll || unreadCount === 0}
            className="whitespace-nowrap text-[12px] font-semibold text-[var(--color-primary)] transition-opacity disabled:opacity-45 md:text-[13px]"
          >
            {markingAll ? "Memproses..." : "Tandai Semua Baca"}
          </button>
        }
      />

      <main className="w-full pb-12 md:pb-16">
        <section className={`${NOTIFICATION_CONTAINER} pt-4 md:pt-6`}>
          <div className="flex min-h-[40px] items-center justify-between gap-4 border-b border-[#AFAFAF] pb-3">
            <p className="text-[14px] font-semibold text-[var(--color-text-secondary)] md:text-[15px]">
              {unreadCount} Belum Dibaca
            </p>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={deletingAll}
                className="whitespace-nowrap text-[12px] font-semibold text-[var(--color-primary)] transition-opacity disabled:opacity-45 md:text-[13px]"
              >
                {deletingAll ? "Menghapus..." : "Hapus Semua >"}
              </button>
            )}
          </div>

          {actionError && (
            <div className="mt-3 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-[var(--color-danger)]">
              {actionError}
            </div>
          )}
        </section>

        {initialLoading ? (
          <section className={`${NOTIFICATION_CONTAINER} mt-4`}>
            <LoadingRows />
          </section>
        ) : error ? (
          <section className={`${NOTIFICATION_CONTAINER} mt-4`}>
            <div className="rounded-[8px] border border-red-200 bg-white px-4 py-10 text-center">
              <p className="text-[14px] text-[var(--color-danger)]">{error}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-4 rounded-full bg-[var(--color-primary)] px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
              >
                Coba Lagi
              </button>
            </div>
          </section>
        ) : notifications.length === 0 ? (
          <section className={`${NOTIFICATION_CONTAINER} mt-4`}>
            <div className="bg-white px-4 py-16 text-center">
              <div className="mx-auto flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[var(--color-bg-muted)]">
                <span className="h-3 w-3 rounded-full bg-[var(--color-text-tertiary)]" aria-hidden="true" />
              </div>
              <p className="mt-4 text-[14px] font-semibold text-[var(--color-text-secondary)]">
                Belum ada notifikasi
              </p>
            </div>
          </section>
        ) : (
          <section className="mt-3 md:mt-5">
            {groups.map((group) => (
              <div key={group.label}>
                <div className="w-full bg-[var(--color-bg-page)]">
                  <div className={`${NOTIFICATION_CONTAINER} py-3`}>
                    <h2 className="text-[15px] font-semibold text-[var(--color-text-secondary)]">
                      {group.label}
                    </h2>
                  </div>
                </div>

                <div className={NOTIFICATION_CONTAINER}>
                  <div className="overflow-hidden border-x border-[#D8D8D8] bg-white md:rounded-[8px] md:border-t">
                    {group.items.map((notification) => (
                      <NotificationRow
                        key={notification.id}
                        notification={notification}
                        disabled={openingId === notification.id}
                        onOpen={handleOpenNotification}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className={NOTIFICATION_CONTAINER}>
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full bg-white px-4 py-4 text-center text-[13px] font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-bg-muted)] disabled:opacity-50"
                >
                  {loading ? "Memuat..." : "Lihat notifikasi lebih lama >"}
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
