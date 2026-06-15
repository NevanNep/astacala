"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { AlertBanner } from "../../components/AlertBanner";
import { SectionHeader } from "../../components/SectionHeader";
import { NotificationItem } from "../../components/NotificationItem";
import { SectionDivider } from "../../components/SectionDivider";
import { MissionCard } from "../../components/MissionCard";
import { NewsCard } from "../../components/NewsCard";
import { Footer } from "../../components/Footer";
import Link from "next/link";

interface DashboardMission {
  id: string;
  judul: string;
  lokasi: string;
  tanggal_mulai: string | null;
  kuota: number;
  status: "Terbuka" | "Penuh" | "Selesai";
  registration_count: number;
}

interface DashboardProfile {
  nama: string | null;
  email: string | null;
}

interface DashboardNotification {
  id: string;
  type: string | null;
  judul: string | null;
  pesan: string | null;
  dibaca: boolean;
  created_at: string;
}

interface DashboardNews {
  id: string;
  judul: string | null;
  kategori: string | null;
  lokasi: string | null;
  created_at: string | null;
  image_url: string | null;
  konten: string | null;
  terverifikasi: boolean | null;
}

function formatMissionDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatRelativeTime(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = Date.now() - date.getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1000));
  if (seconds < 60) return `${Math.max(1, seconds)} Detik lalu`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} Menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} Jam lalu`;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi,";
  if (hour < 15) return "Selamat siang,";
  if (hour < 18) return "Selamat sore,";
  return "Selamat malam,";
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "RL";
}

function getNotificationColor(notification: DashboardNotification) {
  if (!notification.dibaca) return "var(--color-primary)";
  if (notification.type === "misi_baru") return "var(--color-secondary)";
  if (notification.type === "laporan_ditolak") return "var(--color-danger)";
  return "var(--color-success)";
}

function truncate(value: string | null, maxLength = 120) {
  const text = value?.trim() ?? "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function MissionSkeleton({ item }: { item: number }) {
  return (
    <div
      key={item}
      className="h-[174px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 shadow-md animate-pulse"
    >
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="mt-3 h-3 w-24 rounded bg-gray-100" />
      <div className="mt-8 h-3 w-28 rounded bg-gray-100" />
      <div className="mt-3 h-8 w-20 rounded bg-gray-200 ml-auto" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [news, setNews] = useState<DashboardNews[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [missions, setMissions] = useState<DashboardMission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await fetch("/api/me");
        const data: { user?: DashboardProfile } = await res.json().catch(() => ({}));

        if (cancelled) return;
        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        setProfile(data.user ?? null);
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      try {
        const res = await fetch("/api/notifikasi?limit=3");
        const data: { notifications?: DashboardNotification[] } = await res.json().catch(() => ({}));
        console.log("[Dashboard] Received notifications:", data.notifications);

        if (cancelled) return;
        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        const safeNotifications = (data.notifications ?? []).map((item: any) => ({
          id: String(item.id || ""),
          type: item.type || "pengumuman",
          judul: item.judul || "Notifikasi",
          pesan: item.pesan || "",
          dibaca: !!item.dibaca,
          created_at: item.created_at || new Date().toISOString(),
        })).filter(n => n.id);

        setNotifications(res.ok ? safeNotifications : []);
      } catch (err) {
        console.error("[Dashboard] Load notifications error:", err);
        if (cancelled) return;
        setNotifications([]);
      } finally {
        if (!cancelled) setNotificationsLoading(false);
      }
    };

    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const loadNews = async () => {
      try {
        const res = await fetch("/api/berita?limit=4");
        const data: { berita?: DashboardNews[] } = await res.json().catch(() => ({}));
        if (!cancelled) setNews(res.ok ? data.berita ?? [] : []);
      } catch {
        if (!cancelled) setNews([]);
      } finally {
        if (!cancelled) setNewsLoading(false);
      }
    };

    loadNews();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadMissions = async () => {
      try {
        const res = await fetch("/api/misi");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) return;
        const data: { missions?: DashboardMission[] } = await res.json();
        if (!cancelled) setMissions(data.missions ?? []);
      } catch {
        if (!cancelled) setMissions([]);
      } finally {
        if (!cancelled) setMissionsLoading(false);
      }
    };

    loadMissions();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const dashboardMissions = missions
    .filter((mission) => mission.status !== "Selesai")
    .slice(0, 2);
  const latestNews = news[0];
  const otherNews = news.slice(1, 4);
  const profileName = profile?.nama || profile?.email || "Relawan";
  const initials = getInitials(profileName);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-default)]">
      <Navbar variant="authenticated" />

      <main className="w-full pb-10 md:pb-12">
        <section className="bg-[var(--color-primary)] w-full py-6 md:py-8 px-4 md:px-6 lg:px-8 relative flex flex-col items-center">
          <div className="w-full max-w-[1200px]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <span className="text-[20px] md:text-[24px] text-white leading-tight">
                  {getGreeting()}
                </span>
                <span className="text-[20px] md:text-[24px] font-bold text-white leading-tight">
                  {profileLoading ? "Memuat profil..." : profileName}
                </span>
              </div>
              <div className="w-[52px] h-[52px] md:w-[60px] md:h-[60px] bg-white rounded-full flex items-center justify-center shrink-0">
                <span className="text-[20px] md:text-[22px] font-medium text-[var(--color-text-primary)]">
                  {profileLoading ? "" : initials}
                </span>
              </div>
            </div>

            <Link href="/report/step1">
              <button className="w-full bg-white rounded-[20px] p-4 md:p-5 shadow-sm active:scale-[0.98] transition-all flex items-center gap-4 text-left group">
                <div className="w-[64px] h-[64px] bg-[#B22222] rounded-[16px] shrink-0 flex items-center justify-center text-black/80 group-hover:bg-[#A01D1D] transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex flex-col flex-1 pr-2">
                  <span className="text-[16px] md:text-[18px] font-semibold text-[#B22222] mb-0.5">
                    Buat Laporan Bencana
                  </span>
                  <span className="text-[13px] md:text-[14px] leading-tight text-gray-500 max-w-[200px] md:max-w-none">
                    Laporkan kondisi darurat dari lapangan
                  </span>
                </div>
              </button>
            </Link>
          </div>
        </section>

        <div className="w-full">
          <AlertBanner
            variant="siaga"
            text={latestNews ? `${latestNews.kategori ?? "Info"}: ${latestNews.judul ?? "Berita terbaru"}` : "Belum ada berita terverifikasi terbaru"}
            actionText="Info >"
            onAction={() => document.getElementById("berita")?.scrollIntoView({ behavior: "smooth" })}
          />
        </div>

        <div className="w-full space-y-6 md:space-y-8 mt-6 md:mt-8">
          <section id="notifikasi" className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <SectionHeader title="Notifikasi Terbaru" actionText="Semua" href="/notifikasi" />
            <div className="flex flex-col mt-2">
              {notificationsLoading ? (
                <div className="rounded-[8px] bg-white px-4 py-8 text-center text-[13px] text-[var(--color-text-secondary)]">
                  Memuat notifikasi...
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    title={notification.judul || notification.pesan || "Notifikasi Astacala"}
                    time={formatRelativeTime(notification.created_at)}
                    circleColor={getNotificationColor(notification)}
                    isLast={index === notifications.length - 1}
                  />
                ))
              ) : (
                <div className="rounded-[8px] bg-white px-4 py-8 text-center text-[13px] text-[var(--color-text-secondary)]">
                  Belum ada notifikasi.
                </div>
              )}
            </div>
          </section>

          <SectionDivider />

          <section className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-4 md:p-6">
              <SectionHeader title="Misi Aktif" actionText="Semua" href="/misi" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                {missionsLoading ? (
                  [1, 2].map((item) => <MissionSkeleton key={item} item={item} />)
                ) : dashboardMissions.length > 0 ? (
                  dashboardMissions.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      title={mission.judul}
                      location={mission.lokasi}
                      status={mission.status === "Penuh" ? "penuh" : "terbuka"}
                      startDate={formatMissionDate(mission.tanggal_mulai)}
                      volunteers={`${mission.registration_count}/${mission.kuota}`}
                      actionHref={`/misi/${mission.id}`}
                    />
                  ))
                ) : (
                  <div className="md:col-span-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 text-center text-[13px] text-[var(--color-text-secondary)]">
                    Belum ada misi aktif saat ini.
                  </div>
                )}
              </div>
            </div>
          </section>

          <SectionDivider />

          <section id="berita" className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-6">
              <SectionHeader title="Berita Bencana Terkini" actionText="Semua" href="/berita" />
            </div>

            {newsLoading ? (
              <div className="rounded-[8px] bg-white px-4 py-8 text-center text-[13px] text-[var(--color-text-secondary)]">
                Memuat berita...
              </div>
            ) : latestNews ? (
              <div className="flex flex-col">
                <NewsCard
                  variant="featured"
                  title={latestNews.judul ?? "Berita Astacala"}
                  description={truncate(latestNews.konten)}
                  category={latestNews.kategori ?? "Info"}
                  location={latestNews.lokasi ?? undefined}
                  time={formatRelativeTime(latestNews.created_at)}
                  verified={Boolean(latestNews.terverifikasi)}
                  imageUrl={latestNews.image_url}
                  href={`/berita/${latestNews.id}`}
                />

                {otherNews.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mt-6 flex flex-col gap-4">
                    {otherNews.map((item) => (
                      <NewsCard
                        key={item.id}
                        variant="small"
                        title={item.judul ?? "Berita Astacala"}
                        category={item.kategori ?? "Info"}
                        time={formatRelativeTime(item.created_at)}
                        verified={Boolean(item.terverifikasi)}
                        imageUrl={item.image_url}
                        href={`/berita/${item.id}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-[8px] bg-white px-4 py-8 text-center text-[13px] text-[var(--color-text-secondary)]">
                Belum ada berita bencana terverifikasi.
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
