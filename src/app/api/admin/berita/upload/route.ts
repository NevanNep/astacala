import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin, jsonError } from "@/src/lib/admin-auth";

const NEWS_IMAGE_BUCKET = "berita-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function safeFileName(fileName: string) {
  const sanitized = fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  return sanitized || "image";
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

    if (!ALLOWED_IMAGE_MIME_TYPES.has(fileValue.type)) {
      return jsonError("File harus berupa gambar JPG, PNG, atau WebP", 400, "file");
    }

    if (fileValue.size > MAX_IMAGE_SIZE) {
      return jsonError("Ukuran file maksimal 5MB", 400, "file");
    }

    const storagePath = `berita/${auth.user.id}/${Date.now()}-${safeFileName(fileValue.name)}`;
    const { error } = await auth.adminClient.storage
      .from(NEWS_IMAGE_BUCKET)
      .upload(storagePath, fileValue, {
        contentType: fileValue.type,
        upsert: false,
      });

    if (error) {
      return jsonError(error.message, 500);
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
