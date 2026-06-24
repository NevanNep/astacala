"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminHamburgerMenu } from "@/src/components/AdminHamburgerMenu";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";

type TwoFAStatus = {
  enabled: boolean;
  email: string | null;
};

type Step = "idle" | "disabling";

function AstacalaLogo({ size = 52 }: { size?: number }) {
  return (
    <img 
      src="/images/logo-astacala.png" 
      alt="Astacala Logo" 
      style={{ height: size, width: 'auto' }}
      className="shrink-0 object-contain" 
    />
  );
}

export default function AdminSecurityPage() {
  const router = useRouter();
  const [status, setStatus] = useState<TwoFAStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [step, setStep] = useState<Step>("idle");
  const [disableCode, setDisableCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch("/api/auth/2fa/status");
        if (cancelled) return;

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        if (res.ok) {
          const data = (await res.json()) as TwoFAStatus;
          if (!cancelled) setStatus(data);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    }

    fetchStatus();
    return () => { cancelled = true; };
  }, [router, refreshTrigger]);

  function resetForm() {
    setStep("idle");
    setDisableCode("");
    setError("");
    setLoading(false);
  }

  async function handleEnable() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/enable", { method: "POST" });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Gagal mengaktifkan 2FA.");
        return;
      }

      setSuccessMessage("2FA email berhasil diaktifkan untuk akun admin ini.");
      setRefreshTrigger((t) => t + 1);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStartDisable() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/send", { method: "POST" });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim kode verifikasi.");
        return;
      }

      setStep("disabling");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/send", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Gagal mengirim ulang kode.");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setResendLoading(false);
    }
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = disableCode.replace(/\s/g, "");
    if (trimmed.length !== 6 || !/^\d+$/.test(trimmed)) {
      setError("Masukkan 6 digit kode angka.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Gagal menonaktifkan 2FA.");
        return;
      }

      setSuccessMessage("2FA berhasil dinonaktifkan.");
      resetForm();
      setRefreshTrigger((t) => t + 1);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#101010]">
      <header className="sticky top-0 z-20 border-b border-[#E4E4E4] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex h-[106px] max-w-[1180px] items-center justify-between px-8">
          <Link href="/admin/dashboard" className="flex items-center gap-5" aria-label="Kembali ke admin dashboard">
            <AstacalaLogo size={84} />
            <span className="text-[48px] font-extrabold leading-none tracking-[0] text-[#E21221]">
              ASTACALA
            </span>
          </Link>
          <AdminHamburgerMenu />
        </div>
      </header>

      <section className="bg-[#CC2028]">
        <div className="mx-auto flex min-h-[120px] max-w-[1180px] items-center px-8 py-6">
          <div>
            <h1 className="text-[32px] font-semibold leading-tight text-white">
              Keamanan Akun Admin
            </h1>
            <p className="mt-2 text-[16px] text-white/80">
              Kelola verifikasi email dua faktor untuk akun admin Anda.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[800px] px-8 py-10">

        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-[8px] border border-green-300 bg-green-50 px-5 py-4">
            <span className="text-green-600 shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <polyline
                  points="20 6 9 17 4 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="text-[15px] font-medium text-green-700">{successMessage}</p>
          </div>
        )}

        <div className="rounded-[8px] border border-[#1B1B1B] bg-white overflow-hidden">
          <div className="flex items-center gap-4 border-b border-[#E8E8E8] px-6 py-5">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                status?.enabled ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  stroke={status?.enabled ? "#2E7D32" : "#8A8A8A"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[20px] font-bold text-[#111]">
                Verifikasi Email Dua Faktor (2FA)
              </p>
              <p className="text-[14px] text-[#737373] mt-0.5">
                {statusLoading
                  ? "Memuat status..."
                  : status?.enabled
                  ? "Aktif — kode dikirim ke email saat login admin"
                  : "Nonaktif — aktifkan untuk keamanan tambahan"}
              </p>
            </div>
            {!statusLoading && (
              <span
                className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-bold ${
                  status?.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-[#737373]"
                }`}
              >
                {status?.enabled ? "Aktif" : "Nonaktif"}
              </span>
            )}
          </div>

          <div className="px-6 py-6">
            {statusLoading ? (
              <div className="h-8 w-40 rounded bg-gray-100 animate-pulse" />
            ) : step === "idle" && !status?.enabled ? (
              /* ---- Enable 2FA ---- */
              <div className="space-y-4">
                <p className="text-[15px] text-[#555] leading-relaxed">
                  Aktifkan 2FA untuk mendapatkan kode verifikasi 6 digit via email setiap kali login sebagai admin.
                  {status?.email && (
                    <> Kode akan dikirim ke <strong>{status.email}</strong>.</>
                  )}
                </p>
                {error && <p className="text-[14px] text-[#CC2028] font-medium">{error}</p>}
                <Button variant="primary" onClick={handleEnable} disabled={loading}>
                  {loading ? "Mengaktifkan..." : "Aktifkan 2FA"}
                </Button>
              </div>
            ) : step === "disabling" ? (
              /* ---- Disable 2FA (verify with OTP) ---- */
              <div className="space-y-4 max-w-[400px]">
                <p className="text-[15px] text-[#555] leading-relaxed">
                  Kode verifikasi telah dikirim ke email Anda. Masukkan kode tersebut untuk menonaktifkan 2FA.
                </p>
                <form onSubmit={handleDisable} className="space-y-4">
                  <Input
                    label="Kode Verifikasi"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="00000000"
                    maxLength={8}
                    required
                    autoFocus
                    value={disableCode}
                    onChange={(e) => {
                      setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 8));
                      setError("");
                    }}
                    error={error}
                  />
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading || disableCode.length < 6}
                    >
                      {loading ? "Menonaktifkan..." : "Nonaktifkan 2FA"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
                      Batal
                    </Button>
                  </div>
                </form>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-[14px] text-[#CC2028] font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? "Mengirim..." : "Kirim ulang kode"}
                </button>
              </div>
            ) : status?.enabled ? (
              /* ---- 2FA active ---- */
              <div className="space-y-4">
                <p className="text-[15px] text-[#555] leading-relaxed">
                  2FA sudah aktif. Setiap login admin akan memerlukan kode verifikasi yang dikirim ke email Anda.
                  {status.email && (
                    <> Kode dikirim ke <strong>{status.email}</strong>.</>
                  )}
                </p>
                {error && <p className="text-[14px] text-[#CC2028] font-medium">{error}</p>}
                <Button
                  variant="outline"
                  onClick={handleStartDisable}
                  disabled={loading}
                >
                  {loading ? "Mengirim kode..." : "Nonaktifkan 2FA"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <Link href="/admin/dashboard" className="text-[14px] font-semibold text-[#CC2028] hover:underline">
            ← Kembali ke Dashboard Admin
          </Link>
        </div>
      </main>
    </div>
  );
}
