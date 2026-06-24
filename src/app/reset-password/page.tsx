"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { createClient } from "@/src/utils/supabase/client";

type SessionStatus = "loading" | "ready" | "invalid";

interface ApiErrorResponse {
  error?: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [status, setStatus] = useState<SessionStatus>("loading");

  // Establish the recovery session from the reset link.
  // The browser Supabase client detects the token in the URL (hash for the
  // implicit flow or `?code=` for the PKCE flow) automatically and persists the
  // session to cookies. `getSession()` only resolves once that detection has
  // finished, so we can rely on its result to gate the form.
  useEffect(() => {
    const supabase = createClient();
    let active = true;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!active) return;

        if (error || !data.session) {
          setStatus("invalid");
          return;
        }

        setStatus("ready");

        // Remove the token from the address bar once consumed.
        if (window.location.hash || window.location.search) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      } catch {
        if (active) setStatus("invalid");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Reset transient form state on unmount.
  useEffect(() => {
    const form = formRef.current;
    return () => {
      form?.reset();
    };
  }, []);

  // Validation rules
  const isMatch = password === confirmPassword;
  const showError = isSubmitted && !isMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setServerError("");

    if (password.length < 8) {
      setServerError("Password minimal 8 karakter");
      return;
    }

    if (!isMatch) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/update-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });

      if (res.ok) {
        router.push("/reset-password/success");
        return;
      }

      if (res.status === 401) {
        setStatus("invalid");
        return;
      }

      const data = (await res.json()) as ApiErrorResponse;
      setServerError(data.error ?? "Gagal memperbarui password. Coba lagi.");
    } catch (err) {
      console.error("Update password request error:", err);
      setServerError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative w-full">
      <main className="w-full relative flex-1 flex items-center justify-center overflow-hidden">

        {/* Full Background Layout */}
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: "url('/images/background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Centered Card */}
        <div className="relative z-10 w-full px-4 flex items-center justify-center py-8">
          <div className="bg-white rounded-[var(--radius-xl)] shadow-xl p-6 md:p-8 w-full max-w-[400px] md:max-w-[480px]">

            {status === "loading" && (
              <div className="flex flex-col items-center text-center py-4">
                <p className="text-[var(--text-nano)] text-[var(--color-text-tertiary)]">
                  Memverifikasi tautan reset password...
                </p>
              </div>
            )}

            {status === "invalid" && (
              <div className="flex flex-col items-center text-center">
                <h1 className="text-[var(--text-heading)] font-semibold text-[var(--color-text-primary)] mb-2">
                  Tautan Tidak Valid
                </h1>
                <p className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] max-w-[280px] mb-6">
                  Tautan reset password tidak valid atau sudah kedaluwarsa.
                  Silakan minta tautan baru.
                </p>
                <Link
                  href="/forgot-password"
                  className="w-full flex items-center justify-center text-center transition-colors bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] active:bg-[var(--color-primary-dark)] text-white py-[8px] px-[12px] rounded-[var(--radius-lg)] text-[var(--text-label)] font-medium"
                >
                  Minta Tautan Baru
                </Link>
                <Link
                  href="/login"
                  className="mt-4 text-[var(--text-nano)] font-medium text-[var(--color-primary)] hover:underline"
                >
                  Kembali ke Login
                </Link>
              </div>
            )}

            {status === "ready" && (
              <>
                <div className="mb-6 md:mb-8 flex flex-col items-center text-center">
                  <h1 className="text-[var(--text-heading)] font-semibold text-[var(--color-text-primary)] mb-2">
                    Buat Password Baru
                  </h1>

                  <p className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] max-w-[280px]">
                    Masukkan password baru untuk akun kamu
                  </p>
                </div>

                <form ref={formRef} className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
                  <div className="space-y-4">

                    <Input
                      label="Password Baru"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />

                    <div className="pt-2">
                      <Input
                        label="Konfirmasi Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (isSubmitted) setIsSubmitted(false);
                        }}
                        error={showError ? "Password tidak cocok" : undefined}
                        required
                      />
                    </div>

                    {serverError && (
                      <p className="text-[var(--text-nano)] text-[var(--color-danger)]" role="alert">
                        {serverError}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="primary" fullWidth className="mt-6" disabled={loading}>
                      {loading ? "Menyimpan..." : "Simpan Password Baru"}
                    </Button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
