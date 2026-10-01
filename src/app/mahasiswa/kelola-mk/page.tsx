import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import KelolaMKList from "./KelolaMKList";

export default async function KelolaMKPage() {
  const session = await getSession();
  const supabase = createServerClient();

  const { data: semuaMK } = await supabase
    .from("mata_kuliah")
    .select("id, kode, nama, deskripsi")
    .order("kode");

  const { data: enrollments } = await supabase
    .from("enrollment")
    .select("mk_id")
    .eq("mahasiswa_id", session!.id);

  const diambilIds = (enrollments || []).map((e) => e.mk_id);

  return (
    <div>
      <Link href="/mahasiswa" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        &larr; Kembali
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Kelola Mata Kuliah</h1>
        <p className="text-sm text-gray-500 mt-1">
          Daftar atau keluar dari mata kuliah kapan saja.
        </p>
      </div>

      <KelolaMKList semua={semuaMK || []} diambilIds={diambilIds} />
    </div>
  );
}
