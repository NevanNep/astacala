import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AdminNewsDetail, AdminNewsListItem } from "./types";

export const ADMIN_BERITA_LIST_CONTAINER = "mx-auto w-full max-w-[1200px] px-4 md:px-8 lg:px-12";
const ADMIN_ROLE = "admin";

export async function requireAdminSupabase() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore error from setAll during Server Component render
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string | null }>();

  if (profileError || profile?.role !== ADMIN_ROLE) {
    redirect("/dashboard");
  }

  return supabase;
}

export async function loadAdminNews(supabase: SupabaseClient) {
  try {
    const { data, error } = await supabase
      .from("berita")
      .select("id, judul, kategori, lokasi, created_at, terverifikasi")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { news: (data || []) as AdminNewsListItem[], error: null };
  } catch (error) {
    console.error("Load admin news error:", error);
    return { news: [], error: "Gagal memuat berita" };
  }
}

export async function loadAdminNewsDetail(supabase: SupabaseClient, id: string) {
  try {
    const { data, error } = await supabase
      .from("berita")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return { news: null, error: "Berita tidak ditemukan" };
    return { news: data as AdminNewsDetail, error: null };
  } catch (error) {
    console.error("Load admin news detail error:", error);
    return { news: null, error: "Gagal memuat detail berita" };
  }
}
