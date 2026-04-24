import { Navbar } from "../components/Navbar";
/*import { AlertBanner } from "../components/AlertBanner";*/
import { StatStrip, StatItem } from "../components/StatStrip";
import { SectionDivider } from "../components/SectionDivider";
import { SectionHeader } from "../components/SectionHeader";
import { NewsCard } from "../components/NewsCard";
import { Footer } from "../components/Footer";
import { Button } from "../components/Button";

const statsData: StatItem[] = [
  { number: "128", label: "Laporan Terverifikasi" },
  { number: "34", label: "Misi Selesai" },
  { number: "210", label: "Relawan Aktif" },
];

export default function Home() {
  return (
    <main className="w-full px-4">
      <Navbar variant="public" />
      {/* Hero Section */}
      <section className="bg-[var(--color-primary)] px-6 md:px-8 lg:px-12 py-8 md:py-12 flex flex-col items-center justify-center text-center">
        <div className="w-[50px] h-[50px] rounded-full overflow-hidden mb-[16px]" style={{
          background: "linear-gradient(135deg, var(--color-secondary) 50%, var(--color-success) 50%)",
        }} />
        <span className="text-[var(--text-nano)] uppercase tracking-[0.05em] text-white/75 mb-[8px]">
          ASTACALA RESCUE — TELKOM UNIVERSITY
        </span>
        <h1 className="text-[var(--text-hero)] font-medium text-white leading-[1.3] mb-[8px] px-[16px]">
          Informasi Bencana Terpercaya & Terverifikasi
        </h1>
        <p className="text-[var(--text-nano)] text-white/80 mb-[20px] px-[20px]">
          Portal informasi dan manajemen relawan Astacala untuk tanggap darurat bencana di Indonesia.
        </p>
        <Button variant="primary" className="bg-white !text-[var(--color-primary)] hover:bg-[#F5F5F5] active:bg-[#EEEEEE]">
          Masuk sebagai Relawan
        </Button>
      </section>

      {/* Alert Strip */}
      {/*<AlertBanner 
        variant="siaga" 
        text="SIAGA — Potensi banjir di Kota Bandung" 
        actionText="Info ›" 
      />*/}

      {/* Stats Bar */}
      <StatStrip stats={statsData} />

      <SectionDivider />

      {/* Berita Bencana Terkini */}
      <section className="bg-[var(--color-bg-card)] pb-8 md:pb-12 space-y-4 md:space-y-6">
        <SectionHeader title="Berita Bencana Terkini" actionText="Lihat semua ›" />
        
        <NewsCard 
          variant="featured"
          title="Gempa Magnitudo 5.6 Guncang Cianjur, Tim Relawan Diberangkatkan"
          category="Gempa"
          location="Cianjur, Jawa Barat"
          time="2 jam yang lalu"
          verified={true}
        />
        
        <NewsCard 
          variant="small"
          title="Banjir Bandang Melanda Kawasan Bandung Selatan Akibat Hujan Deras"
          category="Banjir"
          time="5 jam yang lalu"
          verified={true}
        />
        
        <NewsCard 
          variant="small"
          title="Tanah Longsor Tutup Akses Jalan Utama Lembang - Subang"
          category="Longsor"
          time="1 hari yang lalu"
          verified={true}
        />
      </section>

      <SectionDivider />

      {/* CTA Relawan Section */}
      <section className="bg-[var(--color-bg-muted)] px-6 md:px-8 lg:px-12 py-8 md:py-12 border-y-[0.5px] border-[var(--color-border)] flex flex-col items-center text-center">
        <span className="text-[var(--text-nano)] uppercase text-[var(--color-text-tertiary)] mb-[8px]">
          BERGABUNG DENGAN KAMI
        </span>
        <h2 className="text-[var(--text-subheading)] font-medium text-[var(--color-text-primary)] mb-[8px]">
          Kamu Relawan Astacala? Masuk dan Mulai Melapor
        </h2>
        <p className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] leading-[1.6] mb-[20px] px-[10px]">
          Akses dashboard relawan untuk membuat laporan bencana, daftar misi, dan pantau status laporanmu secara real-time.
        </p>
        <Button variant="primary" fullWidth className="mb-[12px]">
          Masuk sebagai Relawan →
        </Button>
        <p className="text-[var(--text-micro)] text-[var(--color-text-tertiary)]">
          Belum punya akun? <span className="text-[var(--color-primary)] font-medium">Hubungi admin Astacala</span>
        </p>
      </section>

      <Footer />
    </main>
  );
}
