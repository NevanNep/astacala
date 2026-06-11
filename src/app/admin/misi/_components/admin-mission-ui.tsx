import Link from "next/link";
import type { AdminMissionListItem, MissionStatus } from "./types";
import {
  displayMissionValue,
  missionStatusLabel,
  missionTitle,
  normalizeMissionStatus,
} from "./types";
import { AdminHamburgerMenu } from "@/src/components/AdminHamburgerMenu";

export function formatMissionDate(value: string | null | undefined) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  if (year && month && day) return `${day}/${month}/${year}`;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatMissionDateRange(
  start: string | null | undefined,
  end: string | null | undefined
) {
  if (!start && !end) return "-";
  if (!end || start === end) return formatMissionDate(start);
  return `${formatMissionDate(start)} - ${formatMissionDate(end)}`;
}

export function getMissionDuration(
  start: string | null | undefined,
  end: string | null | undefined
) {
  if (!start || !end) return "-";

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return "-";

  const days = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1
  );
  return `${days} Hari`;
}

export function getInitials(value: string | null | undefined) {
  const words = value?.trim().split(/\s+/).filter(Boolean) ?? [];
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "RV";
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const normalized = normalizeMissionStatus(status);
  const className =
    normalized === "Penuh"
      ? "bg-[#FFEBC7] text-[#F2A21A]"
      : normalized === "Selesai"
        ? "bg-[#E7E7E7] text-[#9A9A9A]"
        : "bg-[#CFE8D2] text-[#2E7D32]";

  return (
    <span className={`inline-flex min-w-[68px] items-center justify-center rounded-full px-4 py-2 text-[12px] font-bold ${className}`}>
      {missionStatusLabel(normalized)}
    </span>
  );
}

export function AdminMissionTopBar({
  title,
  subtitle,
  backHref = "/admin/dashboard",
  action,
  width = "detail",
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
  width?: "detail" | "wide";
}) {
  const containerClass =
    width === "wide"
      ? "mx-auto w-full max-w-[1200px] px-4 md:px-8 lg:px-12"
      : "mx-auto w-full max-w-[760px] px-4 md:max-w-[860px] md:px-8";

  return (
    <header className="bg-[#FA777D] text-[#202124]">
      <div className="bg-white">
        <div className={`${containerClass} pb-8 pt-5 md:pb-10`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-1">
              <Link
                href={backHref}
                className="mt-1 inline-flex h-7 w-5 shrink-0 items-center justify-center text-[30px] leading-none text-[#202124]"
                aria-label="Kembali"
              >
                &lsaquo;
              </Link>
              <div className="min-w-0">
                <h1 className="break-words text-[25px] font-extrabold leading-[1.05] tracking-[0] text-[#202124] md:text-[34px]">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-1 break-words text-[14px] font-extrabold leading-none text-[#202124] md:text-[16px]">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-1">
              {action}
              <AdminHamburgerMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function MissionSectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-[#7A7A7A] bg-white px-4 py-3">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold leading-none text-[#202124] md:text-[17px]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MissionDetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[128px_1fr] border-b border-[#BBBBBB] py-[5px] text-[11px] leading-tight last:border-b-0 md:grid-cols-[190px_1fr] md:text-[13px]">
      <div className="font-bold uppercase text-[#7A7A7A]">{label}</div>
      <div className="min-w-0 whitespace-pre-line font-bold text-[#111111]">{value}</div>
    </div>
  );
}

export function MissionListCard({ mission }: { mission: AdminMissionListItem }) {
  const normalizedStatus = normalizeMissionStatus(mission.status);
  const isCompleted = normalizedStatus === "Selesai";
  const quota = mission.kuota ?? 0;

  return (
    <article
      className={`rounded-[8px] border border-[#747474] bg-white p-4 transition ${
        isCompleted ? "opacity-45" : "hover:border-[#D3262E] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
      }`}
    >
      <div className="flex min-h-[58px] items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="break-words text-[16px] font-extrabold leading-tight text-[#202124] md:text-[20px]">
            {missionTitle(mission)}
          </h3>
          <p className="mt-1 break-words text-[11px] font-semibold leading-tight text-[#777777] md:text-[13px]">
            {displayMissionValue(mission.lokasi)}
          </p>
        </div>
        <StatusBadge status={mission.status} />
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3 text-[10px] leading-tight md:text-[12px]">
        <MissionCardMetric label="Mulai" value={formatMissionDate(mission.tanggal_mulai)} />
        <MissionCardMetric label="Relawan" value={`${mission.registration_count}/${quota}`} />
        <MissionCardMetric
          label="Durasi"
          value={getMissionDuration(mission.tanggal_mulai, mission.tanggal_selesai)}
        />
        <MissionCardMetric label="Jenis" value={displayMissionValue(mission.jenis)} />
      </div>

      <Link
        href={`/admin/misi/${encodeURIComponent(mission.id)}`}
        className={`mt-3 flex h-[30px] w-full items-center justify-center rounded-full border border-[#7A7A7A] text-[11px] font-bold transition md:h-10 md:text-[13px] ${
          isCompleted
            ? "text-[#777777] hover:border-[#D3262E] hover:text-[#D3262E]"
            : "text-[#202124] hover:border-[#D3262E] hover:bg-[#D3262E] hover:text-white"
        }`}
      >
        {isCompleted ? "Lihat Detail" : "Kelola Misi"}
      </Link>
    </article>
  );
}

function MissionCardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="font-semibold text-[#777777]">{label}</p>
      <p className="mt-1 break-words font-extrabold text-[#111111]">{value}</p>
    </div>
  );
}

export function statusOptionLabel(status: MissionStatus) {
  return status === "Terbuka" ? "Aktif" : status;
}
