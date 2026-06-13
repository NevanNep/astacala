"use client";

import { FormEvent, useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AdminMissionDetail,
  MissionFormValues,
  MissionStatus,
  UpdateMissionPayload,
} from "./types";
import { normalizeMissionStatus, splitRequirements } from "./types";
import { statusOptionLabel } from "./admin-mission-ui";

const EMPTY_VALUES: MissionFormValues = {
  judul: "",
  jenis: "",
  kuota: "",
  lokasi: "",
  tanggal_mulai: "",
  tanggal_selesai: "",
  deskripsi: "",
  persyaratan: "",
  status: "Terbuka",
};

const MISSION_TYPE_OPTIONS = ["Evakuasi", "Distribusi Logistik", "Medis", "Pencarian", "Lainnya"];
const STATUS_OPTIONS: MissionStatus[] = ["Terbuka", "Penuh", "Selesai"];

type FieldErrors = Partial<Record<keyof MissionFormValues, string>>;

function toDateInput(value: string | null | undefined) {
  return value?.slice(0, 10) ?? "";
}

function valuesFromMission(mission?: AdminMissionDetail | null): MissionFormValues {
  if (!mission) return EMPTY_VALUES;

  return {
    judul: mission.judul ?? "",
    jenis: mission.jenis ?? "",
    kuota: mission.kuota ? String(mission.kuota) : "",
    lokasi: mission.lokasi ?? "",
    tanggal_mulai: toDateInput(mission.tanggal_mulai),
    tanggal_selesai: toDateInput(mission.tanggal_selesai),
    deskripsi: mission.deskripsi ?? "",
    persyaratan: mission.persyaratan?.join("\n") ?? "",
    status: normalizeMissionStatus(mission.status),
  };
}

function getApiError(value: unknown) {
  if (value && typeof value === "object" && "error" in value) {
    const message = (value as { error?: unknown }).error;
    return typeof message === "string" ? message : null;
  }

  return null;
}

function validateStepOne(values: MissionFormValues) {
  const errors: FieldErrors = {};
  const quota = Number(values.kuota);

  if (!values.judul.trim()) errors.judul = "Nama misi wajib diisi.";
  if (!values.jenis.trim()) errors.jenis = "Jenis misi wajib dipilih.";
  if (!Number.isInteger(quota) || quota <= 0) {
    errors.kuota = "Kuota harus berupa bilangan bulat positif.";
  }
  if (!values.lokasi.trim()) errors.lokasi = "Lokasi wajib diisi.";
  if (!values.tanggal_mulai) errors.tanggal_mulai = "Tanggal mulai wajib diisi.";
  if (!values.deskripsi.trim()) errors.deskripsi = "Deskripsi wajib diisi.";
  if (
    values.tanggal_mulai &&
    values.tanggal_selesai &&
    values.tanggal_selesai < values.tanggal_mulai
  ) {
    errors.tanggal_selesai = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
  }

  return errors;
}

function validateStepTwo(values: MissionFormValues) {
  const errors: FieldErrors = {};

  if (splitRequirements(values.persyaratan).length === 0) {
    errors.persyaratan = "Persyaratan wajib diisi.";
  }

  return errors;
}

export function MissionForm({
  mode,
  mission,
}: {
  mode: "create" | "edit";
  mission?: AdminMissionDetail | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<MissionFormValues>(() => valuesFromMission(mission));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEdit = mode === "edit";
  const actionLabel = isEdit ? "Submit" : "Buat Misi";
  const requirementsPlaceholder = "Harus anggota astacala\nTidak memiliki catatan medis";
  const hasVolunteers = (mission?.registration_count ?? 0) > 0;

  const payload = useMemo<UpdateMissionPayload>(() => {
    const requirements = splitRequirements(values.persyaratan);

    return {
      judul: values.judul.trim(),
      jenis: values.jenis.trim(),
      kuota: Number(values.kuota),
      lokasi: values.lokasi.trim(),
      tanggal_mulai: values.tanggal_mulai,
      tanggal_selesai: values.tanggal_selesai || null,
      deskripsi: values.deskripsi.trim(),
      persyaratan: requirements,
      status: values.status,
    };
  }, [values]);

  useLayoutEffect(() => {
    if (isEdit) return;

    return () => {
      setStep(1);
      setValues(valuesFromMission(null));
      setErrors({});
      setMessage(null);
      setSubmitting(false);
      setDeleting(false);
    };
  }, [isEdit]);

  const setField = (field: keyof MissionFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage(null);
  };

  const goNext = () => {
    const nextErrors = validateStepOne(values);
    setErrors(nextErrors);
    setMessage(null);

    if (Object.keys(nextErrors).length === 0) {
      setStep(2);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = { ...validateStepOne(values), ...validateStepTwo(values) };
    setErrors(nextErrors);
    setMessage(null);

    if (Object.keys(nextErrors).length > 0) {
      setStep(nextErrors.persyaratan ? 2 : 1);
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = isEdit && mission ? `/api/admin/misi/${encodeURIComponent(mission.id)}` : "/api/admin/misi";
      const response = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: unknown = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        setMessage(getApiError(data) ?? "Misi belum dapat disimpan.");
        return;
      }

      const savedMission = data && typeof data === "object" && "mission" in data
        ? (data as { mission?: { id?: unknown } }).mission
        : null;
      const id = typeof savedMission?.id === "string" ? savedMission.id : mission?.id;

      router.push(id ? `/admin/misi/${encodeURIComponent(id)}` : "/admin/misi");
      router.refresh();
    } catch {
      setMessage("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!mission) return;
    const warning = hasVolunteers
      ? `Misi ini memiliki ${mission.registration_count} relawan terdaftar. Hapus misi dan data pendaftarannya?`
      : "Hapus misi ini?";

    if (!window.confirm(warning)) return;

    setDeleting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/misi/${encodeURIComponent(mission.id)}`, {
        method: "DELETE",
      });
      const data: unknown = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        setMessage(getApiError(data) ?? "Misi belum dapat dihapus.");
        return;
      }

      router.push("/admin/misi");
      router.refresh();
    } catch {
      setMessage("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[8px] bg-white px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.18)] md:px-8">
      <StepIndicator step={step} />

      {step === 1 ? (
        <div className="space-y-4">
          <TextField
            label="Nama Misi"
            required
            value={values.judul}
            onChange={(value) => setField("judul", value)}
            placeholder="Contoh : Operasi Bandung"
            error={errors.judul}
          />
          <SelectField
            label="Jenis Misi"
            required
            value={values.jenis}
            onChange={(value) => setField("jenis", value)}
            error={errors.jenis}
          />
          <TextField
            label="Kuota Relawan"
            required
            type="number"
            min="1"
            value={values.kuota}
            onChange={(value) => setField("kuota", value)}
            placeholder="30"
            error={errors.kuota}
          />
          <TextField
            label="Lokasi"
            required
            value={values.lokasi}
            onChange={(value) => setField("lokasi", value)}
            placeholder={isEdit ? "Contoh : Operasi Bandung" : "Bandung"}
            error={errors.lokasi}
          />
          <TextField
            label="Tanggal Mulai"
            required
            type="date"
            value={values.tanggal_mulai}
            onChange={(value) => setField("tanggal_mulai", value)}
            error={errors.tanggal_mulai}
          />
          <TextField
            label="Tanggal Selesai"
            type="date"
            value={values.tanggal_selesai}
            onChange={(value) => setField("tanggal_selesai", value)}
            error={errors.tanggal_selesai}
          />
          <TextAreaField
            label="Deskripsi"
            value={values.deskripsi}
            onChange={(value) => setField("deskripsi", value)}
            placeholder="Jelaskan tugas relawan"
            minHeight="min-h-[86px]"
            error={errors.deskripsi}
          />
          <button
            type="button"
            onClick={goNext}
            className="h-11 w-full rounded-full bg-[#D3262E] px-5 text-[12px] font-extrabold text-white shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition hover:bg-[#B71C1C]"
          >
            Next
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <TextAreaField
            label="Persyaratan"
            required
            value={values.persyaratan}
            onChange={(value) => setField("persyaratan", value)}
            placeholder={requirementsPlaceholder}
            minHeight="min-h-[360px] md:min-h-[280px]"
            error={errors.persyaratan}
          />

          {isEdit ? (
            <div>
              <label className="mb-1 block text-[15px] font-bold leading-tight text-[#202124]">
                Ubah Status Misi
              </label>
              <p className="mb-2 text-[11px] font-semibold text-[#777777]">
                Status saat ini : <span className="text-[#2E7D32]">{statusOptionLabel(values.status)}</span>
              </p>
              <select
                value={values.status}
                onChange={(event) => setField("status", event.target.value)}
                className="h-[30px] w-full rounded-[4px] border border-[#B8B8B8] bg-white px-3 text-[12px] font-semibold text-[#202124] outline-none focus:border-[#D3262E] focus:ring-2 focus:ring-[#D3262E]/15 md:h-10"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {statusOptionLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || submitting}
              className="h-10 w-full rounded-full bg-[#D3262E] px-5 text-[12px] font-extrabold text-white shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition hover:bg-[#B71C1C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Menghapus..." : "Hapus Misi"}
            </button>
          ) : null}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={submitting || deleting}
              className="h-10 rounded-full bg-white px-5 text-[12px] font-extrabold text-[#777777] shadow-[0_4px_8px_rgba(0,0,0,0.16)] transition hover:text-[#D3262E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Previous
            </button>
            <button
              type="submit"
              disabled={submitting || deleting}
              className="h-10 rounded-full bg-[#D3262E] px-5 text-[12px] font-extrabold text-white shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition hover:bg-[#B71C1C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Menyimpan..." : actionLabel}
            </button>
          </div>
        </div>
      )}

      {message ? (
        <p className="mt-4 rounded-[8px] border border-[#FF5B62] bg-[#FFF4F4] px-4 py-3 text-[13px] font-semibold text-[#D3262E]">
          {message}
        </p>
      ) : null}
    </form>
  );
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-8 flex items-center justify-center">
      <StepCircle active={step === 1}>1</StepCircle>
      <span className="h-[2px] w-8 bg-[#202124]" />
      <StepCircle active={step === 2}>2</StepCircle>
    </div>
  );
}

function StepCircle({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-extrabold shadow-[0_3px_6px_rgba(0,0,0,0.22)] md:h-11 md:w-11 ${
        active ? "bg-[#D3262E] text-white" : "bg-[#E0E0E0] text-[#202124]"
      }`}
    >
      {children}
    </span>
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
  type = "text",
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  type?: "text" | "number" | "date";
  min?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[15px] font-bold leading-tight text-[#202124]">
        {label}
        <RequiredMark show={required} />
      </label>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-[30px] w-full rounded-[4px] border border-[#B8B8B8] bg-white px-3 text-[12px] font-semibold text-[#202124] outline-none placeholder:text-[#BBBBBB] focus:border-[#D3262E] focus:ring-2 focus:ring-[#D3262E]/15 md:h-10"
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
      <label className="mb-2 block text-[15px] font-bold leading-tight text-[#202124]">
        {label}
        <RequiredMark show={required} />
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[30px] w-full rounded-[4px] border border-[#B8B8B8] bg-white px-3 text-[12px] font-semibold text-[#202124] outline-none focus:border-[#D3262E] focus:ring-2 focus:ring-[#D3262E]/15 md:h-10"
      >
        <option value="">Pilih jenis misi</option>
        {MISSION_TYPE_OPTIONS.map((option) => (
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
      <label className="mb-2 block text-[15px] font-bold leading-tight text-[#202124]">
        {label}
        <RequiredMark show={required} />
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${minHeight} w-full resize-y rounded-[4px] border border-[#B8B8B8] bg-white px-3 py-3 text-[12px] font-semibold leading-relaxed text-[#202124] outline-none placeholder:text-[#BBBBBB] focus:border-[#D3262E] focus:ring-2 focus:ring-[#D3262E]/15`}
      />
      <FieldError value={error} />
    </div>
  );
}
