"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import { Stepper } from "../../../components/Stepper";
import { Button } from "../../../components/Button";

export default function Step1LokasiPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar 
        variant="flow" 
        showBack={true} 
        title="Buat Laporan" 
        rightElement={
          <span className="text-[16px] font-medium text-[var(--color-text-primary)]">
            1/3
          </span>
        }
      />

      <div className="w-full border-b border-[var(--color-border)]">
        <Stepper steps={["Lokasi", "Kondisi", "Kirim"]} currentStep={1} />
      </div>

      <main className="w-full flex-1 overflow-y-auto px-5 md:px-6 lg:px-8 pt-6 pb-32 max-w-[800px] mx-auto">
        {/* Section Title */}
        <h1 className="text-[20px] font-medium text-[var(--color-text-primary)] mb-4">
          Lokasi Kejadian
        </h1>

        {/* Map Preview Area */}
        <div className="w-full h-[120px] bg-[#D9D9D9] rounded-[16px] mb-6" />

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Alamat Lengkap */}
          <div className="flex flex-col">
            <label className="text-[14px] font-medium text-[var(--color-text-primary)] mb-2">
              Alamat Lengkap
            </label>
            <textarea
              placeholder="Jl......"
              className="w-full bg-white border border-[var(--color-border)] rounded-[16px] py-3 px-4 text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] transition-colors resize-none min-h-[80px]"
            />
          </div>

          {/* Kecematan/Kelurahan */}
          <div className="flex flex-col">
            <label className="text-[14px] font-medium text-[var(--color-text-primary)] mb-2">
              Kecematan/Kelurahan
            </label>
            <input
              type="text"
              placeholder="Jl......"
              className="w-full bg-white border border-[var(--color-border)] rounded-[16px] py-3 px-4 text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          {/* Kabupaten/Kota */}
          <div className="flex flex-col">
            <label className="text-[14px] font-medium text-[var(--color-text-primary)] mb-2">
              Kabupaten/Kota
            </label>
            <input
              type="text"
              placeholder="Jl......"
              className="w-full bg-white border border-[var(--color-border)] rounded-[16px] py-3 px-4 text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
        </div>
      </main>

      {/* Fixed Bottom Button Row */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[var(--color-border)] px-5 py-4 z-50">
        <div className="max-w-[800px] mx-auto flex gap-3">
          <div className="flex-1">
            <button 
              className="w-full py-3 px-4 rounded-[16px] border border-[var(--color-border)] text-[14px] font-medium text-[var(--color-text-secondary)] bg-white active:bg-gray-50 transition-colors"
              onClick={() => router.push("/dashboard")}
            >
              Batal
            </button>
          </div>
          <div className="flex-[2]">
            <button 
              className="w-full py-3 px-4 rounded-[16px] bg-[var(--color-primary)] text-[14px] font-medium text-white active:opacity-90 transition-colors"
              onClick={() => router.push("/report/step2")}
            >
              Lanjut
            </button>
          </div>
        </div>
        {/* Safe area spacing for mobile iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
