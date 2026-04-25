"use client";

import React from "react";
import { Navbar } from "../../components/Navbar";
import { AlertBanner } from "../../components/AlertBanner";
import { SectionHeader } from "../../components/SectionHeader";
import { NotificationItem } from "../../components/NotificationItem";
import { SectionDivider } from "../../components/SectionDivider";
import { MissionCard } from "../../components/MissionCard";
import { NewsCard } from "../../components/NewsCard";
import { Footer } from "../../components/Footer";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-default)]">
      <Navbar variant="authenticated" />

      <main className="w-full pb-10 md:pb-12">
        {/* 1. Hero Section */}
        <section className="bg-[var(--color-primary)] w-full py-6 md:py-8 px-4 md:px-6 lg:px-8 relative flex flex-col items-center">
          <div className="w-full max-w-[1200px]">
            {/* Top Row */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <span className="text-[20px] md:text-[24px] text-white leading-tight">
                  Selamat pagi,
                </span>
                <span className="text-[20px] md:text-[24px] font-bold text-white leading-tight">
                  Dandy Fadila
                </span>
              </div>
              {/* Avatar */}
              <div className="w-[52px] h-[52px] md:w-[60px] md:h-[60px] bg-white rounded-full flex items-center justify-center shrink-0">
                <span className="text-[20px] md:text-[22px] font-medium text-[var(--color-text-primary)]">
                  DF
                </span>
              </div>
            </div>

            {/* CTA Card */}
            <button 
              className="w-full bg-white rounded-[20px] p-4 md:p-5 shadow-sm active:scale-[0.98] transition-all flex items-center gap-4 text-left group"
              onClick={() => console.log("Navigate to S08")}
            >
              <div className="w-[64px] h-[64px] bg-[#B22222] rounded-[16px] shrink-0 flex items-center justify-center text-black/80 group-hover:bg-[#A01D1D] transition-colors">
                {/* Custom Plus Icon to match Figma */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex flex-col flex-1 pr-2">
                <span className="text-[16px] md:text-[18px] font-semibold text-[#B22222] mb-0.5">
                  Buat Laporan Bencana
                </span>
                <span className="text-[13px] md:text-[14px] leading-tight text-gray-500 max-w-[200px] md:max-w-none">
                  Laporkan kondisi darurat dari lapangan
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* 2. Alert Banner (SIAGA) */}
        <div className="w-full">
          <AlertBanner 
            variant="siaga"
            text="Potensi Banjir di Bandung"
            actionText="Info ›"
            onAction={() => console.log("Info clicked")}
          />
        </div>

        {/* Main Content Blocks Container */}
        <div className="w-full space-y-6 md:space-y-8 mt-6 md:mt-8">
          
          {/* 3. Notifikasi Terbaru */}
          <section className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <SectionHeader 
              title="Notifikasi Terbaru" 
              actionText="Semua" 
              onAction={() => console.log("Semua Notifikasi")} 
            />
            <div className="flex flex-col mt-2">
              <NotificationItem 
                title="Laporan #005 kamu telah diterima pusat kembali"
                time="1 Detik lalu"
                circleColor="var(--color-success)"
              />
              <NotificationItem 
                title="Misi Baru - Operasi Banjir Kec. Dayeuhkolot"
                time="10 Menit lalu"
                circleColor="var(--color-secondary)"
              />
              <NotificationItem 
                title="Laporan #003 ditolak - data lokasi tidak valid"
                time="1 Jam lalu"
                circleColor="var(--color-primary)"
                isLast={true}
              />
            </div>
          </section>

          <SectionDivider />

          {/* 4. Misi Aktif */}
          <section className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-4 md:p-6">
              <SectionHeader 
                title="Misi Aktif" 
                actionText="Semua" 
                onAction={() => console.log("Semua Misi")} 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                <MissionCard 
                  title="Operasi Banjir"
                  location="Kec. Dayeuhkolot"
                  status="terbuka"
                  startDate="10/04/2026"
                  volunteers="12/15"
                  onAction={() => console.log("Daftar")}
                />
                <MissionCard 
                  title="Operasi Banjir"
                  location="Kec. Dayeuhkolot"
                  status="penuh"
                  startDate="10/04/2026"
                  volunteers="15/15"
                  onAction={() => console.log("Penuh")}
                />
              </div>
            </div>
          </section>

          <SectionDivider />

          {/* 5. Berita Bencana */}
          <section className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-6">
              <SectionHeader title="Berita Bencana Terkini" />
            </div>
            
            <div className="flex flex-col">
              {/* Featured Carousel Card - Standalone */}
              <NewsCard 
                variant="featured"
                title="Gempa Depok"
                description="Dikabarkan 10 orang menghilang dibalik tumpukan bangunan. Bantuan diperlukan!"
                category="Darurat"
                isCarousel={true}
              />
              
              {/* News List Container */}
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mt-6 flex flex-col gap-4">
                <NewsCard 
                  variant="small"
                  title="Ratusan Warga Terdampak Banjir Bandang di Garut"
                  category="Info"
                  time="2 Jam lalu"
                />
                <NewsCard 
                  variant="small"
                  title="Tanah Longsor Memutus Jalur Utama Puncak Bogor"
                  category="Info"
                  time="5 Jam lalu"
                />
                <NewsCard 
                  variant="small"
                  title="Tim SAR Berhasil Mengevakuasi 5 Pendaki Tersesat"
                  category="Info"
                  time="1 Hari lalu"
                />
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
