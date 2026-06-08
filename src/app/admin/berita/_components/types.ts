export type NewsStatus = "Draft" | "Publik";

export type NewsCategory = "Banjir" | "Gempa" | "Longsor" | "Kebakaran" | "Lainnya" | "";

export interface AdminNewsListItem {
  id: string;
  judul: string;
  kategori: string;
  lokasi: string;
  created_at: string;
  terverifikasi: boolean;
  // Based on standard db fields, we omit ones we don't need for the list
}

export interface AdminNewsDetail {
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

export interface BeritaFormValues {
  judul: string;
  kategori: NewsCategory;
  sumber_laporan: string; // UI Only
  lokasi: string;
  konten: string;
  image_url: string | null;
  terverifikasi: boolean;
}

export interface UpdateNewsPayload {
  judul: string;
  kategori: string;
  lokasi: string;
  konten: string;
  image_url: string | null;
  terverifikasi: boolean;
}

export function normalizeBeritaStatus(terverifikasi: boolean | null | undefined): NewsStatus {
  return terverifikasi ? "Publik" : "Draft";
}
