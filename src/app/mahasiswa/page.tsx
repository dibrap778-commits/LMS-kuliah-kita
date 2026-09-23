import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export default async function MahasiswaDashboard() {
  const session = await getSession();
  const supabase = createServerClient();

  const { data: enrollments } = await supabase
    .from("enrollment")
    .select("mata_kuliah:mk_id(id, kode, nama, deskripsi)")
    .eq("mahasiswa_id", session!.id);

  const mataKuliah = (enrollments || []).map(
    (e: Record<string, unknown>) => e.mata_kuliah as { id: string; kode: string; nama: string; deskripsi: string }
  );

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Mata Kuliah Saya</h1>

      {mataKuliah.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Belum terdaftar di mata kuliah manapun.</p>
          <p className="text-sm text-gray-400 mt-1">
            Hubungi dosen untuk informasi pendaftaran.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mataKuliah.map((mk) => (
            <Link
              key={mk.id}
              href={`/mahasiswa/matakuliah/${mk.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <div className="text-xs font-mono text-emerald-700 mb-1">{mk.kode}</div>
              <h2 className="font-semibold text-gray-900 mb-1">{mk.nama}</h2>
              {mk.deskripsi && (
                <p className="text-sm text-gray-500 line-clamp-2">{mk.deskripsi}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
