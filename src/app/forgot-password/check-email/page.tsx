"use client";

import React from "react";
import Link from "next/link";

export default function CheckEmailPage() {
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
            
            <div className="mb-6 md:mb-8 flex flex-col items-center text-center">
              <h1 className="text-[var(--text-heading)] font-semibold text-[var(--color-text-primary)] mb-4">
                Cek Email Kamu
              </h1>
              
              <p className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] mb-2 px-4">
                Kami telah mengirimkan link untuk reset password ke email kamu.
              </p>
              
            </div>

            <div className="pt-2">
              <Link
                href="/forgot-password"
                className="mt-6 w-full flex items-center justify-center text-center transition-colors bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] active:bg-[var(--color-primary-dark)] text-white py-[8px] px-[12px] rounded-[var(--radius-lg)] text-[var(--text-label)] font-medium"
              >
                Kirim ulang email
              </Link>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              <Link
                href="/login"
                className="text-[var(--text-nano)] font-medium text-[var(--color-primary)] hover:underline"
              >
                Kembali ke Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
