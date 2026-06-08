export const MISSION_STATUSES = ["Terbuka", "Penuh", "Selesai"] as const;

export type MissionStatus = (typeof MISSION_STATUSES)[number];

export type MissionVolunteerProfile = {
  id: string | null;
  nama: string | null;
  nim: string | null;
  no_hp: string | null;
  role?: string | null;
};

export type MissionVolunteer = {
  id: string;
  misi_id: string | null;
  user_id: string | null;
  created_at: string | null;
  profiles?: MissionVolunteerProfile | MissionVolunteerProfile[] | null;
};

export type AdminMissionListItem = {
  id: string;
  judul: string | null;
  lokasi: string | null;
  latitude: number | null;
  longitude: number | null;
  deskripsi: string | null;
  persyaratan: string[] | null;
  jenis: string | null;
  koordinator: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  kuota: number | null;
  status: MissionStatus | string | null;
  created_at: string | null;
  registration_count: number;
};

export type AdminMissionDetail = AdminMissionListItem;

export type MissionFormValues = {
  judul: string;
  jenis: string;
  kuota: string;
  lokasi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  deskripsi: string;
  persyaratan: string;
  status: MissionStatus;
};

export type CreateMissionPayload = {
  judul: string;
  jenis: string;
  kuota: number;
  lokasi: string;
  tanggal_mulai: string;
  tanggal_selesai?: string | null;
  deskripsi: string;
  persyaratan: string[];
  status?: MissionStatus;
};

export type UpdateMissionPayload = Partial<CreateMissionPayload> & {
  status?: MissionStatus;
};

export function normalizeMissionStatus(status: string | null | undefined): MissionStatus {
  return MISSION_STATUSES.includes(status as MissionStatus) ? (status as MissionStatus) : "Terbuka";
}

export function missionStatusLabel(status: string | null | undefined) {
  const normalized = normalizeMissionStatus(status);
  if (normalized === "Terbuka") return "Aktif";
  return normalized;
}

export function missionTitle(mission: Pick<AdminMissionListItem, "judul">) {
  return mission.judul?.trim() || "Misi Bencana";
}

export function displayMissionValue(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "-";
  const text = value?.trim();
  return text ? text : "-";
}

export function getVolunteerProfile(profile: MissionVolunteer["profiles"]) {
  if (Array.isArray(profile)) {
    return profile[0] ?? null;
  }

  return profile ?? null;
}

export function splitRequirements(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}
