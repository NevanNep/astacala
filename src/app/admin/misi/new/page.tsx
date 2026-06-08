import { AdminMissionTopBar } from "../_components/admin-mission-ui";
import { MissionForm } from "../_components/mission-form";
import {
  ADMIN_MISSION_DETAIL_CONTAINER,
  requireAdminSupabase,
} from "../_components/server-data";

export const dynamic = "force-dynamic";

export default async function NewAdminMissionPage() {
  await requireAdminSupabase();

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#202124]">
      <AdminMissionTopBar title="Buat Misi Baru" backHref="/admin/misi" />

      <main className={`${ADMIN_MISSION_DETAIL_CONTAINER} pb-12 pt-5`}>
        <h2 className="mb-3 text-[16px] font-extrabold leading-none text-[#202124] md:text-[22px]">
          Informasi Misi
        </h2>
        <MissionForm mode="create" />
      </main>
    </div>
  );
}
