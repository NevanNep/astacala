import { AdminMissionTopBar, MissionSectionCard } from "../_components/admin-mission-ui";
import { ADMIN_MISSION_DETAIL_CONTAINER } from "../_components/server-data";

export default function AdminMissionDetailLoading() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#202124]">
      <AdminMissionTopBar title="Misi" subtitle="Memuat detail misi" backHref="/admin/misi" />
      <main className={`${ADMIN_MISSION_DETAIL_CONTAINER} space-y-5 pb-12 pt-5`}>
        <MissionSectionCard title="Detail Misi">
          <div className="h-28 animate-pulse rounded-[8px] bg-[#EEEEEE]" />
        </MissionSectionCard>
        <MissionSectionCard title="Daftar Relawan Terdaftar">
          <div className="h-24 animate-pulse rounded-[8px] bg-[#EEEEEE]" />
        </MissionSectionCard>
      </main>
    </div>
  );
}
