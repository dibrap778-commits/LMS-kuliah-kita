import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export default async function DosenDashboard() {
  const session = await getSession();
  const supabase = createServerClient();

  const { data: mataKuliah } = await supabase
    .from("mata_kuliah")
    .select("*, pertemuan(count), enrollment(count)")
    .eq("dosen_id", session!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Mata Kuliah</h1>
        <Link
          href="/dosen/matakuliah/buat"
          className="px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors"
        >
          + Tambah MK
        </Link>
      </div>

      {!mataKuliah || mataKuliah.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Belum ada mata kuliah.</p>
          <Link
            href="/dosen/matakuliah/buat"
            className="text-emerald-700 font-medium text-sm mt-2 inline-block hover:underline"
          >
            Buat mata kuliah pertama
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mataKuliah.map((mk) => (
            <Link
              key={mk.id}
              href={`/dosen/matakuliah/${mk.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <div className="text-xs font-mono text-emerald-700 mb-1">
                {mk.kode}
              </div>
              <h2 className="font-semibold text-gray-900 mb-2">{mk.nama}</h2>
              {mk.deskripsi && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {mk.deskripsi}
                </p>
              )}
              <div className="flex gap-4 text-xs text-gray-400">
                <span>{mk.pertemuan?.[0]?.count || 0} pertemuan</span>
                <span>{mk.enrollment?.[0]?.count || 0} mahasiswa</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
