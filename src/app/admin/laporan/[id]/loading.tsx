import { AdminTopBar, DetailCard } from "../_components/admin-report-ui";

export default function AdminReportDetailLoading() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#202124]">
      <AdminTopBar title="#Laporan" subtitle="Memuat detail laporan" backHref="/admin/laporan" />
      <main className="mx-auto w-full max-w-[760px] space-y-4 px-2 pb-8 pt-5 md:max-w-[860px] md:px-8">
        {["Detail Laporan", "Foto Bukti", "Lokasi Di Peta", "Data Relawan"].map((title) => (
          <DetailCard key={title} title={title}>
            <div className="space-y-3">
              <div className="h-5 w-full animate-pulse rounded bg-[#E7E7E7]" />
              <div className="h-5 w-5/6 animate-pulse rounded bg-[#E7E7E7]" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-[#E7E7E7]" />
            </div>
          </DetailCard>
        ))}
      </main>
    </div>
  );
}
