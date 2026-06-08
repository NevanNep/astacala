import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface PublicNewsListItem {
  id: string;
  judul: string;
  kategori: string;
  lokasi: string;
  created_at: string;
  image_url: string | null;
  konten: string;
  terverifikasi: boolean;
}

export interface PublicNewsDetail {
  id: string;
  judul: string;
  konten: string;
  kategori: string;
  lokasi: string;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  terverifikasi: boolean;
  created_at: string;
  updated_at: string;
}

export async function requirePublicSupabase() {
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

  return supabase;
}

export async function loadPublishedNews(
  supabase: SupabaseClient,
  search?: string,
  category?: string
) {
  try {
    let query = supabase
      .from("berita")
      .select("id, judul, kategori, lokasi, created_at, image_url, konten, terverifikasi")
      .eq("terverifikasi", true)
      .order("created_at", { ascending: false });

    if (category && category !== "Semua") {
      query = query.eq("kategori", category);
    }

    if (search) {
      // Use logical OR for search across multiple text columns
      query = query.or(`judul.ilike.%${search}%,konten.ilike.%${search}%,lokasi.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { news: (data || []) as PublicNewsListItem[], error: null };
  } catch (error) {
    console.error("Load public news error:", error);
    return { news: [], error: "Gagal memuat berita" };
  }
}

export async function loadPublishedNewsDetail(supabase: SupabaseClient, id: string) {
  try {
    const { data, error } = await supabase
      .from("berita")
      .select("*")
      .eq("id", id)
      .eq("terverifikasi", true)
      .single();

    if (error) throw error;
    if (!data) return { news: null, error: "Berita tidak ditemukan atau belum dipublikasikan" };
    return { news: data as PublicNewsDetail, error: null };
  } catch (error) {
    console.error("Load public news detail error:", error);
    return { news: null, error: "Gagal memuat detail berita" };
  }
}
