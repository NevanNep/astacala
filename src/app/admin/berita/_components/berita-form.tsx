"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNewsDetail, BeritaFormValues, NewsCategory, UpdateNewsPayload } from "./types";
import { PublishSuccessModal } from "./admin-berita-ui";

const EMPTY_VALUES: BeritaFormValues = {
  judul: "",
  kategori: "",
  sumber_laporan: "", // UI Only
  lokasi: "",
  konten: "",
  image_url: null,
  terverifikasi: false,
};

const NEWS_CATEGORIES: NewsCategory[] = ["Banjir", "Gempa", "Longsor", "Kebakaran", "Lainnya"];

type FieldErrors = Partial<Record<keyof BeritaFormValues, string>>;

function valuesFromNews(news?: AdminNewsDetail | null): BeritaFormValues {
  if (!news) return EMPTY_VALUES;

  return {
    judul: news.judul ?? "",
    kategori: (news.kategori as NewsCategory) ?? "",
    sumber_laporan: "", // Cannot be retrieved since it's not saved
    lokasi: news.lokasi ?? "",
    konten: news.konten ?? "",
    image_url: news.image_url ?? null,
    terverifikasi: news.terverifikasi ?? false,
  };
}

export function BeritaForm({
  mode,
  news,
}: {
  mode: "create" | "edit";
  news?: AdminNewsDetail | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<BeritaFormValues>(() => valuesFromNews(news));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isEdit = mode === "edit";

  useLayoutEffect(() => {
    if (isEdit) return;
    const fileInput = fileInputRef.current;

    return () => {
      setValues(valuesFromNews(null));
      setErrors({});
      setMessage(null);
      setSubmitting(false);
      setDeleting(false);
      setUploadingImage(false);
      setShowSuccessModal(false);
      if (fileInput) fileInput.value = "";
    };
  }, [isEdit]);

  const setField = (field: keyof BeritaFormValues, value: string | boolean | null) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage(null);
  };

  const validate = () => {
    const newErrors: FieldErrors = {};
    if (!values.judul.trim()) newErrors.judul = "Judul Berita wajib diisi.";
    if (!values.kategori.trim()) newErrors.kategori = "Kategori Bencana wajib dipilih.";
    if (!values.lokasi.trim()) newErrors.lokasi = "Lokasi wajib diisi.";
    if (!values.konten.trim()) newErrors.konten = "Isi Berita wajib diisi.";
    return newErrors;
  };

  const handleImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image_url: "Ukuran file maksimal 5MB" }));
      return;
    }

    setUploadingImage(true);
    setErrors((prev) => ({ ...prev, image_url: undefined }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/berita/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors((prev) => ({ ...prev, image_url: data.error || "Gagal mengunggah gambar" }));
        return;
      }

      setField("image_url", data.publicUrl);
    } catch {
      setErrors((prev) => ({ ...prev, image_url: "Terjadi kesalahan jaringan" }));
    } finally {
      setUploadingImage(false);
    }
  };

  const submitForm = async (isPublish: boolean) => {
    const newErrors = validate();
    setErrors(newErrors);
    setMessage(null);

    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);

    const payload: UpdateNewsPayload = {
      judul: values.judul.trim(),
      kategori: values.kategori.trim(),
      lokasi: values.lokasi.trim(),
      konten: values.konten.trim(),
      image_url: values.image_url,
      terverifikasi: isPublish,
    };

    try {
      const endpoint = isEdit && news ? `/api/admin/berita/${encodeURIComponent(news.id)}` : "/api/admin/berita";
      const response = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) router.push("/login");
        else if (response.status === 403) router.push("/dashboard");
        else setMessage(data.error || "Berita gagal disimpan.");
        return;
      }

      if (isPublish) {
        setShowSuccessModal(true);
      } else {
        router.push("/admin/berita");
        router.refresh();
      }
    } catch {
      setMessage("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!news) return;
    if (!window.confirm("Hapus berita ini?")) return;

    setDeleting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/berita/${encodeURIComponent(news.id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        if (response.status === 401) router.push("/login");
        else if (response.status === 403) router.push("/dashboard");
        else setMessage("Gagal menghapus berita.");
        return;
      }

      router.push("/admin/berita");
      router.refresh();
    } catch {
      setMessage("Terjadi kesalahan jaringan.");
    } finally {
      setDeleting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push("/admin/berita");
    router.refresh();
  };

  return (
    <>
      <form className="mb-10 rounded-[8px] bg-white px-5 py-6 shadow-[0_4px_12px_rgba(0,0,0,0.12)] md:px-8">
        <h2 className="mb-6 text-[16px] font-extrabold leading-none text-[#202124] md:text-[20px]">
          Konten Berita
        </h2>

        <div className="space-y-4">
          <TextField
            label="Judul Berita"
            required
            value={values.judul}
            onChange={(val) => setField("judul", val)}
            placeholder="Banjir Bandung"
            error={errors.judul}
          />

          <SelectField
            label="Kategori Bencana"
            required
            value={values.kategori}
            onChange={(val) => setField("kategori", val)}
            error={errors.kategori}
          />

          <TextField
            label="Sumber Laporan"
            value={values.sumber_laporan}
            onChange={(val) => setField("sumber_laporan", val)}
            placeholder="#LPR-121-313"
          />

          <TextField
            label="Lokasi"
            required
            value={values.lokasi}
            onChange={(val) => setField("lokasi", val)}
            placeholder="Bandung"
            error={errors.lokasi}
          />

          <TextAreaField
            label="Isi Berita"
            required
            value={values.konten}
            onChange={(val) => setField("konten", val)}
            placeholder="Jelaskan detail berita"
            minHeight="min-h-[120px]"
            error={errors.konten}
          />

          <div>
            <label className="mb-2 block text-[15px] font-bold leading-tight text-[#202124]">
              Foto Berita
            </label>
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImageUpload(file);
                e.target.value = "";
              }}
            />
            
            {values.image_url ? (
              <div className="relative h-40 w-full overflow-hidden rounded-[8px] border border-[#B8B8B8] bg-[#F3F3F3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={values.image_url}
                  alt="Berita"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setField("image_url", null)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  aria-label="Hapus gambar"
                >
                  &times;
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex h-32 w-full flex-col items-center justify-center rounded-[8px] border border-[#B8B8B8] bg-[#F0F0F0] text-[#777777] hover:bg-[#EAEAEA] disabled:opacity-50"
              >
                {uploadingImage ? (
                  <span className="font-semibold">Mengunggah...</span>
                ) : (
                  <>
                    {/* Placeholder image icon */}
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mb-2 text-[#4A4A4A]"
                    >
                      <path
                        d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="text-[11px] font-bold">
                      JPG, PNG • Maks 5MB • Maks 1 Foto
                    </span>
                  </>
                )}
              </button>
            )}
            <FieldError value={errors.image_url} />
          </div>

          {message && (
            <p className="mt-4 rounded-[8px] border border-[#FF5B62] bg-[#FFF4F4] px-4 py-3 text-[13px] font-semibold text-[#D3262E]">
              {message}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/berita")}
                disabled={submitting || deleting}
                className="h-11 flex-1 rounded-full border border-[#E0E0E0] bg-white text-[13px] font-extrabold text-[#777777] shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition hover:text-[#D3262E]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => submitForm(false)}
                disabled={submitting || deleting}
                className="h-11 flex-1 rounded-full bg-[#FFEBC7] text-[13px] font-extrabold text-[#F2A21A] shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition hover:bg-[#FCE1B6]"
              >
                {submitting && !values.terverifikasi ? "..." : "Simpan sebagai draft"}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => submitForm(true)}
                disabled={submitting || deleting}
                className="h-11 flex-1 rounded-full bg-[#D3262E] text-[13px] font-extrabold text-white shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition hover:bg-[#B71C1C]"
              >
                {submitting && values.terverifikasi ? "Menyimpan..." : isEdit ? "Publikasi Perubahan" : "Publikasi"}
              </button>

              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting || deleting}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-[#7A7A7A] bg-white transition hover:border-[#D3262E] hover:text-[#D3262E]"
                  aria-label="Hapus berita"
                >
                  <svg
                    width="16"
                    height="18"
                    viewBox="0 0 16 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 18C2.45 18 1.97933 17.8043 1.588 17.413C1.19667 17.0217 1 16.551 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8043 17.021 14.413 17.413C14.0217 17.8043 13.551 18 13 18H3ZM13 3H3V16H13V3ZM5 14H7V5H5V14ZM9 14H11V5H9V14Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      <PublishSuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
      />
    </>
  );
}

function RequiredMark({ show }: { show?: boolean }) {
  return show ? <span className="text-[#D3262E]"> *</span> : null;
}

function FieldError({ value }: { value?: string }) {
  return value ? <p className="mt-1 text-[11px] font-semibold text-[#D3262E]">{value}</p> : null;
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-[14px] font-bold leading-tight text-[#202124]">
        {label}
        <RequiredMark show={required} />
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[40px] w-full rounded-[4px] border border-[#B8B8B8] bg-white px-3 text-[13px] font-semibold text-[#202124] outline-none placeholder:text-[#BBBBBB] focus:border-[#D3262E] focus:ring-2 focus:ring-[#D3262E]/15"
      />
      <FieldError value={error} />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-[14px] font-bold leading-tight text-[#202124]">
        {label}
        <RequiredMark show={required} />
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[40px] w-full rounded-[4px] border border-[#B8B8B8] bg-white px-3 text-[13px] font-semibold text-[#202124] outline-none focus:border-[#D3262E] focus:ring-2 focus:ring-[#D3262E]/15"
      >
        <option value="">Pilih jenis misi</option>
        {NEWS_CATEGORIES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError value={error} />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  minHeight,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  minHeight: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[14px] font-bold leading-tight text-[#202124]">
        {label}
        <RequiredMark show={required} />
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${minHeight} w-full resize-y rounded-[4px] border border-[#B8B8B8] bg-white px-3 py-3 text-[13px] font-semibold leading-relaxed text-[#202124] outline-none placeholder:text-[#BBBBBB] focus:border-[#D3262E] focus:ring-2 focus:ring-[#D3262E]/15`}
      />
      <FieldError value={error} />
    </div>
  );
}
