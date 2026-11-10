import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import KelolaSoal from "./KelolaSoal";
import NilaiEsai from "./NilaiEsai";
import KuisToggle from "../../KuisToggle";

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

  const esaiSoalIds = (soalList || []).filter((s) => s.tipe === "esai").map((s) => s.id);
  const pertanyaanEsaiMap: Record<string, string> = {};
  for (const s of soalList || []) if (s.tipe === "esai") pertanyaanEsaiMap[s.id] = s.pertanyaan;

  const { data: mahasiswa } = await supabase
    .from("enrollment")
    .select("mahasiswa:mahasiswa_id(id, nim, nama)")
    .eq("mk_id", id);

  const { data: attempts } = await supabase
    .from("kuis_attempt")
    .select("id, mahasiswa_id, waktu_mulai, waktu_selesai, skor, pelanggaran")
    .eq("kuis_id", kuisId)
    .order("waktu_mulai", { ascending: true });

  const attemptIds = (attempts || []).map((a) => a.id);
  const { data: esaiJawabanAll } = attemptIds.length > 0 && esaiSoalIds.length > 0
    ? await supabase
        .from("kuis_jawaban")
        .select("id, attempt_id, soal_id, jawaban_esai, nilai")
        .in("attempt_id", attemptIds)
        .in("soal_id", esaiSoalIds)
    : { data: [] };

  const esaiJawabanByAttempt: Record<string, { jawabanId: string; pertanyaan: string; jawabanEsai: string | null; nilai: number | null }[]> = {};
  for (const j of esaiJawabanAll || []) {
    if (!esaiJawabanByAttempt[j.attempt_id]) esaiJawabanByAttempt[j.attempt_id] = [];
    esaiJawabanByAttempt[j.attempt_id].push({
      jawabanId: j.id,
      pertanyaan: pertanyaanEsaiMap[j.soal_id] || "",
      jawabanEsai: j.jawaban_esai,
      nilai: j.nilai,
    });
  }

  const maksAttempt = kuis.maks_attempt ?? 1;

  type AttemptRow = {
    id: string; mahasiswa_id: string; waktu_mulai: string;
    waktu_selesai: string | null; skor: number | null; pelanggaran: number | null;
  };
  const attemptsByMahasiswa: Record<string, AttemptRow[]> = {};
  for (const a of (attempts as AttemptRow[]) || []) {
    if (!attemptsByMahasiswa[a.mahasiswa_id]) attemptsByMahasiswa[a.mahasiswa_id] = [];
    attemptsByMahasiswa[a.mahasiswa_id]!.push(a);
  }

  const hasilKuis = (mahasiswa || []).map((e: Record<string, unknown>) => {
    const mhs = e.mahasiswa as { id: string; nim: string; nama: string };
    const attemptList = attemptsByMahasiswa[mhs.id] || [];
    const sedang = attemptList.find((a) => !a.waktu_selesai);
    const selesaiList = attemptList.filter((a) => a.waktu_selesai);
    const status: "belum" | "sedang" | "selesai" =
      attemptList.length === 0 ? "belum" : sedang ? "sedang" : "selesai";
    const skorTerbaik = selesaiList.reduce<number | null>(
      (best, a) => (a.skor !== null && (best === null || a.skor > best) ? a.skor : best),
      null
    );
    const pelanggaranTotal = attemptList.reduce((sum, a) => sum + (a.pelanggaran ?? 0), 0);
    const attemptsDetail = attemptList.map((a, i) => ({
      attemptId: a.id,
      ke: i + 1,
      selesai: !!a.waktu_selesai,
      skor: a.skor,
      menungguEsai: !!a.waktu_selesai && a.skor === null,
      pelanggaran: a.pelanggaran ?? 0,
      esaiItems: esaiJawabanByAttempt[a.id] || [],
    }));
    return {
      id: mhs.id, nim: mhs.nim, nama: mhs.nama, status,
      skorTerbaik, pelanggaranTotal,
      jumlahPercobaan: attemptList.length,
      attemptsDetail,
    };
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

      <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-gray-200 px-4 py-3">
        <div className="text-sm text-gray-600">
          Status untuk mahasiswa: <span className="font-medium text-gray-900">{kuis.buka ? "Terbuka" : "Terkunci"}</span>
        </div>
        <KuisToggle kuisId={kuisId} pertemuanId={pid} mkId={id} initialBuka={kuis.buka} />
      </div>

      <KelolaSoal
        kuisId={kuisId}
        pertemuanId={pid}
        mkId={id}
        initialJudul={kuis.judul}
        initialDurasi={kuis.durasi_menit}
        initialMaksAttempt={kuis.maks_attempt ?? 1}
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
              <div key={h.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-gray-900">{h.nama}</div>
                    <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                      {h.nim}
                      {maksAttempt > 1 && (
                        <span className="text-gray-400">· {h.jumlahPercobaan}/{maksAttempt} percobaan</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {h.pelanggaranTotal > 0 && (
                      <span className="text-xs text-red-600" title="Total kali keluar dari tab kuis (semua percobaan)">
                        ⚠ {h.pelanggaranTotal}x
                      </span>
                    )}
                    {h.status === "selesai" ? (
                      h.skorTerbaik !== null ? (
                        <span
                          className="text-sm font-bold"
                          style={{ color: h.skorTerbaik >= 60 ? "#1e40af" : "#c23b3b" }}
                          title="Nilai terbaik dari seluruh percobaan"
                        >
                          {h.skorTerbaik}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                          Menunggu dinilai
                        </span>
                      )
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

                {maksAttempt > 1 && h.attemptsDetail.length > 0 && (
                  <div className="mt-2 pl-1 space-y-1">
                    {h.attemptsDetail.map((ad) => (
                      <div key={ad.attemptId} className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="text-gray-400">Percobaan {ad.ke}:</span>
                        {!ad.selesai ? (
                          <span className="text-yellow-700">sedang berlangsung</span>
                        ) : ad.menungguEsai ? (
                          <span className="text-amber-700">menunggu dinilai</span>
                        ) : (
                          <span className={(ad.skor ?? 0) >= 60 ? "text-blue-700" : "text-red-700"}>
                            nilai {ad.skor}
                          </span>
                        )}
                        {ad.pelanggaran > 0 && <span className="text-red-500">· ⚠ {ad.pelanggaran}x</span>}
                      </div>
                    ))}
                  </div>
                )}

                {h.attemptsDetail
                  .filter((ad) => ad.menungguEsai && ad.esaiItems.length > 0)
                  .map((ad) => (
                    <NilaiEsai
                      key={ad.attemptId}
                      attemptId={ad.attemptId}
                      kuisId={kuisId}
                      pertemuanId={pid}
                      mkId={id}
                      items={ad.esaiItems}
                    />
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
