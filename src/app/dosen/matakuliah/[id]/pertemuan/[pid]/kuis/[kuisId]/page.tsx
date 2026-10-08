import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import KelolaSoal from "./KelolaSoal";

export default async function KelolaKuisPage({
  params,
}: {
  params: Promise<{ id: string; pid: string; kuisId: string }>;
}) {
  const { id, pid, kuisId } = await params;
  const supabase = createServerClient();

  const { data: kuis } = await supabase
    .from("kuis")
    .select("*")
    .eq("id", kuisId)
    .single();

  if (!kuis) redirect(`/dosen/matakuliah/${id}/pertemuan/${pid}`);

  const { data: soalList } = await supabase
    .from("kuis_soal")
    .select("*")
    .eq("kuis_id", kuisId)
    .order("urutan");

  return (
    <div className="max-w-2xl">
      <Link
        href={`/dosen/matakuliah/${id}/pertemuan/${pid}`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        &larr; Kembali ke pertemuan
      </Link>
      <KelolaSoal
        kuisId={kuisId}
        pertemuanId={pid}
        mkId={id}
        initialJudul={kuis.judul}
        initialDurasi={kuis.durasi_menit}
        soalList={soalList || []}
      />
    </div>
  );
}
