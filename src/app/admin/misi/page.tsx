import Link from "next/link";
import {
  AdminMissionTopBar,
  MissionListCard,
} from "./_components/admin-mission-ui";
import {
  ADMIN_MISSION_LIST_CONTAINER,
  loadAdminMissions,
  requireAdminSupabase,
} from "./_components/server-data";
import { normalizeMissionStatus } from "./_components/types";

export const dynamic = "force-dynamic";

export default async function AdminMissionListPage() {
  const supabase = await requireAdminSupabase();
  const { missions, error } = await loadAdminMissions(supabase);
  const activeMissions = missions.filter(
    (mission) => normalizeMissionStatus(mission.status) !== "Selesai"
  );
  const completedMissions = missions.filter(
    (mission) => normalizeMissionStatus(mission.status) === "Selesai"
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#202124]">
      <AdminMissionTopBar
        title="Misi"
        backHref="/admin/dashboard"
        width="wide"
        action={
          <Link
            href="/admin/misi/new"
            className="inline-flex h-[32px] items-center justify-center rounded-full border border-[#747474] bg-white px-3 text-[11px] font-extrabold text-[#D3262E] transition hover:border-[#D3262E] hover:bg-[#D3262E] hover:text-white md:h-10 md:px-5 md:text-[13px]"
          >
            +Buat Misi
          </Link>
        }
      />

      <main className={`${ADMIN_MISSION_LIST_CONTAINER} pb-16 pt-5`}>
        {error ? (
          <section className="rounded-[8px] border border-[#FF5B62] bg-white p-5">
            <h2 className="text-[18px] font-extrabold text-[#D3262E]">Misi belum dapat dimuat</h2>
            <p className="mt-2 text-[14px] font-semibold text-[#777777]">{error}</p>
            <Link
              href="/admin/misi"
              className="mt-5 inline-flex h-10 items-center rounded-[8px] bg-[#D3262E] px-5 text-[13px] font-bold text-white"
            >
              Coba lagi
            </Link>
          </section>
        ) : missions.length === 0 ? (
          <section className="rounded-[8px] border border-[#747474] bg-white px-5 py-14 text-center">
            <h2 className="text-[20px] font-extrabold text-[#202124]">Belum ada misi</h2>
            <p className="mt-2 text-[14px] font-semibold text-[#777777]">
              Buat misi pertama untuk membuka pendaftaran relawan.
            </p>
            <Link
              href="/admin/misi/new"
              className="mt-5 inline-flex h-10 items-center rounded-full bg-[#D3262E] px-5 text-[13px] font-bold text-white"
            >
              Buat Misi
            </Link>
          </section>
        ) : (
          <div className="space-y-7">
            <MissionListSection title="Misi Aktif" emptyText="Tidak ada misi aktif." missions={activeMissions} />
            <MissionListSection
              title="Misi Selesai"
              emptyText="Belum ada misi selesai."
              missions={completedMissions}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function MissionListSection({
  title,
  emptyText,
  missions,
}: {
  title: string;
  emptyText: string;
  missions: Awaited<ReturnType<typeof loadAdminMissions>>["missions"];
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3 px-3 md:px-0">
        <h2 className="text-[16px] font-extrabold leading-none text-[#202124] md:text-[22px]">{title}</h2>
        <span className="text-[12px] font-bold text-[#777777] md:text-[14px]">{missions.length} misi</span>
      </div>

      {missions.length === 0 ? (
        <div className="rounded-[8px] border border-[#747474] bg-white px-5 py-10 text-center text-[14px] font-semibold text-[#777777]">
          {emptyText}
        </div>
      ) : (
        <div
          className={
            missions.length === 1
              ? "grid gap-4 lg:max-w-[620px]"
              : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          }
        >
          {missions.map((mission) => (
            <MissionListCard key={mission.id} mission={mission} />
          ))}
        </div>
      )}
    </section>
  );
}
