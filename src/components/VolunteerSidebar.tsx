"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../utils/supabase/client";

type VolunteerProfile = {
  id: string;
  email: string | null;
  role: string | null;
  nama: string | null;
  nim: string | null;
  no_hp: string | null;
};

type ProfileResponse = {
  user?: VolunteerProfile;
};

type VolunteerMenuItem = {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
};

type VolunteerSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const sidebarId = "volunteer-navigation-drawer";

const menuItems: VolunteerMenuItem[] = [
  {
    label: "Beranda",
    href: "/dashboard",
    isActive: (pathname) => pathname === "/dashboard",
  },
  {
    label: "Buat Laporan",
    href: "/report/step1",
    isActive: (pathname) =>
      pathname === "/report" || pathname.startsWith("/report/step") || pathname === "/report/success",
  },
  {
    label: "Riwayat Laporan",
    href: "/report/history",
    isActive: (pathname) =>
      pathname === "/report/history" || /^\/report\/(?!step|history|success)[^/]+$/.test(pathname),
  },
  {
    label: "Misi Bencana",
    href: "/misi",
    isActive: (pathname) => pathname === "/misi" || pathname.startsWith("/misi/"),
  },
  {
    label: "Berita Bencana",
    href: "/berita",
    isActive: (pathname) => pathname === "/berita" || pathname.startsWith("/berita/"),
  },
  {
    label: "Notifikasi",
    href: "/notifikasi",
    isActive: (pathname) => pathname === "/notifikasi" || pathname.startsWith("/notifikasi/"),
  },
  {
    label: "Keamanan",
    href: "/security",
    isActive: (pathname) => pathname === "/security",
  },
];

function getInitials(profile: VolunteerProfile | null) {
  const source = profile?.nama || profile?.email || "Relawan";
  const words = source
    .replace(/@.+$/, "")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "R";
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function getDisplayName(profile: VolunteerProfile | null) {
  return profile?.nama || profile?.email || "Relawan Astacala";
}

function parseProfileResponse(data: unknown): VolunteerProfile | null {
  if (!data || typeof data !== "object" || !("user" in data)) return null;

  const user = (data as ProfileResponse).user;
  if (!user || typeof user !== "object") return null;

  return {
    id: String(user.id ?? ""),
    email: user.email ?? null,
    role: user.role ?? null,
    nama: user.nama ?? null,
    nim: user.nim ?? null,
    no_hp: user.no_hp ?? null,
  };
}

export function VolunteerSidebar({ open, onClose }: VolunteerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const initials = useMemo(() => getInitials(profile), [profile]);
  const displayName = useMemo(() => getDisplayName(profile), [profile]);
  const subtitle = profile?.role ? `Tanggap Bencana - ${profile.role}` : "Tanggap Bencana - Tel-U";

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoadingProfile(true);

      try {
        const response = await fetch("/api/me");
        const data: unknown = await response.json().catch(() => null);

        if (!cancelled && response.ok) {
          setProfile(parseProfileResponse(data));
        }
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  async function handleLogout() {
    if (logoutLoading) return;

    setLogoutLoading(true);
    setLogoutError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setLogoutError(error.message || "Gagal keluar dari akun.");
      setLogoutLoading(false);
      return;
    }

    onClose();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        aria-label="Tutup menu navigasi"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        className={`fixed inset-0 z-40 bg-black/35 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        id={sidebarId}
        role="dialog"
        aria-label="Menu navigasi relawan"
        aria-modal={open}
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-[min(78vw,320px)] flex-col bg-white shadow-[-12px_0_32px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-[92px] items-center justify-between border-b border-[var(--color-border)] px-6">
          <div className="flex items-center gap-2">
            <div
              className="h-[34px] w-[34px] overflow-hidden rounded-full border border-white shadow-sm"
              style={{
                background: "linear-gradient(135deg, var(--color-secondary) 0 50%, var(--color-success) 50% 100%)",
              }}
            />
            <span className="text-[15px] font-bold text-[var(--color-text-primary)]">ASTACALA</span>
          </div>

          <button
            type="button"
            aria-label="Tutup menu"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[28px] leading-none text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-page)]"
          >
            &times;
          </button>
        </div>

        <div className="bg-[var(--color-primary)] px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-[#E0E0E0] text-[18px] font-semibold text-[var(--color-text-secondary)]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[18px] font-semibold leading-tight text-white">
                {loadingProfile ? "Memuat profil..." : displayName}
              </p>
              <p className="mt-2 truncate text-[12px] font-medium text-white/45">{subtitle}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-7 py-8" aria-label="Navigasi relawan">
          <div className="space-y-5">
            {menuItems.map((item) => {
              const active = item.isActive(pathname);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`flex min-h-8 items-center gap-4 text-[20px] font-semibold leading-tight transition-colors ${
                    active ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-5 w-5 shrink-0 rounded-full ${active ? "bg-[var(--color-primary)]" : "bg-[#8A8A8A]"}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 border-t border-[var(--color-border)] pt-6">
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="flex min-h-8 w-full items-center gap-4 text-left text-[20px] font-semibold leading-tight text-[var(--color-primary)] transition-opacity disabled:opacity-60"
            >
              <span aria-hidden="true" className="h-5 w-5 shrink-0 rounded-full bg-[var(--color-primary)]" />
              <span>{logoutLoading ? "Keluar..." : "Logout"}</span>
            </button>
            {logoutError && <p className="mt-3 text-[12px] leading-relaxed text-[var(--color-primary)]">{logoutError}</p>}
          </div>
        </nav>
      </aside>
    </>
  );
}

export { sidebarId as volunteerSidebarId };
