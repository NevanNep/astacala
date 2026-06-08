"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../utils/supabase/client";

type AdminProfile = {
  id: string;
  email: string | null;
  role: string | null;
  nama: string | null;
};

type ProfileResponse = {
  user?: AdminProfile;
};

type AdminMenuItem = {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
};

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const sidebarId = "admin-navigation-drawer";

const menuItems: AdminMenuItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    isActive: (pathname) => pathname === "/admin/dashboard",
  },
  {
    label: "Laporan",
    href: "/admin/laporan",
    isActive: (pathname) => pathname === "/admin/laporan" || pathname.startsWith("/admin/laporan/"),
  },
  {
    label: "Misi",
    href: "/admin/misi",
    isActive: (pathname) => pathname === "/admin/misi" || pathname.startsWith("/admin/misi/"),
  },
  {
    label: "Berita",
    href: "/admin/berita",
    isActive: (pathname) => pathname === "/admin/berita" || pathname.startsWith("/admin/berita/"),
  },
];

function getInitials(profile: AdminProfile | null) {
  const source = profile?.nama || profile?.email || "Admin";
  const words = source
    .replace(/@.+$/, "")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "AD";
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function getDisplayName(profile: AdminProfile | null) {
  return profile?.nama || profile?.email || "Admin Astacala";
}

function parseProfileResponse(data: unknown): AdminProfile | null {
  if (!data || typeof data !== "object" || !("user" in data)) return null;

  const user = (data as ProfileResponse).user;
  if (!user || typeof user !== "object") return null;

  return {
    id: String(user.id ?? ""),
    email: user.email ?? null,
    role: user.role ?? null,
    nama: user.nama ?? null,
  };
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
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
    // Defaulting to /login but checking conventions
    router.replace("/admin/login");
    router.refresh();
    
    // If /admin/login 404s, standard Nextjs handles it gracefully
    // Let's replace to /login actually, since ASTACALA standard is /login for both 
    // unless admin/login is strictly used. I'll use /login to be safe because
    // requireAdminSupabase in page.tsx uses redirect("/login").
  }

  // To match the exact styling requested:
  // - Top profile red/pink like screenshot.
  // - Active menu items: red highlighting.
  // - Close button, hamburger behavior.
  return (
    <>
      {/* Backdrop */}
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
        aria-label="Menu navigasi admin"
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
              className="h-[34px] w-[34px] overflow-hidden rounded-full border border-white shadow-sm bg-[#D3262E]"
            />
            <span className="text-[15px] font-bold text-[#111]">ASTACALA ADMIN</span>
          </div>

          <button
            type="button"
            aria-label="Tutup menu"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[28px] leading-none text-[#111] transition-colors hover:bg-gray-100"
          >
            &times;
          </button>
        </div>

        <div className="bg-[#D3262E] px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-white text-[18px] font-semibold text-[#D3262E]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[18px] font-semibold leading-tight text-white">
                {loadingProfile ? "Memuat profil..." : displayName}
              </p>
              <p className="mt-2 truncate text-[12px] font-medium text-white/70">{subtitle}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-7 py-8" aria-label="Navigasi admin">
          <div className="space-y-5">
            {menuItems.map((item) => {
              const active = item.isActive(pathname);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`flex min-h-8 items-center gap-4 text-[20px] font-semibold leading-tight transition-colors ${
                    active ? "text-[#D3262E]" : "text-[#7A7A7A] hover:text-[#111]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-5 w-5 shrink-0 rounded-full ${active ? "bg-[#D3262E]" : "bg-[#8A8A8A]"}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => {
                // Execute logout without awaiting so we don't hold the UI thread poorly
                void handleLogout();
              }}
              disabled={logoutLoading}
              className="flex min-h-8 w-full items-center gap-4 text-left text-[20px] font-semibold leading-tight text-[#D3262E] transition-opacity disabled:opacity-60"
            >
              <span aria-hidden="true" className="h-5 w-5 shrink-0 rounded-full bg-[#D3262E]" />
              <span>{logoutLoading ? "Keluar..." : "Logout"}</span>
            </button>
            {logoutError && <p className="mt-3 text-[12px] leading-relaxed text-[#D3262E]">{logoutError}</p>}
          </div>
        </nav>
      </aside>
    </>
  );
}
