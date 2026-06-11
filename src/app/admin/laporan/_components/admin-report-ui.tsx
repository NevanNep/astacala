import Link from "next/link";
import type { AdminReportListItem } from "./types";
import { getReporterProfile, normalizeReportStatus } from "./types";
import { AdminHamburgerMenu } from "@/src/components/AdminHamburgerMenu";

export function formatAdminDateTime(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const dateText = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
  }).format(date);
  const timeText = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${dateText} - ${timeText}`;
}

export function formatCoordinate(latitude: number | null, longitude: number | null) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return "-";
  return `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}`;
}

export function displayValue(value: string | null | undefined) {
  const text = value?.trim();
  return text ? text : "-";
}

export function reportTitle(report: Pick<AdminReportListItem, "judul" | "jenis_bencana">) {
  return displayValue(report.judul || report.jenis_bencana || "Laporan");
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const normalized = normalizeReportStatus(status);
  const className =
    normalized === "Diterima"
      ? "bg-[#CFE8D2] text-[#2E7D32]"
      : normalized === "Ditolak"
        ? "bg-[#F8CFD2] text-[#D3262E]"
        : "bg-[#FFEBC7] text-[#F2A21A]";

  return (
    <span className={`inline-flex min-w-[72px] items-center justify-center rounded-full px-4 py-2 text-[12px] font-bold ${className}`}>
      {normalized}
    </span>
  );
}

export function AdminTopBar({
  title,
  subtitle,
  backHref = "/admin/dashboard",
  width = "detail",
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  width?: "detail" | "wide";
}) {
  const containerClass =
    width === "wide"
      ? "mx-auto w-full max-w-[1200px] px-4 md:px-8 lg:px-12"
      : "mx-auto w-full max-w-[760px] px-4 md:max-w-[860px] md:px-8";

  return (
    <header className="bg-[#FA777D] text-[#202124]">
      <div className="bg-white">
        <div className={`${containerClass} pb-10 pt-5 md:pb-12`}>
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
            <div className="shrink-0 pt-1">
              <AdminHamburgerMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function DetailCard({
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

export function DetailRow({
  label,
  value,
  danger,
}: {
  label: string;
  value: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="grid grid-cols-[118px_1fr] border-b border-[#BBBBBB] py-[5px] text-[11px] leading-tight last:border-b-0 md:grid-cols-[170px_1fr] md:text-[13px]">
      <div className="font-bold uppercase text-[#7A7A7A]">{label}</div>
      <div className={`min-w-0 font-bold text-[#111111] ${danger ? "text-[#D3262E]" : ""}`}>{value}</div>
    </div>
  );
}

export function ReportListCard({ report }: { report: AdminReportListItem }) {
  const reporter = getReporterProfile(report.profiles);

  return (
    <Link
      href={`/admin/laporan/${encodeURIComponent(report.id)}`}
      className="group block rounded-[8px] border border-[#747474] bg-white p-4 transition hover:border-[#D3262E] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-bold text-[#777777]">#{report.id}</p>
          <h2 className="mt-1 break-words text-[19px] font-extrabold leading-tight text-[#202124]">
            {reportTitle(report)}
          </h2>
        </div>
        <StatusBadge status={report.status} />
      </div>
      <div className="mt-4 space-y-2 text-[13px] font-semibold leading-snug text-[#202124]">
        <p>{displayValue(report.alamat)}</p>
        <p>{displayValue(reporter?.nama ?? null)}</p>
        <p className="text-[#777777]">{formatAdminDateTime(report.created_at)}</p>
      </div>
      <span className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[8px] bg-[#D3262E] text-[13px] font-bold text-white transition group-hover:bg-[#B71C1C]">
        Verifikasi
      </span>
    </Link>
  );
}
