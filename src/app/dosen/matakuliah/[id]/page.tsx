import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import TambahPertemuan from "./TambahPertemuan";
import RekapNilai from "./RekapNilai";

export default async function MataKuliahDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const supabase = createServerClient();

  const { data: mk } = await supabase
    .from("mata_kuliah")
    .select("*")
    .eq("id", id)
    .eq("dosen_id", session!.id)
    .single();

  if (!mk) redirect("/dosen");

  const { data: pertemuan } = await supabase
    .from("pertemuan")
    .select("*, absensi(count), tugas(count)")
    .eq("mk_id", id)
    .order("tanggal", { ascending: false });

  const { data: mahasiswa } = await supabase
    .from("enrollment")
    .select("mahasiswa:mahasiswa_id(id, nim, nama)")
    .eq("mk_id", id);

  // Data for rekap nilai
  const pertemuanIds = (pertemuan || []).map((p) => p.id);
  const totalPertemuan = pertemuanIds.length;

  const { data: absensiAll } = pertemuanIds.length > 0
    ? await supabase.from("absensi").select("mahasiswa_id").in("pertemuan_id", pertemuanIds)
    : { data: [] };

  const { data: nilaiAll } = await supabase
    .from("nilai")
    .select("*")
    .eq("mk_id", id);

  const absensiCount: Record<string, number> = {};
  for (const a of absensiAll || []) {
    absensiCount[a.mahasiswa_id] = (absensiCount[a.mahasiswa_id] || 0) + 1;
  }

  const nilaiMap: Record<string, { tugas: number | null; uts: number | null; uas: number | null }> = {};
  for (const n of nilaiAll || []) {
    nilaiMap[n.mahasiswa_id] = { tugas: n.tugas, uts: n.uts, uas: n.uas };
  }

  const students = (mahasiswa || []).map((e: Record<string, unknown>) => {
    const mhs = e.mahasiswa as { id: string; nim: string; nama: string };
    const hadir = absensiCount[mhs.id] || 0;
    const presensiPct = totalPertemuan > 0 ? (hadir / totalPertemuan) * 100 : 0;
    const n = nilaiMap[mhs.id] || { tugas: null, uts: null, uas: null };
    return { id: mhs.id, nim: mhs.nim, nama: mhs.nama, presensiPct, ...n };
  });

  return (
    <div>
      <Link href="/dosen" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        &larr; Kembali
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-xs font-mono text-emerald-700 mb-1">{mk.kode}</div>
          <h1 className="text-xl font-bold text-gray-900">{mk.nama}</h1>
          {mk.deskripsi && <p className="text-sm text-gray-500 mt-1">{mk.deskripsi}</p>}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pertemuan</h2>
          </div>

          <TambahPertemuan mkId={id} />

          {!pertemuan || pertemuan.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 text-sm">Belum ada pertemuan.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pertemuan.map((p) => (
                <Link
                  key={p.id}
                  href={`/dosen/matakuliah/${id}/pertemuan/${p.id}`}
                  className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-emerald-300 transition-colors"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">{p.judul}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(p.tanggal).toLocaleDateString("id-ID", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {p.absensi_buka && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                        Absensi Dibuka
                      </span>
                    )}
                    <span>{p.absensi?.[0]?.count || 0} hadir</span>
                    <span>{p.tugas?.[0]?.count || 0} tugas</span>
                    <span className="text-gray-300">&rsaquo;</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 mb-3">
            Mahasiswa ({mahasiswa?.length || 0})
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {!mahasiswa || mahasiswa.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                Belum ada mahasiswa terdaftar.
              </div>
            ) : (
              mahasiswa.map((e: Record<string, unknown>) => {
                const mhs = e.mahasiswa as { id: string; nim: string; nama: string };
                return (
                  <div key={mhs.id} className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{mhs.nama}</span>
                    <span className="text-xs text-gray-400 font-mono">{mhs.nim}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <RekapNilai mkId={id} initialStudents={students} />
    </div>
  );
}
