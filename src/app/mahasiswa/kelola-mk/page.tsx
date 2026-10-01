import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import KelolaMKList from "./KelolaMKList";

export default async function KelolaMKPage() {
  const session = await getSession();
  const supabase = createServerClient();

  const { data: semuaMKRaw } = await supabase
    .from("mata_kuliah")
    .select("id, kode, nama, deskripsi, dosen:dosen_id(nama)")
    .order("kode");

  const semuaMK = (semuaMKRaw || []).map((mk) => {
    const dosen = mk.dosen as unknown as { nama: string } | { nama: string }[] | null;
    const dosenNama = Array.isArray(dosen) ? dosen[0]?.nama : dosen?.nama;
    return {
      id: mk.id,
      kode: mk.kode,
      nama: mk.nama,
      deskripsi: mk.deskripsi,
      dosenNama: dosenNama ?? null,
    };
  });

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
