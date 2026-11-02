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

  const { data: mahasiswa } = await supabase
    .from("enrollment")
    .select("mahasiswa:mahasiswa_id(id, nim, nama)")
    .eq("mk_id", id);

  const { data: attempts } = await supabase
    .from("kuis_attempt")
    .select("mahasiswa_id, waktu_selesai, skor, pelanggaran")
    .eq("kuis_id", kuisId);

  const attemptMap: Record<string, { waktu_selesai: string | null; skor: number | null; pelanggaran: number | null }> = {};
  for (const a of attempts || []) attemptMap[a.mahasiswa_id] = a;

  const hasilKuis = (mahasiswa || []).map((e: Record<string, unknown>) => {
    const mhs = e.mahasiswa as { id: string; nim: string; nama: string };
    const a = attemptMap[mhs.id];
    const status: "belum" | "sedang" | "selesai" = !a ? "belum" : a.waktu_selesai ? "selesai" : "sedang";
    return { id: mhs.id, nim: mhs.nim, nama: mhs.nama, status, skor: a?.skor ?? null, pelanggaran: a?.pelanggaran ?? 0 };
  });

  const sudahSelesai = hasilKuis.filter((h) => h.status === "selesai").length;

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

      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 2 }}>
          Hasil Kuis
        </div>
        <div style={{ fontSize: 13, color: "rgba(0,0,0,.45)", marginBottom: 14 }}>
          {sudahSelesai} dari {hasilKuis.length} mahasiswa sudah mengerjakan
        </div>

        {hasilKuis.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
            Belum ada mahasiswa terdaftar di mata kuliah ini.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {hasilKuis.map((h) => (
              <div key={h.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-gray-900">{h.nama}</div>
                  <div className="text-xs text-gray-400 font-mono">{h.nim}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {h.pelanggaran > 0 && (
                    <span className="text-xs text-red-600" title="Jumlah kali keluar dari tab kuis">
                      ⚠ {h.pelanggaran}x
                    </span>
                  )}
                  {h.status === "selesai" ? (
                    <span
                      className="text-sm font-bold"
                      style={{ color: (h.skor ?? 0) >= 60 ? "#1e40af" : "#c23b3b" }}
                    >
                      {h.skor}
                    </span>
                  ) : h.status === "sedang" ? (
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                      Sedang mengerjakan
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                      Belum mengerjakan
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
