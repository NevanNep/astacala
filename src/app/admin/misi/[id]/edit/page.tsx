import { AdminMissionTopBar } from "../../_components/admin-mission-ui";
import { MissionForm } from "../../_components/mission-form";
import {
  ADMIN_MISSION_DETAIL_CONTAINER,
  loadAdminMissionDetail,
  requireAdminSupabase,
} from "../../_components/server-data";
import { MissionSectionCard } from "../../_components/admin-mission-ui";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAdminMissionPage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = String(rawId ?? "").trim();
  const supabase = await requireAdminSupabase();
  const { mission, error } = id
    ? await loadAdminMissionDetail(supabase, id)
    : { mission: null, error: "ID misi tidak valid." };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#202124]">
      <AdminMissionTopBar title="Edit Misi" backHref={mission ? `/admin/misi/${mission.id}` : "/admin/misi"} />

      <main className={`${ADMIN_MISSION_DETAIL_CONTAINER} pb-12 pt-5`}>
        <h2 className="mb-3 text-[16px] font-extrabold leading-none text-[#202124] md:text-[22px]">
          Informasi Misi
        </h2>

        {error ? (
          <MissionSectionCard title="Misi belum dapat dimuat">
            <p className="text-[14px] font-semibold text-[#D3262E]">{error}</p>
          </MissionSectionCard>
        ) : mission ? (
          <MissionForm key={mission.id} mode="edit" mission={mission} />
        ) : (
          <MissionSectionCard title="Misi tidak ditemukan">
            <p className="text-[14px] font-semibold text-[#777777]">
              Misi dengan ID ini tidak ditemukan atau sudah tidak tersedia.
            </p>
          </MissionSectionCard>
        )}
      </main>
    </div>
  );
}
