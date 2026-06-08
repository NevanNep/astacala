import { notFound } from "next/navigation";
import { AdminMissionTopBar } from "../../../misi/_components/admin-mission-ui";
import { BeritaForm } from "../../_components/berita-form";
import { loadAdminNewsDetail, requireAdminSupabase } from "../../_components/server-data";

export const dynamic = "force-dynamic";

export default async function AdminBeritaEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await requireAdminSupabase();
  const id = (await params).id;
  
  const { news, error } = await loadAdminNewsDetail(supabase, id);

  if (error || !news) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#202124]">
      <AdminMissionTopBar
        title="Edit Berita"
        backHref="/admin/berita"
      />

      <main className="mx-auto w-full max-w-[760px] px-4 pt-5 md:max-w-[860px] md:px-8 lg:max-w-[860px]">
        <BeritaForm mode="edit" news={news} />
      </main>
    </div>
  );
}
