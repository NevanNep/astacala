import { AdminMissionTopBar } from "../../misi/_components/admin-mission-ui";
import { BeritaForm } from "../_components/berita-form";
import { requireAdminSupabase } from "../_components/server-data";

export const dynamic = "force-dynamic";

export default async function AdminBeritaNewPage() {
  await requireAdminSupabase();

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#202124]">
      <AdminMissionTopBar
        title="Tulis Berita Baru"
        backHref="/admin/berita"
      />

      <main className="mx-auto w-full max-w-[760px] px-4 pt-5 md:max-w-[860px] md:px-8 lg:max-w-[860px]">
        <BeritaForm mode="create" />
      </main>
    </div>
  );
}
