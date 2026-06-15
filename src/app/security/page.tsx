"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

type TwoFAStatus = {
  enabled: boolean;
  email: string | null;
};

type Step = "idle" | "disabling";

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polyline
        points="20 6 9 17 4 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SecurityPage() {
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

      setSuccessMessage("2FA email berhasil diaktifkan! Setiap login akan memerlukan verifikasi via email.");
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
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-page)]">
      <Navbar variant="authenticated" />

      <main className="w-full max-w-[600px] mx-auto px-4 md:px-6 py-8 md:py-12 flex-1">

        <div className="mb-8">
          <h1 className="text-[20px] md:text-[24px] font-bold text-[var(--color-text-primary)]">
            Keamanan Akun
          </h1>
          <p className="text-[var(--text-caption)] text-[var(--color-text-secondary)] mt-1">
            Kelola pengaturan keamanan akun Anda.
          </p>
        </div>

        {successMessage && (
          <div className="mb-4 flex items-start gap-3 bg-[var(--color-success-light)] border border-[var(--color-success)] rounded-[var(--radius-lg)] px-4 py-3">
            <span className="text-[var(--color-success)] mt-[1px] shrink-0">
              <CheckIcon />
            </span>
            <p className="text-[var(--text-caption)] text-[var(--color-success)] font-medium">
              {successMessage}
            </p>
          </div>
        )}

        <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-3">
            <span className="text-[var(--color-primary)]">
              <ShieldIcon />
            </span>
            <div className="flex-1">
              <p className="text-[var(--text-heading)] font-semibold text-[var(--color-text-primary)]">
                Verifikasi Email Dua Faktor (2FA)
              </p>
              <p className="text-[var(--text-caption)] text-[var(--color-text-secondary)] mt-0.5">
                {statusLoading
                  ? "Memuat status..."
                  : status?.enabled
                  ? "Aktif — kode dikirim ke email saat login"
                  : "Nonaktif — aktifkan untuk keamanan tambahan"}
              </p>
            </div>
            {!statusLoading && status?.enabled && (
              <span className="ml-auto shrink-0 rounded-full bg-[var(--color-success-light)] px-3 py-1 text-[var(--text-micro)] font-semibold text-[var(--color-success)]">
                Aktif
              </span>
            )}
          </div>

          <div className="px-5 py-5">
            {statusLoading ? (
              <div className="h-8 w-32 rounded bg-gray-100 animate-pulse" />
            ) : step === "idle" && !status?.enabled ? (
              /* ---- Enable 2FA ---- */
              <div className="space-y-4">
                <p className="text-[var(--text-caption)] text-[var(--color-text-secondary)] leading-relaxed">
                  Aktifkan 2FA untuk mendapatkan kode verifikasi 6 digit via email setiap kali login.
                  {status?.email && (
                    <> Kode akan dikirim ke <strong>{status.email}</strong>.</>
                  )}
                </p>
                {error && (
                  <p className="text-[var(--text-caption)] text-[var(--color-primary)] font-medium">
                    {error}
                  </p>
                )}
                <Button variant="primary" onClick={handleEnable} disabled={loading}>
                  {loading ? "Mengaktifkan..." : "Aktifkan 2FA"}
                </Button>
              </div>
            ) : step === "disabling" ? (
              /* ---- Disable 2FA (verify with OTP) ---- */
              <div className="space-y-4">
                <p className="text-[var(--text-caption)] text-[var(--color-text-secondary)] leading-relaxed">
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
                  <div className="flex gap-3 flex-wrap">
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
                  className="text-[var(--text-caption)] text-[var(--color-primary)] font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? "Mengirim..." : "Kirim ulang kode"}
                </button>
              </div>
            ) : status?.enabled ? (
              /* ---- 2FA active, offer to disable ---- */
              <div className="space-y-4">
                <p className="text-[var(--text-caption)] text-[var(--color-text-secondary)] leading-relaxed">
                  2FA aktif. Setiap login akan memerlukan kode verifikasi yang dikirim ke email Anda.
                  {status.email && (
                    <> Kode dikirim ke <strong>{status.email}</strong>.</>
                  )}
                </p>
                {error && (
                  <p className="text-[var(--text-caption)] text-[var(--color-primary)] font-medium">
                    {error}
                  </p>
                )}
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

        <div className="mt-4 text-center">
          <a
            href="/dashboard"
            className="text-[var(--text-caption)] text-[var(--color-primary)] font-medium hover:underline"
          >
            &larr; Kembali ke Beranda
          </a>
        </div>
      </main>
    </div>
  );
}
