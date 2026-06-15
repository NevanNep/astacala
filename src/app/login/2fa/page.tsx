"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";

interface VerifySuccessResponse {
  success: boolean;
  redirectTo?: "/admin/dashboard" | "/dashboard";
}

interface ApiErrorResponse {
  error?: string;
}

const RESEND_COOLDOWN = 60; // seconds

export default function TwoFactorChallengePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  // Count down from RESEND_COOLDOWN to 0 before allowing resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();

    const trimmed = code.replace(/\s/g, "");
    if (!trimmed || trimmed.length < 6 || !/^\d+$/.test(trimmed)) {
      setError("Masukkan kode angka dari email Anda.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });

      const data = (await res.json()) as VerifySuccessResponse & ApiErrorResponse;

      if (res.ok && data.success) {
        router.push(data.redirectTo ?? "/dashboard");
        router.refresh();
        return;
      }

      setError(data.error ?? "Verifikasi gagal. Coba lagi.");
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendMessage("");
    setError("");
    setResendLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/send", { method: "POST" });
      if (res.ok) {
        setResendMessage("Kode baru telah dikirim ke email Anda.");
        setCooldown(RESEND_COOLDOWN);
      } else {
        const data = (await res.json()) as ApiErrorResponse;
        setError(data.error ?? "Gagal mengirim ulang kode.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative w-full">
      <main className="w-full relative flex-1 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: "url('/images/background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 w-full px-4 flex items-center justify-center py-8">
          <div className="bg-white rounded-[var(--radius-xl)] shadow-xl p-6 md:p-8 w-full max-w-[400px] md:max-w-[480px]">

            <div className="mb-6 md:mb-8 flex flex-col items-center">
              <div className="w-12 h-12 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-[var(--text-heading)] font-semibold text-[var(--color-text-primary)] mb-1">
                Verifikasi Email
              </h1>
              <p className="text-[var(--text-caption)] text-[var(--color-text-secondary)] text-center">
                Kode verifikasi telah dikirim ke email Anda. Masukkan kode tersebut untuk melanjutkan.
              </p>
              <div className="w-[32px] h-[3px] bg-[var(--color-primary)] rounded-full mt-3" />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                autoFocus
                label="Kode Verifikasi"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="00000000"
                maxLength={8}
                required
                value={code}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                  setCode(digits);
                  setError("");
                }}
                error={error}
                className="text-center tracking-widest"
              />

              {resendMessage && (
                <p className="text-[var(--text-caption)] text-green-600 text-center">
                  {resendMessage}
                </p>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading || code.length < 6}
                >
                  {loading ? "Memverifikasi..." : "Verifikasi"}
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center">
              {cooldown > 0 ? (
                <p className="text-[var(--text-caption)] text-[var(--color-text-tertiary)]">
                  Kirim ulang kode dalam{" "}
                  <span className="font-medium tabular-nums">{cooldown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-[var(--text-caption)] text-[var(--color-primary)] font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? "Mengirim..." : "Kirim ulang kode"}
                </button>
              )}
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="text-[var(--text-caption)] text-[var(--color-text-secondary)] hover:underline"
              >
                &larr; Kembali ke Login
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
