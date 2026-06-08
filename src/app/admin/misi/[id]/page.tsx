import {
  AdminMissionTopBar,
  formatMissionDateRange,
  getInitials,
  MissionDetailRow,
  MissionSectionCard,
  StatusBadge,
} from "../_components/admin-mission-ui";
import { MissionDetailActions } from "../_components/mission-actions";
import {
  ADMIN_MISSION_DETAIL_CONTAINER,
  loadAdminMissionDetail,
  requireAdminSupabase,
} from "../_components/server-data";
import {
  displayMissionValue,
  getVolunteerProfile,
  missionTitle,
} from "../_components/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminMissionDetailPage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = String(rawId ?? "").trim();
  const supabase = await requireAdminSupabase();
  const { mission, volunteers, error } = id
    ? await loadAdminMissionDetail(supabase, id)
    : { mission: null, volunteers: [], error: "ID misi tidak valid." };
  const title = mission ? missionTitle(mission) : "Misi";
  const subtitle = mission ? displayMissionValue(mission.lokasi) : "Detail misi";

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#202124]">
      <AdminMissionTopBar title={title} subtitle={subtitle} backHref="/admin/misi" />

      <main className={`${ADMIN_MISSION_DETAIL_CONTAINER} space-y-5 pb-12 pt-5`}>
        {error ? (
          <MissionSectionCard title="Misi belum dapat dimuat">
            <p className="text-[14px] font-semibold text-[#D3262E]">{error}</p>
          </MissionSectionCard>
        ) : mission ? (
          <>
            <MissionSectionCard title="Detail Misi" action={<StatusBadge status={mission.status} />}>
              <MissionDetailRow label="Nama Misi" value={missionTitle(mission)} />
              <MissionDetailRow label="Lokasi" value={displayMissionValue(mission.lokasi)} />
              <MissionDetailRow
                label="Tanggal"
                value={formatMissionDateRange(mission.tanggal_mulai, mission.tanggal_selesai)}
              />
              <MissionDetailRow label="Jenis" value={displayMissionValue(mission.jenis)} />
              <MissionDetailRow
                label="Relawan Terdaftar"
                value={`${mission.registration_count} / ${mission.kuota ?? 0} relawan`}
              />
              <MissionDetailRow label="Deskripsi" value={displayMissionValue(mission.deskripsi)} />
              {mission.persyaratan?.length ? (
                <MissionDetailRow label="Persyaratan" value={mission.persyaratan.join("\n")} />
              ) : null}
            </MissionSectionCard>

            <MissionSectionCard title="Daftar Relawan Terdaftar">
              {volunteers.length === 0 ? (
                <p className="py-4 text-[13px] font-semibold text-[#777777]">
                  Belum ada relawan yang terdaftar pada misi ini.
                </p>
              ) : (
                <div className="space-y-3">
                  {volunteers.map((volunteer, index) => {
                    const profile = getVolunteerProfile(volunteer.profiles);
                    const name = profile?.nama || `Relawan ${index + 1}`;
                    const meta = profile?.nim || profile?.no_hp || volunteer.user_id || "-";
                    const colors = ["bg-[#D3262E]", "bg-[#84A13C]", "bg-[#D9D8EA] text-[#202124]"];

                    return (
                      <div key={volunteer.id} className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-extrabold text-white ${colors[index % colors.length]}`}
                        >
                          {getInitials(name)}
                        </div>
                        <div className="min-w-0">
                          <p className="break-words text-[15px] font-extrabold leading-tight text-[#202124] md:text-[17px]">
                            {name}
                          </p>
                          <p className="break-words text-[11px] font-semibold leading-tight text-[#777777] md:text-[13px]">
                            {meta}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </MissionSectionCard>

            <MissionDetailActions mission={mission} />
          </>
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
