"use client";

import React from "react";
import { Button } from "../../../components/Button";
import { useRouter } from "next/navigation";

export default function ResetPasswordSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col relative w-full">
      <main className="w-full relative flex-1 flex items-center justify-center overflow-hidden">
        
        {/* Full Background Layout */}
        <div 
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=2000&q=80')",
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
            
            <div className="flex flex-col items-center text-center">
              {/* Success Icon */}
              <div className="w-[56px] h-[56px] rounded-full bg-[var(--color-success-light)] flex items-center justify-center mb-6">
                <div className="w-[28px] h-[28px] rounded-full bg-[var(--color-success)] flex items-center justify-center text-white text-[14px]">
                  ✓
                </div>
              </div>

              <h1 className="text-[var(--text-heading)] font-semibold text-[var(--color-text-primary)] mb-2">
                Password Berhasil Diubah!
              </h1>
              
              <p className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] max-w-[280px]">
                Silakan login menggunakan password baru kamu
              </p>
            </div>

            <div className="pt-2">
              <Button 
                variant="primary" 
                fullWidth 
                className="mt-6 md:mt-8"
                onClick={() => router.push("/login")}
              >
                Login Sekarang →
              </Button>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
