"use client";

import React from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate validation and navigation to step 2
    router.push("/forgot-password/verify");
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
                Masukkan email terdaftar untuk menerima Link reset password
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
                />
              </div>

              <div className="pt-2">
                <Button variant="primary" fullWidth className="mt-6">
                  Kirim Link →
                </Button>
              </div>
            </form>

            {/* Bottom Link */}
            <div className="mt-6 text-center">
              <a href="/login" className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] font-medium hover:text-[var(--color-primary)] transition-colors">
                Kembali ke Login
              </a>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
