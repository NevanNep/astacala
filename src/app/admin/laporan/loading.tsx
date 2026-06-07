import { AdminTopBar } from "./_components/admin-report-ui";

export default function AdminReportsLoading() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#202124]">
      <AdminTopBar
        title="Laporan Masuk"
        subtitle="Verifikasi laporan bencana relawan"
        backHref="/admin/dashboard"
        width="wide"
      />
      <main className="mx-auto w-full max-w-[1200px] px-4 py-5 md:px-8 lg:px-12">
        <section className="mb-5 rounded-[8px] border border-[#747474] bg-white p-4">
          <div className="h-8 w-48 animate-pulse rounded-[8px] bg-[#D9D9D9]" />
          <div className="mt-4 h-11 w-full animate-pulse rounded-[8px] bg-[#E7E7E7]" />
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-[8px] border border-[#747474] bg-white p-4">
              <div className="h-5 w-28 rounded bg-[#D9D9D9]" />
              <div className="mt-4 h-7 w-40 rounded bg-[#D9D9D9]" />
              <div className="mt-8 h-4 w-full rounded bg-[#E7E7E7]" />
              <div className="mt-3 h-4 w-2/3 rounded bg-[#E7E7E7]" />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
