import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default async function MahasiswaMKDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: mk } = await supabase
    .from("mata_kuliah")
    .select("*")
    .eq("id", id)
    .single();

  if (!mk) redirect("/mahasiswa");

  const { data: pertemuan } = await supabase
    .from("pertemuan")
    .select("*, materi(count), tugas(count)")
    .eq("mk_id", id)
    .order("tanggal", { ascending: false });

  return (
    <div>
      <Link href="/mahasiswa" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        &larr; Kembali
      </Link>

      <div className="mb-6">
        <div className="text-xs font-mono text-emerald-700 mb-1">{mk.kode}</div>
        <h1 className="text-xl font-bold text-gray-900">{mk.nama}</h1>
        {mk.deskripsi && <p className="text-sm text-gray-500 mt-1">{mk.deskripsi}</p>}
      </div>

      {!pertemuan || pertemuan.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Belum ada pertemuan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pertemuan.map((p) => (
            <Link
              key={p.id}
              href={`/mahasiswa/matakuliah/${id}/pertemuan/${p.id}`}
              className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-emerald-300 transition-colors"
            >
              <div>
                <div className="font-medium text-sm text-gray-900">{p.judul}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {new Date(p.tanggal).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {p.absensi_buka && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                    Absensi Dibuka
                  </span>
                )}
                <span>{p.materi?.[0]?.count || 0} materi</span>
                <span>{p.tugas?.[0]?.count || 0} tugas</span>
                <span className="text-gray-300">&rsaquo;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
