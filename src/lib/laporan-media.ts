import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/src/utils/supabase/admin";

export const LAPORAN_MEDIA_BUCKET = "laporan-media";

// Signed URLs are short-lived so a leaked link cannot be reused for long.
export const LAPORAN_MEDIA_SIGNED_URL_TTL_SECONDS = 600; // 10 minutes

type MediaLike = { storage_path: string | null };

/**
 * Returns the supplied media records with a short-lived `signed_url` attached.
 *
 * MUST only be called after the caller has verified that the current user owns
 * the laporan or is an admin — this function does not perform authorization, it
 * only mints signed URLs for already-authorized media.
 *
 * Signing prefers the service-role client (bypasses storage RLS) and falls back
 * to the caller's authenticated client, which can still sign its own objects
 * thanks to the `laporan_media_owner_read` / `laporan_media_admin_read` policies.
 */
export async function signLaporanMediaUrls<T extends MediaLike>(
  fallbackClient: SupabaseClient,
  media: T[] | null | undefined,
  ttlSeconds: number = LAPORAN_MEDIA_SIGNED_URL_TTL_SECONDS
): Promise<(T & { signed_url: string | null })[]> {
  const items = media ?? [];
  if (items.length === 0) {
    return [];
  }

  const paths = Array.from(
    new Set(
      items
        .map((item) => item.storage_path)
        .filter((path): path is string => Boolean(path && path.trim()))
    )
  );

  if (paths.length === 0) {
    return items.map((item) => ({ ...item, signed_url: null }));
  }

  const signer: SupabaseClient = createAdminClient() ?? fallbackClient;
  const urlByPath = new Map<string, string>();

  const { data, error } = await signer.storage
    .from(LAPORAN_MEDIA_BUCKET)
    .createSignedUrls(paths, ttlSeconds);

  if (!error && data) {
    for (const entry of data) {
      if (entry.path && entry.signedUrl) {
        urlByPath.set(entry.path, entry.signedUrl);
      }
    }
  } else if (error) {
    console.error("Failed to sign laporan media URLs:", error.message);
  }

  return items.map((item) => ({
    ...item,
    signed_url: item.storage_path ? urlByPath.get(item.storage_path) ?? null : null,
  }));
}
