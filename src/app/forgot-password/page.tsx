"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

interface ApiErrorResponse {
  error?: string;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown";
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        router.push("/forgot-password/check-email");
        return;
      }

      const data = (await res.json()) as ApiErrorResponse;
      setError(data.error ?? "Gagal mengirim link reset password.");
    } catch (err: unknown) {
      console.error("Reset password request error:", err);
      setError("Terjadi kesalahan. Coba lagi. " + getErrorMessage(err));
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
            {/* Header / Titles */}
            <div className="mb-6 md:mb-8 flex flex-col items-center text-center">
              <span className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] mb-2">
                Step 1 of 3
              </span>
              <h1 className="text-[var(--text-heading)] font-semibold text-[var(--color-text-primary)] mb-2">
                Lupa Password?
              </h1>
              <p className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] max-w-[280px]">
                Masukkan email terdaftar untuk menerima link reset password
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@astacala.id"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" fullWidth className="mt-6" disabled={loading}>
                  {loading ? "Mengirim..." : "Kirim Link"}
                </Button>
              </div>
            </form>

            {/* Bottom Link */}
            <div className="mt-6 text-center">
              <Link href="/login" className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] font-medium hover:text-[var(--color-primary)] transition-colors">
                Kembali ke Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
