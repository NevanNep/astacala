import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authorizeAdmin, jsonError } from "@/src/lib/admin-auth";

const NEWS_IMAGE_BUCKET = "berita-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const ALLOWED_IMAGE_MIME_TYPE_SET = new Set<string>(ALLOWED_IMAGE_MIME_TYPES);

function safeFileName(fileName: string) {
  const sanitized = fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  return sanitized || "image";
}

function isMissingBucketError(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes("bucket not found") || message.includes("bucket does not exist");
}

async function ensureNewsImageBucket(adminClient: SupabaseClient) {
  const { error: getBucketError } = await adminClient.storage.getBucket(NEWS_IMAGE_BUCKET);

  if (!getBucketError) {
    return null;
  }

  if (!isMissingBucketError(getBucketError)) {
    return getBucketError;
  }

  const { error: createBucketError } = await adminClient.storage.createBucket(NEWS_IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: MAX_IMAGE_SIZE,
    allowedMimeTypes: [...ALLOWED_IMAGE_MIME_TYPES],
  });

  if (createBucketError && !/already exists/i.test(createBucketError.message)) {
    return createBucketError;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request);
    if ("error" in auth) {
      return auth.error;
    }

    const formData = await request.formData();
    const fileValue = formData.get("file") ?? formData.get("image");

    if (!(fileValue instanceof File) || fileValue.size === 0) {
      return jsonError("File gambar wajib diisi", 400, "file");
    }

    if (!ALLOWED_IMAGE_MIME_TYPE_SET.has(fileValue.type)) {
      return jsonError("File harus berupa gambar JPG, PNG, atau WebP", 400, "file");
    }

    if (fileValue.size > MAX_IMAGE_SIZE) {
      return jsonError("Ukuran file maksimal 5MB", 400, "file");
    }

    const bucketError = await ensureNewsImageBucket(auth.adminClient);
    if (bucketError) {
      return jsonError(bucketError.message, 500);
    }

    const storagePath = `berita/${auth.user.id}/${Date.now()}-${safeFileName(fileValue.name)}`;
    const uploadOptions = {
      contentType: fileValue.type,
      upsert: false,
    };
    let uploadResult = await auth.adminClient.storage
      .from(NEWS_IMAGE_BUCKET)
      .upload(storagePath, fileValue, uploadOptions);

    if (isMissingBucketError(uploadResult.error)) {
      const retryBucketError = await ensureNewsImageBucket(auth.adminClient);
      if (!retryBucketError) {
        uploadResult = await auth.adminClient.storage
          .from(NEWS_IMAGE_BUCKET)
          .upload(storagePath, fileValue, uploadOptions);
      }
    }

    if (uploadResult.error) {
      return jsonError(uploadResult.error.message, 500);
    }

    const { data } = auth.adminClient.storage
      .from(NEWS_IMAGE_BUCKET)
      .getPublicUrl(storagePath);

    return NextResponse.json({
      path: storagePath,
      publicUrl: data.publicUrl,
    });
  } catch (error) {
    console.error("Upload news image error:", error);
    return jsonError("Internal server error", 500);
  }
}
