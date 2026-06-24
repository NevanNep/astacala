export const DISASTER_TYPES = ["Banjir", "Gempa", "Longsor", "Kebakaran", "Tsunami", "Lainnya"] as const;
export const SEVERITY_OPTIONS = ["Ringan", "Sedang", "Parah", "Kritis"] as const;
export const NEED_OPTIONS = ["Logistik", "Tenda", "Obat", "Medis", "Perahu", "Alat Berat"] as const;

export type DisasterType = (typeof DISASTER_TYPES)[number];
export type Severity = (typeof SEVERITY_OPTIONS)[number];
export type ReportStatus = "Pending" | "Diterima" | "Ditolak";

export interface ReportDraft {
  latitude: number | null;
  longitude: number | null;
  alamat: string;
  detail: string;
  jenis_bencana: DisasterType | "";
  keparahan: Severity | "";
  deskripsi: string;
  kebutuhan: string[];
  media_paths: string[];
}

export interface ReportMediaItem {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
  createdAt: number;
}

export interface ReportSuccessSummary {
  id: string;
  status: ReportStatus | string;
  media_count: number;
  jenis_bencana: string;
  alamat: string;
  created_at: string;
}

export interface ReportRecord {
  id: string;
  judul: string | null;
  latitude: number | null;
  longitude: number | null;
  alamat: string | null;
  detail: string | null;
  jenis_bencana: string | null;
  keparahan: string | null;
  deskripsi: string | null;
  kebutuhan: string[] | null;
  status: ReportStatus | string | null;
  rejection_reason?: string | null;
  alasan_penolakan?: string | null;
  created_at: string | null;
  laporan_media?: ReportMediaRecord[] | null;
}

export interface ReportMediaRecord {
  id?: string | number;
  laporan_id?: string;
  storage_path: string | null;
  type: string | null;
  created_at?: string | null;
  // Short-lived signed URL generated server-side after auth/RBAC checks.
  // The laporan-media bucket is private, so this is the only way to view media.
  signed_url?: string | null;
}

const MEDIA_DB_NAME = "astacala-report-media";
const MEDIA_STORE_NAME = "files";
const MEDIA_DB_VERSION = 1;
const SUCCESS_STORAGE_KEY = "astacala-report-success";

export const MAX_MEDIA_FILES = 5;
export const MAX_MEDIA_SIZE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_MEDIA_TYPES = ["image/png", "image/jpeg", "image/webp"];

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MEDIA_DB_NAME, MEDIA_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
        db.createObjectStore(MEDIA_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onerror = () => reject(request.error ?? new Error("Gagal membuka penyimpanan media."));
    request.onsuccess = () => resolve(request.result);
  });
}

async function withMediaStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openMediaDb();

  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(MEDIA_STORE_NAME, mode);
    const store = transaction.objectStore(MEDIA_STORE_NAME);
    const request = run(store);

    request.onerror = () => reject(request.error ?? new Error("Gagal mengakses media laporan."));
    request.onsuccess = () => resolve(request.result);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => reject(transaction.error ?? new Error("Gagal menyimpan media laporan."));
  });
}

export function validateMediaFile(file: File) {
  if (!ACCEPTED_MEDIA_TYPES.includes(file.type)) {
    return "Gunakan foto PNG, JPG, JPEG, atau WebP.";
  }

  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    return "Ukuran foto maksimal 5 MB.";
  }

  return null;
}

export async function getReportMediaItems() {
  if (typeof indexedDB === "undefined") return [];
  return withMediaStore<ReportMediaItem[]>("readonly", (store) => store.getAll());
}

export async function addReportMediaFile(file: File) {
  const existing = await getReportMediaItems();

  if (existing.length >= MAX_MEDIA_FILES) {
    throw new Error(`Media maksimal ${MAX_MEDIA_FILES} foto.`);
  }

  const validationError = validateMediaFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const item: ReportMediaItem = {
    id: crypto.randomUUID(),
    name: file.name,
    type: file.type,
    size: file.size,
    file,
    createdAt: Date.now(),
  };

  await withMediaStore<IDBValidKey>("readwrite", (store) => store.put(item));
  return item;
}

export async function removeReportMediaFile(id: string) {
  await withMediaStore<undefined>("readwrite", (store) => store.delete(id));
}

export async function clearReportMediaFiles() {
  await withMediaStore<undefined>("readwrite", (store) => store.clear());
}

export function writeReportSuccessSummary(summary: ReportSuccessSummary) {
  sessionStorage.setItem(SUCCESS_STORAGE_KEY, JSON.stringify(summary));
}

export function readReportSuccessSummary() {
  if (typeof sessionStorage === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(SUCCESS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReportSuccessSummary) : null;
  } catch {
    return null;
  }
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function coordinateText(latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null) return "-";
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

export function truncateText(value: string | null | undefined, maxLength = 36) {
  const text = value?.trim() || "-";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}
