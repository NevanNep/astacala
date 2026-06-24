import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/src/utils/supabase/admin";
import { createClient } from "@/src/utils/supabase/server";
import { isMfaSatisfied } from "@/src/lib/mfa";
import { AdminHamburgerMenu } from "@/src/components/AdminHamburgerMenu";

export const dynamic = "force-dynamic";

type Profile = {
  role: string | null;
  nama: string | null;
};

type EmbeddedProfile = { nama: string | null } | { nama: string | null }[] | null;

type ReportRow = {
  id: string;
  judul: string | null;
  jenis_bencana: string | null;
  alamat: string | null;
  created_at: string | null;
  profiles?: EmbeddedProfile;
};

type MissionRow = {
  id: string;
  judul: string | null;
  lokasi: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  jenis: string | null;
  kuota: number | null;
  status: "Terbuka" | "Penuh" | "Selesai" | string | null;
  created_at: string | null;
};

type CountResult = {
  count: number | null;
  error: { message: string } | null;
};

const ADMIN_ROLE = "admin";

async function countRows(
  supabase: ReturnType<typeof createClient>,
  table: string,
  filter?: { column: string; value: string | boolean }
): Promise<CountResult> {
  let query = supabase.from(table).select("id", { count: "exact", head: true });

  if (filter) {
    query = query.eq(filter.column, filter.value);
  }

  const { count, error } = await query;
  return { count, error };
}

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatReportTime(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const dayMonth = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
  }).format(date);
  const time = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${dayMonth} · ${time}`;
}

function formatMissionDate(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getDuration(start: string | null, end: string | null) {
  if (!start || !end) return "-";

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "-";
  }

  const diff = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1
  );
  return `${diff} Hari`;
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");
  return initials || "AD";
}

function getProfileName(profile: EmbeddedProfile | undefined) {
  if (Array.isArray(profile)) {
    return profile[0]?.nama ?? "Relawan";
  }

  return profile?.nama ?? "Relawan";
}

function getMissionBadge(status: MissionRow["status"]) {
  if (status === "Penuh") {
    return { label: "Penuh", className: "bg-[#FFF1D2] text-[#E7A320]" };
  }

  if (status === "Selesai") {
    return { label: "Selesai", className: "bg-[#E7E7E7] text-[#8A8A8A]" };
  }

  return { label: "Aktif", className: "bg-[#D8F0DA] text-[#2E7D32]" };
}

function AstacalaLogo({ size = 76 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size * 0.72}
      viewBox="0 0 120 86"
      className="shrink-0"
    >
      <path d="M7 66C31 18 66 2 105 12C75 19 48 38 23 74L7 66Z" fill="#F5EE20" />
      <path d="M6 74C42 52 77 45 114 48C78 59 43 68 6 82V74Z" fill="#2E7D32" />
      <path d="M18 60C45 26 74 16 109 18C83 28 60 45 38 68L18 60Z" fill="#2B52A3" />
      <path d="M4 82C44 61 78 51 116 50" stroke="#1B1B1B" strokeWidth="4" />
    </svg>
  );
}



function StatCard({
  label,
  value,
  detail,
  color = "text-[#111111]",
}: {
  label: string;
  value: number;
  detail: string;
  color?: string;
}) {
  return (
    <div className="min-h-[132px] rounded-[8px] bg-white px-6 py-5 shadow-[0_8px_18px_rgba(0,0,0,0.04)]">
      <p className="text-[17px] font-medium leading-none text-[#1F1F1F]">{label}</p>
      <p className={`mt-4 text-[56px] font-medium leading-[0.9] ${color}`}>{value}</p>
      <p className="mt-3 text-[16px] leading-none text-[#8B8B8B]">{detail}</p>
    </div>
  );
}

function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#FFF4D9] px-5 py-2 text-[14px] font-semibold text-[#F0B12A]">
      {children}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const userClient = createClient(await cookies());
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Server-side 2FA gate: a user with 2FA enabled must finish OTP first.
  if (!(await isMfaSatisfied(user))) {
    redirect("/login/2fa");
  }

  const { data: profile, error: profileError } = await userClient
    .from("profiles")
    .select("role, nama")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (profileError || profile?.role !== ADMIN_ROLE) {
    redirect("/dashboard");
  }

  const supabase = createAdminClient() ?? userClient;
  const [
    totalLaporan,
    laporanPending,
    misiTerbuka,
    totalRelawan,
    activeRegistrations,
    pendingReportsResult,
    missionsResult,
  ] = await Promise.all([
    countRows(supabase, "laporan"),
    countRows(supabase, "laporan", { column: "status", value: "Pending" }),
    countRows(supabase, "misi", { column: "status", value: "Terbuka" }),
    countRows(supabase, "profiles", { column: "role", value: "relawan" }),
    countRows(supabase, "misi_relawan"),
    supabase
      .from("laporan")
      .select("id, judul, jenis_bencana, alamat, created_at, profiles(nama)")
      .eq("status", "Pending")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("misi")
      .select("id, judul, lokasi, tanggal_mulai, tanggal_selesai, jenis, kuota, status, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const pendingReports = !pendingReportsResult.error
    ? ((pendingReportsResult.data ?? []) as ReportRow[])
    : [];
  const missions = !missionsResult.error
    ? ((missionsResult.data ?? []) as MissionRow[])
    : [];
  const missionIds = missions.map((mission) => mission.id);
  const registrationsResult = missionIds.length
    ? await supabase.from("misi_relawan").select("misi_id").in("misi_id", missionIds)
    : { data: [], error: null };
  const missionRegistrationCounts = new Map<string, number>();

  for (const registration of registrationsResult.data ?? []) {
    const misiId = (registration as { misi_id: string | null }).misi_id;
    if (misiId) {
      missionRegistrationCounts.set(misiId, (missionRegistrationCounts.get(misiId) ?? 0) + 1);
    }
  }

  const adminName = profile.nama || user.email || "Admin";
  const initials = getInitials(adminName);
  const hasStatsError = [
    totalLaporan,
    laporanPending,
    misiTerbuka,
    totalRelawan,
    activeRegistrations,
  ].some((result) => result.error);

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#101010]">
      <header className="sticky top-0 z-20 border-b border-[#E4E4E4] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex h-[106px] max-w-[1180px] items-center justify-between px-8">
          <Link href="/admin/dashboard" className="flex items-center gap-5" aria-label="Astacala admin dashboard">
            <AstacalaLogo size={84} />
            <span className="text-[48px] font-extrabold leading-none tracking-[0] text-[#E21221]">
              ASTACALA
            </span>
          </Link>
          <AdminHamburgerMenu />
        </div>
      </header>

      <main>
        <section className="bg-[#CC2028]">
          <div className="mx-auto flex min-h-[160px] max-w-[1180px] items-center justify-between px-8 py-8">
            <div>
              <h1 className="max-w-[620px] text-[38px] font-semibold leading-[1.04] tracking-[0] text-white">
                Selamat Datang,
                <br />
                {adminName}
              </h1>
              <p className="mt-5 text-[17px] font-medium text-white/85">{formatFullDate(new Date())}</p>
            </div>
            <div className="flex h-[86px] w-[86px] items-center justify-center rounded-full bg-white text-[34px] font-medium text-[#111111]">
              {initials}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-8 py-8">
          {hasStatsError && (
            <div className="mb-5 rounded-[8px] border border-[#F0B12A] bg-white px-5 py-4 text-[16px] text-[#767676]">
              Sebagian statistik belum dapat dimuat.
            </div>
          )}

          <div className="grid grid-cols-4 gap-6">
            <StatCard label="Total Laporan" value={totalLaporan.count ?? 0} detail="Dari database" />
            <StatCard
              label="Perlu Verifikasi"
              value={laporanPending.count ?? 0}
              detail="Segera ditindak"
              color="text-[#D3262E]"
            />
            <StatCard
              label="Misi Aktif"
              value={misiTerbuka.count ?? 0}
              detail={`${activeRegistrations.count ?? 0} relawan terlibat`}
              color="text-[#263C94]"
            />
            <StatCard
              label="Relawan Aktif"
              value={totalRelawan.count ?? 0}
              detail="Dari database"
              color="text-[#269243]"
            />
          </div>
        </section>

        <section id="menunggu-verifikasi" className="mx-auto max-w-[1180px] px-8 pb-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[28px] font-bold leading-none tracking-[0]">Menunggu Verifikasi</h2>
            <Link
              href="/admin/laporan"
              className="text-[18px] font-bold text-[#CC2028] hover:underline"
            >
              Lihat semua →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {pendingReports.length > 0 ? (
              pendingReports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-[8px] border border-[#1B1B1B] bg-white px-6 py-5"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[23px] font-semibold leading-none">
                        {report.jenis_bencana ?? report.judul ?? "Laporan"}
                      </h3>
                      <p className="mt-3 text-[15px] font-medium text-[#737373]">#{report.id}</p>
                    </div>
                    <StatusBadge>Pending</StatusBadge>
                  </div>

                  <div className="space-y-1 text-[16px] font-semibold leading-tight">
                    <p>📍 {report.alamat ?? "Lokasi belum tersedia"}</p>
                    <p>👤 {getProfileName(report.profiles)}</p>
                  </div>

                  <p className="mt-7 text-[15px] font-medium text-[#737373]">
                    {formatReportTime(report.created_at)}
                  </p>

                  <Link
                    href={`/admin/laporan/${encodeURIComponent(report.id)}`}
                    className="mt-6 flex h-[48px] w-full items-center justify-center rounded-full bg-[#D4282E] text-[15px] font-bold text-white transition-colors hover:bg-[#B71C1C]"
                  >
                    Verifikasi
                  </Link>
                </article>
              ))
            ) : (
              <div className="col-span-3 rounded-[8px] border border-[#1B1B1B] bg-white px-6 py-8 text-[18px] font-medium text-[#737373]">
                Tidak ada laporan yang menunggu verifikasi.
              </div>
            )}
          </div>
        </section>

        <section id="misi-aktif" className="mx-auto max-w-[1180px] px-8 pb-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[28px] font-bold leading-none tracking-[0]">Misi Aktif</h2>
            <Link href="/admin/misi" className="text-[18px] font-bold text-[#CC2028] hover:underline">
              Kelola →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {missions.length > 0 ? (
              missions.map((mission) => {
                const badge = getMissionBadge(mission.status);
                const registered = missionRegistrationCounts.get(mission.id) ?? 0;
                const quota = mission.kuota ?? 0;

                return (
                  <article
                    key={mission.id}
                    className="rounded-[8px] border border-[#1B1B1B] bg-white px-6 py-5"
                  >
                    <div className="mb-12 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-[23px] font-semibold leading-none">
                          {mission.judul ?? "Misi tanpa judul"}
                        </h3>
                        <p className="mt-2 text-[15px] font-medium text-[#737373]">
                          {mission.lokasi ?? "Lokasi belum tersedia"}
                        </p>
                      </div>
                      <span className={`rounded-full px-5 py-2 text-[14px] font-bold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-[15px] leading-tight">
                      <div>
                        <p className="font-medium text-[#737373]">Mulai</p>
                        <p className="mt-1 font-semibold text-[#111111]">
                          {formatMissionDate(mission.tanggal_mulai)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-[#737373]">Relawan</p>
                        <p className="mt-1 font-semibold text-[#111111]">
                          {registered}/{quota}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-[#737373]">Durasi</p>
                        <p className="mt-1 font-semibold text-[#111111]">
                          {getDuration(mission.tanggal_mulai, mission.tanggal_selesai)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-[#737373]">Jenis</p>
                        <p className="mt-1 font-semibold text-[#111111]">
                          {mission.jenis ?? "-"}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="col-span-3 rounded-[8px] border border-[#1B1B1B] bg-white px-6 py-8 text-[18px] font-medium text-[#737373]">
                Tidak ada misi aktif.
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-[#202020]">
        <div className="mx-auto grid max-w-[1180px] grid-cols-[1fr_260px] gap-10 px-8 py-12 text-white">
          <div>
            <div className="flex items-center gap-5">
              <AstacalaLogo size={84} />
              <span className="text-[48px] font-extrabold leading-none tracking-[0] text-[#FF2632]">
                ASTACALA
              </span>
            </div>
            <p className="mt-6 text-[17px] text-white/35">
              Perhimpunan Mahasiswa Pecinta Alam Universitas Telkom
            </p>
            <div className="mt-16 flex items-end gap-7 text-[32px] font-semibold text-white">
              <span>⌘</span>
              <span className="rounded-[4px] border border-white px-1 text-[22px] leading-none">in</span>
              <span>𝕏</span>
              <span>◎</span>
              <span>▶</span>
            </div>
          </div>

          <div>
            <h3 className="text-[22px] font-bold">Explore</h3>
            <nav className="mt-8 flex flex-col gap-6 text-[22px] text-white/75">
              <Link href="#menunggu-verifikasi" className="hover:text-white">
                Laporan
              </Link>
              <Link href="#menunggu-verifikasi" className="hover:text-white">
                Verifikasi
              </Link>
              <Link href="#misi-aktif" className="hover:text-white">
                Misi Aktif
              </Link>
              <Link href="#misi-aktif" className="hover:text-white">
                Relawan
              </Link>
              <Link href="#misi-aktif" className="hover:text-white">
                Berita
              </Link>
              <Link href="#misi-aktif" className="hover:text-white">
                Pusat Kendali
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
