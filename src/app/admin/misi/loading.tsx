import { AdminMissionTopBar } from "./_components/admin-mission-ui";
import { ADMIN_MISSION_LIST_CONTAINER } from "./_components/server-data";

export default function AdminMissionLoading() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#202124]">
      <AdminMissionTopBar title="Misi" backHref="/admin/dashboard" width="wide" />
      <main className={`${ADMIN_MISSION_LIST_CONTAINER} pb-16 pt-5`}>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[142px] animate-pulse rounded-[8px] border border-[#DDDDDD] bg-white"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
