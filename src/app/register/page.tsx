"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
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

export default function RegisterPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    const form = formRef.current;

    return () => {
      form?.reset();
      setNama("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError("");
      setLoading(false);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password, confirmPassword }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = (await res.json()) as ApiErrorResponse;
        const errorMsg = data.error ?? "Registrasi gagal. Coba lagi.";
        setError(errorMsg);
        alert("Register Error: " + errorMsg);
      }
    } catch (err: unknown) {
      setError("Terjadi kesalahan. Coba lagi.");
      alert("Network or Server Error: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

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

        {/* Centered Register Card */}
        <div className="relative z-10 w-full px-4 flex items-center justify-center py-8">
          <div className="bg-white rounded-[var(--radius-xl)] shadow-xl p-6 md:p-8 w-full max-w-[400px] md:max-w-[480px]">
            
            <div className="mb-6 md:mb-8 flex flex-col items-center">
              <h1 className="text-[var(--text-heading)] font-semibold text-[var(--color-text-primary)] mb-2">
                Sign up
              </h1>
              <div className="w-[32px] h-[3px] bg-[var(--color-primary)] rounded-full" />
            </div>

            <form ref={formRef} className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input
                  label="Name"
                  type="text"
                  placeholder="Relawan Name"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="email@gmail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  label="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Input
                  label="Konfirmasi Password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={error}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" fullWidth className="mt-6" disabled={loading}>
                  {loading ? "Loading..." : "Create Account"}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[var(--text-caption)] text-[var(--color-text-tertiary)]">
                Already have an account?{" "}
                <Link href="/login" className="text-[var(--color-primary)] font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
