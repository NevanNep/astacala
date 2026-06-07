import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/src/utils/supabase/admin";
import { createClient } from "@/src/utils/supabase/server";
import type { AdminReportDetail } from "../_components/types";
import { getReporterProfile } from "../_components/types";
import { AdminTopBar, DetailCard, displayValue, formatAdminDateTime, reportTitle } from "../_components/admin-report-ui";
import { AdminReportDetailClient } from "../_components/admin-report-detail-client";

export const dynamic = "force-dynamic";

type AdminProfile = {
  role: string | null;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

async function requireAdminSupabase() {
  const userClient = createClient(await cookies());
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<AdminProfile>();

  if (profileError || profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return createAdminClient() ?? userClient;
}

async function loadReport(supabase: Awaited<ReturnType<typeof requireAdminSupabase>>, id: string) {
  const { data, error } = await supabase
    .from("laporan")
    .select("*, laporan_media(*), profiles(nama, nim, no_hp)")
    .eq("id", id)
    .maybeSingle();

  if (!error) {
    return { report: data as AdminReportDetail | null, error: null };
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("laporan")
    .select("*, laporan_media(*)")
    .eq("id", id)
    .maybeSingle();

  if (fallbackError) {
    return { report: null, error: error.message };
  }

  return { report: fallbackData as AdminReportDetail | null, error: null };
}

async function attachReporterStats(
  supabase: Awaited<ReturnType<typeof requireAdminSupabase>>,
  report: AdminReportDetail
): Promise<AdminReportDetail> {
  if (!report.user_id) {
    return {
      ...report,
      reporterStats: {
        totalReports: null,
        acceptedReports: null,
      },
    };
  }

  const [totalReports, acceptedReports] = await Promise.all([
    supabase.from("laporan").select("id", { count: "exact", head: true }).eq("user_id", report.user_id),
    supabase
      .from("laporan")
      .select("id", { count: "exact", head: true })
      .eq("user_id", report.user_id)
      .eq("status", "Diterima"),
  ]);

  return {
    ...report,
    reporterStats: {
      totalReports: totalReports.error ? null : totalReports.count ?? 0,
      acceptedReports: acceptedReports.error ? null : acceptedReports.count ?? 0,
    },
  };
}

export default async function AdminReportDetailPage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = String(rawId ?? "").trim();
  const supabase = await requireAdminSupabase();
  const { report, error } = id ? await loadReport(supabase, id) : { report: null, error: "ID laporan tidak valid." };
  const reportWithStats = report ? await attachReporterStats(supabase, report) : null;
  const reporter = getReporterProfile(reportWithStats?.profiles);
  const title = reportWithStats ? `#${reportWithStats.id} - ${reportTitle(reportWithStats)}` : `#${id || "Laporan"}`;
  const subtitle = reportWithStats
    ? `${displayValue(reporter?.nama ?? null)} - ${formatAdminDateTime(reportWithStats.created_at)}`
    : "Detail laporan";

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#202124]">
      <AdminTopBar title={title} subtitle={subtitle} backHref="/admin/laporan" />

      <main className="mx-auto w-full max-w-[760px] px-2 pb-8 pt-5 md:max-w-[860px] md:px-8">
        {error ? (
          <DetailCard title="Laporan belum dapat dimuat">
            <p className="text-[14px] font-semibold text-[#D3262E]">{error}</p>
          </DetailCard>
        ) : reportWithStats ? (
          <AdminReportDetailClient initialReport={reportWithStats} />
        ) : (
          <DetailCard title="Laporan tidak ditemukan">
            <p className="text-[14px] font-semibold text-[#777777]">
              Laporan dengan ID ini tidak ditemukan atau sudah tidak tersedia.
            </p>
          </DetailCard>
        )}
      </main>
    </div>
  );
}
