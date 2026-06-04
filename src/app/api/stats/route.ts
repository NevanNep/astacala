import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/src/utils/supabase/admin";

function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function loadCounts(client: SupabaseClient) {
  const [verifiedReports, completedMissions, activeVolunteers] = await Promise.all([
    client
      .from("laporan")
      .select("id", { count: "exact", head: true })
      .eq("status", "Diterima"),
    client
      .from("misi")
      .select("id", { count: "exact", head: true })
      .eq("status", "Selesai"),
    client
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "relawan"),
  ]);

  const error = [verifiedReports.error, completedMissions.error, activeVolunteers.error].find(Boolean);
  if (error) {
    throw new Error(error.message);
  }

  return {
    laporan_terverifikasi: verifiedReports.count ?? 0,
    misi_selesai: completedMissions.count ?? 0,
    relawan_aktif: activeVolunteers.count ?? 0,
  };
}

export async function GET() {
  try {
    const publicClient = createPublicClient();

    if (publicClient) {
      try {
        return NextResponse.json(await loadCounts(publicClient));
      } catch (error) {
        console.warn("Public stats count fell back to service role:", error);
      }
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json({ error: "Supabase client is not configured" }, { status: 500 });
    }

    return NextResponse.json(await loadCounts(adminClient));
  } catch (error) {
    console.error("Get public stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
