import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/src/utils/supabase/admin";
import { createClient } from "@/src/utils/supabase/server";

const DISASTER_TYPES = ["Banjir", "Gempa", "Longsor", "Kebakaran", "Tsunami", "Lainnya"] as const;
const SEVERITIES = ["Ringan", "Sedang", "Parah", "Kritis"] as const;
const REPORT_STATUSES = ["Pending", "Diterima", "Ditolak"] as const;
const MAX_MEDIA_PER_REPORT = 5;
const MEDIA_BUCKET = "laporan-media";
const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const ALLOWED_IMAGE_EXTENSIONS = /\.(png|jpe?g|webp)$/i;

type DisasterType = (typeof DISASTER_TYPES)[number];
type Severity = (typeof SEVERITIES)[number];
type ReportStatus = (typeof REPORT_STATUSES)[number];
type MediaType = "foto";
type ReportMediaEntry = {
  storage_path: string;
  type: MediaType;
  submittedType?: string;
};

type ReportPayload = {
  judul: string;
  latitude: number;
  longitude: number;
  alamat: string;
  detail: string | null;
  jenis_bencana: DisasterType;
  keparahan: Severity;
  deskripsi: string;
  kebutuhan: string[];
  media: ReportMediaEntry[];
  files: File[];
};

type AuthenticatedUser = {
  id: string;
  email?: string | null;
};

function jsonError(error: string, status: number, field?: string) {
  return NextResponse.json({ error, ...(field ? { field } : {}) }, { status });
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asNullableText(value: unknown) {
  const text = asText(value);
  return text.length > 0 ? text : null;
}

function asNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return Number.NaN;
}

function parseStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => asText(item)).filter(Boolean);
  }

  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => asText(item)).filter(Boolean) : [];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function mediaEntryCandidates(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => mediaEntryCandidates(item));
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return [value];
    }
  }

  return value == null ? [] : [value];
}

function parseMediaEntries(value: unknown) {
  const entries = mediaEntryCandidates(value);

  return entries
    .map((item) => {
      if (typeof item === "string") {
        const storagePath = item.trim();
        return storagePath ? { storage_path: storagePath, type: "foto" as const } : null;
      }

      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const storagePath = asText(record.storage_path ?? record.path);
        const submittedType = asText(record.type).toLowerCase();
        return storagePath
          ? {
              storage_path: storagePath,
              type: "foto" as const,
              ...(submittedType ? { submittedType } : {}),
            }
          : null;
      }

      return null;
    })
    .filter((item): item is ReportMediaEntry => Boolean(item));
}

function isAllowedImagePath(storagePath: string) {
  return ALLOWED_IMAGE_EXTENSIONS.test(storagePath);
}

function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return `File "${file.name}" tidak didukung. Gunakan PNG, JPG, JPEG, atau WebP.`;
  }

  if (!isAllowedImagePath(file.name)) {
    return `File "${file.name}" harus berekstensi .png, .jpg, .jpeg, atau .webp.`;
  }

  return null;
}

function hasUnsupportedSubmittedMediaType(item: ReportMediaEntry) {
  return Boolean(item.submittedType && item.submittedType !== "foto");
}

function validatePayload(payload: ReportPayload) {
  if (!payload.judul) return { error: "Judul laporan wajib diisi", field: "judul" };
  if (!Number.isFinite(payload.latitude) || payload.latitude < -90 || payload.latitude > 90) {
    return { error: "Latitude tidak valid", field: "latitude" };
  }
  if (!Number.isFinite(payload.longitude) || payload.longitude < -180 || payload.longitude > 180) {
    return { error: "Longitude tidak valid", field: "longitude" };
  }
  if (!payload.alamat) return { error: "Alamat wajib diisi", field: "alamat" };
  if (!DISASTER_TYPES.includes(payload.jenis_bencana)) {
    return { error: "Jenis bencana tidak valid", field: "jenis_bencana" };
  }
  if (!SEVERITIES.includes(payload.keparahan)) {
    return { error: "Tingkat keparahan tidak valid", field: "keparahan" };
  }
  if (payload.deskripsi.length < 30) {
    return { error: "Deskripsi kondisi minimal 30 karakter", field: "deskripsi" };
  }
  const invalidMediaPath = payload.media.find(
    (item) => hasUnsupportedSubmittedMediaType(item) || !isAllowedImagePath(item.storage_path)
  );
  if (invalidMediaPath) {
    return {
      error: "Media laporan hanya mendukung gambar PNG, JPG, JPEG, atau WebP",
      field: "media_paths",
    };
  }
  const invalidFileError = payload.files.map(validateImageFile).find(Boolean);
  if (invalidFileError) {
    return { error: invalidFileError, field: "media" };
  }
  if (payload.media.length + payload.files.length > MAX_MEDIA_PER_REPORT) {
    return { error: `Media maksimal ${MAX_MEDIA_PER_REPORT} file`, field: "media" };
  }

  return null;
}

async function parseJsonPayload(request: NextRequest): Promise<ReportPayload> {
  const body = await request.json();
  const media = parseMediaEntries(body.media ?? body.media_paths);

  return {
    judul: asText(body.judul ?? body.title),
    latitude: asNumber(body.latitude),
    longitude: asNumber(body.longitude),
    alamat: asText(body.alamat),
    detail: asNullableText(body.detail),
    jenis_bencana: asText(body.jenis_bencana) as DisasterType,
    keparahan: asText(body.keparahan) as Severity,
    deskripsi: asText(body.deskripsi),
    kebutuhan: parseStringArray(body.kebutuhan),
    media,
    files: [],
  };
}

async function parseFormPayload(request: NextRequest): Promise<ReportPayload> {
  const formData = await request.formData();
  const files = formData
    .getAll("media")
    .filter((item): item is File => item instanceof File && item.size > 0);
  const mediaPaths = [
    ...formData.getAll("media_paths"),
    ...formData.getAll("media_paths[]"),
  ].map((item) => (typeof item === "string" ? item : ""));
  const kebutuhanValues = [
    ...formData.getAll("kebutuhan"),
    ...formData.getAll("kebutuhan[]"),
  ].map((item) => (typeof item === "string" ? item : ""));

  return {
    judul: asText(formData.get("judul") ?? formData.get("title")),
    latitude: asNumber(formData.get("latitude")),
    longitude: asNumber(formData.get("longitude")),
    alamat: asText(formData.get("alamat")),
    detail: asNullableText(formData.get("detail")),
    jenis_bencana: asText(formData.get("jenis_bencana")) as DisasterType,
    keparahan: asText(formData.get("keparahan")) as Severity,
    deskripsi: asText(formData.get("deskripsi")),
    kebutuhan: kebutuhanValues.length > 0 ? parseStringArray(kebutuhanValues) : parseStringArray(formData.get("kebutuhan")),
    media: parseMediaEntries(mediaPaths),
    files,
  };
}

async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (bearerToken) {
    const admin = createAdminClient();
    const authClient = admin ?? supabase;
    const {
      data: { user },
    } = await authClient.auth.getUser(bearerToken);

    if (user) {
      return { id: user.id, email: user.email };
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { id: user.id, email: user.email };
  }

  return null;
}

async function generateReportId(db: ReturnType<typeof createClient>, year = new Date().getFullYear()) {
  const prefix = `LPR-${year}-`;
  const { data, error } = await db
    .from("laporan")
    .select("id")
    .like("id", `${prefix}%`)
    .order("id", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  const lastId = data?.[0]?.id;
  const lastSequence = typeof lastId === "string" ? Number(lastId.replace(prefix, "")) : 0;
  const nextSequence = Number.isFinite(lastSequence) ? lastSequence + 1 : 1;

  return `${prefix}${String(nextSequence).padStart(3, "0")}`;
}

function safeFileName(fileName: string) {
  const sanitized = fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  return sanitized || "media";
}

function isAllowedMediaPath(storagePath: string, userId: string, reportId: string) {
  const parts = storagePath.split("/");
  const hasUnsafeSegment = parts.some((part) => !part || part === "." || part === "..");

  if (hasUnsafeSegment || parts[0] !== userId) {
    return false;
  }

  if (parts.length === 2) {
    return true;
  }

  return parts.length === 3 && parts[1] === reportId;
}

async function uploadMediaFiles(
  db: ReturnType<typeof createClient>,
  userId: string,
  reportId: string,
  files: File[]
) {
  const uploaded: ReportMediaEntry[] = [];

  for (const [index, file] of files.entries()) {
    const storagePath = `${userId}/${reportId}/${Date.now()}-${index}-${safeFileName(file.name)}`;
    const { error } = await db.storage.from(MEDIA_BUCKET).upload(storagePath, file, {
      contentType: file.type || undefined,
      upsert: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    uploaded.push({
      storage_path: storagePath,
      type: "foto",
    });
  }

  return uploaded;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return jsonError("Unauthorized", 401);
    }

    const contentType = request.headers.get("content-type") ?? "";
    const payload = contentType.includes("multipart/form-data")
      ? await parseFormPayload(request)
      : await parseJsonPayload(request);
    const validationError = validatePayload(payload);

    if (validationError) {
      return jsonError(validationError.error, 400, validationError.field);
    }

    const cookieStore = await cookies();
    const userClient = createClient(cookieStore);
    const db = createAdminClient() ?? userClient;
    const laporanId = await generateReportId(db);
    const invalidMediaPath = payload.media.find(
      (item) => !isAllowedMediaPath(item.storage_path, user.id, laporanId)
    );

    if (invalidMediaPath) {
      return jsonError(
        "Media path harus berada di folder pengguna yang sedang login",
        400,
        "media_paths"
      );
    }

    const uploadedMedia = payload.files.length > 0
      ? await uploadMediaFiles(db, user.id, laporanId, payload.files)
      : [];
    const media = [...payload.media, ...uploadedMedia];

    const { error: laporanError } = await db.from("laporan").insert({
      id: laporanId,
      user_id: user.id,
      judul: payload.judul,
      latitude: payload.latitude,
      longitude: payload.longitude,
      alamat: payload.alamat,
      detail: payload.detail,
      jenis_bencana: payload.jenis_bencana,
      keparahan: payload.keparahan,
      deskripsi: payload.deskripsi,
      kebutuhan: payload.kebutuhan,
      status: "Pending" satisfies ReportStatus,
    });

    if (laporanError) {
      return jsonError(laporanError.message, 500);
    }

    if (media.length > 0) {
      const { error: mediaError } = await db.from("laporan_media").insert(
        media.map((item) => ({
          laporan_id: laporanId,
          storage_path: item.storage_path,
          type: item.type,
        }))
      );

      if (mediaError) {
        return jsonError(mediaError.message, 500);
      }
    }

    // TODO: Legacy cleanup. S08-S10 drafts now live in the client Zustand store,
    // and some Supabase projects no longer have a report_drafts table.
    cookieStore.delete("report_draft");

    return NextResponse.json(
      {
        id: laporanId,
        status: "Pending",
        media_count: media.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create report error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return jsonError("Unauthorized", 401);
    }

    const status = request.nextUrl.searchParams.get("status");
    const cookieStore = await cookies();
    const userClient = createClient(cookieStore);
    const db = createAdminClient() ?? userClient;
    let query = db
      .from("laporan")
      .select("*, laporan_media(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status && REPORT_STATUSES.includes(status as ReportStatus)) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ reports: data ?? [] });
  } catch (error) {
    console.error("List reports error:", error);
    return jsonError("Internal server error", 500);
  }
}
