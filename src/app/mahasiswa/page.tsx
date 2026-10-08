import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export default async function MahasiswaDashboard() {
  const session = await getSession();
  const supabase = createServerClient();

  const { data: enrollments } = await supabase
    .from("enrollment")
    .select("mata_kuliah:mk_id(id, kode, nama, deskripsi, dosen:dosen_id(nama))")
    .eq("mahasiswa_id", session!.id);

  const mataKuliah = (enrollments || []).map((e: Record<string, unknown>) => {
    const mk = e.mata_kuliah as unknown as {
      id: string; kode: string; nama: string; deskripsi: string;
      dosen: { nama: string } | { nama: string }[] | null;
    };
    const dosenNama = Array.isArray(mk.dosen) ? mk.dosen[0]?.nama : mk.dosen?.nama;
    return { id: mk.id, kode: mk.kode, nama: mk.nama, deskripsi: mk.deskripsi, dosenNama: dosenNama ?? null };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Mata Kuliah Saya</h1>
        <Link
          href="/mahasiswa/kelola-mk"
          className="px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors"
        >
          Kelola Mata Kuliah
        </Link>
      </div>

      {mataKuliah.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Belum terdaftar di mata kuliah manapun.</p>
          <Link
            href="/mahasiswa/kelola-mk"
            className="text-sm text-emerald-700 hover:underline mt-1 inline-block"
          >
            Daftar mata kuliah sekarang
          </Link>
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
              {mk.dosenNama && (
                <p className="text-xs text-gray-500 mb-2">👤 {mk.dosenNama}</p>
              )}
              {mk.deskripsi && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{mk.deskripsi}</p>
              )}
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 8,
                  background: "#185B37", color: "#fff",
                  fontSize: 13, fontWeight: 700,
                }}
              >
                Masuk Kelas <span aria-hidden="true">&rarr;</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
