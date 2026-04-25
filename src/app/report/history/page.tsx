"use client";

import { useState } from "react";
import { Navbar } from "../../../components/Navbar";

type LaporanStatus = "Diterima" | "Pending" | "Ditolak";

interface Laporan {
  id: string;
  title: string;
  subtitle: string;
  status: LaporanStatus;
  dikirim: string;
  keparahan: string;
  durasi: string;
  jenis: string;
}

const MOCK_LAPORAN: Laporan[] = [
  {
    id: "#LPR-2026-006",
    title: "Operasi Banjir",
    subtitle: "Kec. Dayeuhkolot",
    status: "Diterima",
    dikirim: "10/04/2026",
    keparahan: "Ringan",
    durasi: "5 Hari",
    jenis: "Evakuasi",
  },
  {
    id: "#LPR-2026-005",
    title: "Operasi Banjir",
    subtitle: "Kec. Dayeuhkolot",
    status: "Pending",
    dikirim: "10/04/2026",
    keparahan: "Ringan",
    durasi: "5 Hari",
    jenis: "Evakuasi",
  },
  {
    id: "#LPR-2026-004",
    title: "Operasi Banjir",
    subtitle: "Kec. Dayeuhkolot",
    status: "Ditolak",
    dikirim: "10/04/2026",
    keparahan: "Ringan",
    durasi: "5 Hari",
    jenis: "Evakuasi",
  },
];

const FILTERS = ["Semua", "Pending", "Diterima", "Ditolak"];

const STATUS_BORDER: Record<LaporanStatus, string> = {
  Diterima: "#2E7D32",
  Pending: "#F9A825",
  Ditolak: "#C62828",
};

const STATUS_BADGE: Record<LaporanStatus, { bg: string; color: string }> = {
  Diterima: { bg: "#E8F5E9", color: "#2E7D32" },
  Pending: { bg: "#FFF8E1", color: "#E65100" },
  Ditolak: { bg: "#FFEBEE", color: "#C62828" },
};

export default function RiwayatLaporanPage() {
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [search, setSearch] = useState("");

  const filtered = MOCK_LAPORAN.filter((l) => {
    const matchSearch =
      search === "" ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.subtitle.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "Semua" || l.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const isFiltering = search !== "" || activeFilter !== "Semua";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg-page)" }}
    >
      <Navbar variant="authenticated" showBack title="Riwayat Laporan" />

      <main className="w-full max-w-[800px] mx-auto px-5 md:px-6 lg:px-8 pt-5 pb-24 space-y-4">

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Cari Laporan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 px-4 rounded-full bg-white outline-none text-sm"
          style={{
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
          }}
        />

        {/* Filter Chips */}
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  console.log("filter");
                }}
                className="flex-shrink-0 h-8 px-4 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: isActive
                    ? "var(--color-primary)"
                    : "#E0E0E0",
                  color: isActive ? "#ffffff" : "var(--color-text-tertiary)",
                }}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Card List */}
        <div className="flex flex-col gap-4">
          {filtered.length === 0 ? (
            <div
              className="py-16 text-center text-sm"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {isFiltering
                ? "Tidak ada laporan dengan status ini"
                : "Belum ada laporan yang dikirim"}
            </div>
          ) : (
            filtered.map((laporan) => (
              <div
                key={laporan.id}
                className="bg-white rounded-lg p-4 cursor-pointer transition-shadow hover:shadow-sm"
                style={{
                  border: `1px solid ${STATUS_BORDER[laporan.status]}`,
                }}
                onClick={() => console.log("go to detail")}
              >
                {/* Top Row */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p
                      className="font-semibold text-base leading-snug"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {laporan.title}
                    </p>
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {laporan.subtitle}
                    </p>
                  </div>
                  <span
                    className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: STATUS_BADGE[laporan.status].bg,
                      color: STATUS_BADGE[laporan.status].color,
                    }}
                  >
                    {laporan.status}
                  </span>
                </div>

                {/* Meta Row */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[
                    { label: "Dikirim", value: laporan.dikirim },
                    { label: "Keparahan", value: laporan.keparahan },
                    { label: "Durasi", value: laporan.durasi },
                    { label: "Jenis", value: laporan.jenis },
                  ].map((meta) => (
                    <div key={meta.label}>
                      <p
                        className="text-[10px] leading-tight"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {meta.label}
                      </p>
                      <p
                        className="text-[12px] font-medium mt-0.5 leading-tight"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {meta.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bottom Row */}
                <div
                  className="flex justify-between items-center mt-4 pt-3"
                  style={{ borderTop: "1px solid var(--color-border)" }}
                >
                  <span
                    className="font-mono text-[11px]"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {laporan.id}
                  </span>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Lihat Detail ›
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
