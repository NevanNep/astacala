import React from "react";

export function Footer() {
  return (
    <footer className="bg-[var(--color-secondary)] w-full">
      <div className="max-w-[1200px] mx-auto py-6 md:py-8 px-4 md:px-6 lg:px-8 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          {/* Logo Circle */}
          <div
            className="w-[22px] h-[22px] rounded-full overflow-hidden shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--color-secondary) 50%, var(--color-success) 50%)",
            }}
          />
          <span className="text-[var(--text-caption)] font-bold tracking-wide text-white">
            ASTACALA
          </span>
        </div>

        <p className="text-[var(--text-nano)] text-white/60 leading-[1.6]">
          Perhimpunan Mahasiswa Pecinta Alam Universitas Telkom. Portal pelaporan dan misi tanggap bencana terpercaya.
        </p>

        <div className="flex flex-wrap gap-4 md:gap-6">
          <a href="#" className="text-[var(--text-nano)] text-white/60 hover:text-white">Tentang Kami</a>
          <a href="#" className="text-[var(--text-nano)] text-white/60 hover:text-white">Kontak</a>
          <a href="#" className="text-[var(--text-nano)] text-white/60 hover:text-white">Syarat & Ketentuan</a>
          <a href="#" className="text-[var(--text-nano)] text-white/60 hover:text-white">Kebijakan Privasi</a>
        </div>

        <div className="h-[0.5px] w-full bg-[#333333] my-[2px]" />

        <p className="text-[var(--text-nano)] text-white/35">
          &copy; 2026 Astacala Rescue - Telkom University
        </p>
      </div>
    </footer>
  );
}
