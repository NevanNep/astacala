import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/src/utils/supabase/admin";
import { createClient } from "@/src/utils/supabase/server";
import type {
  AdminMissionDetail,
  AdminMissionListItem,
  MissionVolunteer,
} from "./types";

export const ADMIN_MISSION_LIST_CONTAINER =
  "mx-auto w-full max-w-[1200px] px-4 md:px-8 lg:px-12";
export const ADMIN_MISSION_DETAIL_CONTAINER =
  "mx-auto w-full max-w-[760px] px-4 md:max-w-[860px] md:px-8";

type AdminProfile = {
  role: string | null;
};

type MissionRow = Omit<AdminMissionListItem, "registration_count">;
type RegistrationCountRow = {
  misi_id: string | null;
};

const ADMIN_ROLE = "admin";

export async function requireAdminSupabase() {
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

  if (profileError || profile?.role !== ADMIN_ROLE) {
    redirect("/dashboard");
  }

  return createAdminClient() ?? userClient;
}

function addRegistrationCounts(
  missions: MissionRow[],
  registrations: RegistrationCountRow[]
): AdminMissionListItem[] {
  const counts = new Map<string, number>();

  for (const registration of registrations) {
    if (registration.misi_id) {
      counts.set(registration.misi_id, (counts.get(registration.misi_id) ?? 0) + 1);
    }
  }

  return missions.map((mission) => ({
    ...mission,
    registration_count: counts.get(mission.id) ?? 0,
  }));
}

export async function loadAdminMissions(
  supabase: Awaited<ReturnType<typeof requireAdminSupabase>>
) {
  const { data: missions, error: missionError } = await supabase
    .from("misi")
    .select("*")
    .order("tanggal_mulai", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (missionError) {
    return { missions: [] as AdminMissionListItem[], error: missionError.message };
  }

  const { data: registrations, error: registrationError } = await supabase
    .from("misi_relawan")
    .select("misi_id");

  if (registrationError) {
    return { missions: [] as AdminMissionListItem[], error: registrationError.message };
  }

  return {
    missions: addRegistrationCounts(
      (missions ?? []) as MissionRow[],
      (registrations ?? []) as RegistrationCountRow[]
    ),
    error: null,
  };
}

export async function loadAdminMissionDetail(
  supabase: Awaited<ReturnType<typeof requireAdminSupabase>>,
  id: string
) {
  const { data: mission, error: missionError } = await supabase
    .from("misi")
    .select("*")
    .eq("id", id)
    .maybeSingle<MissionRow>();

  if (missionError) {
    return {
      mission: null,
      volunteers: [] as MissionVolunteer[],
      error: missionError.message,
    };
  }

  if (!mission) {
    return {
      mission: null,
      volunteers: [] as MissionVolunteer[],
      error: null,
    };
  }

  const { data: volunteers, error: volunteerError } = await supabase
    .from("misi_relawan")
    .select("id, misi_id, user_id, created_at, profiles(id, nama, nim, no_hp, role)")
    .eq("misi_id", id)
    .order("created_at", { ascending: false });

  if (!volunteerError) {
    const rows = (volunteers ?? []) as MissionVolunteer[];
    return {
      mission: { ...mission, registration_count: rows.length } as AdminMissionDetail,
      volunteers: rows,
      error: null,
    };
  }

  const { data: fallbackVolunteers, error: fallbackError } = await supabase
    .from("misi_relawan")
    .select("id, misi_id, user_id, created_at")
    .eq("misi_id", id)
    .order("created_at", { ascending: false });

  if (fallbackError) {
    return {
      mission: null,
      volunteers: [] as MissionVolunteer[],
      error: volunteerError.message,
    };
  }

  const rows = (fallbackVolunteers ?? []) as MissionVolunteer[];
  return {
    mission: { ...mission, registration_count: rows.length } as AdminMissionDetail,
    volunteers: rows,
    error: null,
  };
}
