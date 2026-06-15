"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
/*import { Navbar } from "../../components/Navbar";*/
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

type PostLoginRoute = "/admin/dashboard" | "/dashboard";

interface LoginSuccessResponse {
  redirectTo?: PostLoginRoute;
  mfaRequired?: boolean;
}

interface ApiErrorResponse {
  error?: string;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown";
}

export default function LoginPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    const form = formRef.current;

    return () => {
      form?.reset();
      setEmail("");
      setPassword("");
      setError("");
      setLoading(false);
    };
  }, []);

  async function handleSubmit(e?: React.FormEvent | React.MouseEvent) {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = (await res.json()) as LoginSuccessResponse;
        if (data.mfaRequired) {
          router.push("/login/2fa");
          return;
        }
        router.push(data.redirectTo ?? "/dashboard");
        router.refresh();
        return;
      } else {
        const data = (await res.json()) as ApiErrorResponse;
        const errorMsg = data.error ?? "Login gagal. Coba lagi.";
        setError(errorMsg);
        alert("Login Error: " + errorMsg);
      }
    } catch (err: unknown) {
      console.error("Fetch error:", err);
      setError("Terjadi kesalahan. Coba lagi.");
      alert("Network or Server Error: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative w-full">
      {/*<Navbar variant="public" />*/}

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

        {/* Centered Login Card */}
        <div className="relative z-10 w-full px-4 flex items-center justify-center py-8">
          <div className="bg-white rounded-[var(--radius-xl)] shadow-xl p-6 md:p-8 w-full max-w-[400px] md:max-w-[480px]">

            <div className="mb-6 md:mb-8 flex flex-col items-center">
              <h1 className="text-[var(--text-heading)] font-semibold text-[var(--color-text-primary)] mb-2">
                Sign in
              </h1>
              <div className="w-[32px] h-[3px] bg-[var(--color-primary)] rounded-full" />
            </div>

            <form ref={formRef} className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                  error={error}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3 h-3 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-[var(--text-caption)] text-[var(--color-text-secondary)]">
                    Remember Me
                  </span>
                </label>
                <Link href="/forgot-password" className="text-[var(--text-caption)] font-medium text-[var(--color-primary)] hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" fullWidth className="mt-6" disabled={loading}>
                  {loading ? "Loading..." : "Login"}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[var(--text-caption)] text-[var(--color-text-tertiary)]">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-[var(--color-primary)] font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
