import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import MulaiKuis from "./MulaiKuis";
import KuisAttempt from "./KuisAttempt";
import { submitAttempt } from "@/lib/actions/kuis";

export default async function KuisPage({
  params,
}: {
  params: Promise<{ id: string; pid: string; kuisId: string }>;
}) {
  const { id, pid, kuisId } = await params;
  const session = await getSession();
  const supabase = createServerClient();

  const { data: kuis } = await supabase
    .from("kuis")
    .select("*")
    .eq("id", kuisId)
    .single();

  if (!kuis) redirect(`/mahasiswa/matakuliah/${id}/pertemuan/${pid}`);

  const { count: jumlahSoal } = await supabase
    .from("kuis_soal")
    .select("id", { count: "exact", head: true })
    .eq("kuis_id", kuisId);

  const { data: attempts } = await supabase
    .from("kuis_attempt")
    .select("*")
    .eq("kuis_id", kuisId)
    .eq("mahasiswa_id", session!.id)
    .order("waktu_mulai", { ascending: true });

  const maksAttempt = kuis.maks_attempt ?? 1;
  let inProgress = (attempts || []).find((a) => !a.waktu_selesai) ?? null;
  const finishedBefore = (attempts || []).filter((a) => a.waktu_selesai);

  let state: "not_started" | "in_progress" | "can_retry" | "finished" = "not_started";
  let deadlineIso: string | null = null;
  let soalList: {
    id: string; urutan: number; tipe: "pilihan_ganda" | "esai"; pertanyaan: string;
    pilihan_a: string | null; pilihan_b: string | null; pilihan_c: string | null; pilihan_d: string | null;
  }[] = [];

  if (inProgress) {
    const deadline = new Date(inProgress.waktu_mulai).getTime() + kuis.durasi_menit * 60000;
    if (Date.now() >= deadline) {
      // Waktu habis tanpa interaksi klien (mis. tab ditutup) — finalisasi lewat
      // jalur yang sama dengan submit manual, supaya soal esai tetap menunggu
      // penilaian dosen alih-alih dipaksa skor 0.
      await submitAttempt(inProgress.id, [], inProgress.pelanggaran ?? 0);
      finishedBefore.push({ ...inProgress, waktu_selesai: new Date().toISOString() });
      inProgress = null;
    } else {
      state = "in_progress";
      deadlineIso = new Date(deadline).toISOString();
      const { data: soal } = await supabase
        .from("kuis_soal")
        .select("id, urutan, tipe, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d")
        .eq("kuis_id", kuisId)
        .order("urutan");
      soalList = soal || [];
    }
  }

  if (!inProgress) {
    if (finishedBefore.length === 0) {
      state = "not_started";
    } else if (finishedBefore.length < maksAttempt) {
      state = "can_retry";
    } else {
      state = "finished";
    }
  }

  const bestSkor = finishedBefore.reduce<number | null>(
    (best, a) => (a.skor !== null && (best === null || a.skor > best) ? a.skor : best),
    null
  );
  const adaMenungguEsai = finishedBefore.some((a) => a.skor === null);
  const totalPelanggaran = finishedBefore.reduce((sum, a) => sum + (a.pelanggaran ?? 0), 0);

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/mahasiswa/matakuliah/${id}/pertemuan/${pid}`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        &larr; Kembali ke pertemuan
      </Link>

      <h1 className="text-xl font-bold text-gray-900 mb-1">{kuis.judul}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {jumlahSoal || 0} soal · {kuis.durasi_menit} menit
        {maksAttempt > 1 && ` · maks ${maksAttempt}x percobaan`}
      </p>

      {finishedBefore.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <p className="text-sm text-gray-500 mb-3">Riwayat percobaan Anda:</p>
          <div className="space-y-1.5">
            {finishedBefore.map((a, i) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Percobaan {i + 1}</span>
                {a.skor !== null ? (
                  <span className="font-semibold" style={{ color: a.skor >= 60 ? "#1e40af" : "#c23b3b" }}>
                    {a.skor}
                  </span>
                ) : (
                  <span className="text-xs text-amber-700">Menunggu dinilai</span>
                )}
              </div>
            ))}
          </div>
          {bestSkor !== null && finishedBefore.length > 1 && (
            <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-100">
              <span className="text-gray-700 font-medium">Nilai terbaik</span>
              <span className="font-bold" style={{ color: bestSkor >= 60 ? "#1e40af" : "#c23b3b" }}>
                {bestSkor}
              </span>
            </div>
          )}
          {totalPelanggaran > 0 && (
            <p className="text-xs text-red-600 mt-3">
              Total {totalPelanggaran}x keluar dari tab kuis selama seluruh percobaan.
            </p>
          )}
        </div>
      )}

      {state === "not_started" && !kuis.buka && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500">
            🔒 Kuis ini belum dibuka oleh dosen. Coba cek lagi nanti.
          </p>
        </div>
      )}

      {state === "not_started" && kuis.buka && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Kuis ini punya batas waktu {kuis.durasi_menit} menit sejak Anda menekan mulai
            {maksAttempt > 1 ? `, dan bisa dikerjakan maksimal ${maksAttempt}x.` : ", dan hanya bisa dikerjakan satu kali."}{" "}
            Pastikan Anda siap sebelum memulai.
          </p>
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 mb-4">
            Jangan berpindah tab atau aplikasi lain selama mengerjakan — sistem akan mendeteksi dan
            mencatatnya sebagai pelanggaran. Terlalu sering keluar tab, kuis akan otomatis dikirim.
          </p>
          <MulaiKuis kuisId={kuisId} label="Mulai Kuis" />
        </div>
      )}

      {state === "in_progress" && (
        <KuisAttempt attemptId={inProgress!.id} deadlineIso={deadlineIso!} soalList={soalList} />
      )}

      {state === "can_retry" && !kuis.buka && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500">
            🔒 Kuis ini sedang dikunci oleh dosen. Percobaan berikutnya belum bisa dimulai.
          </p>
        </div>
      )}

      {state === "can_retry" && kuis.buka && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Anda masih punya kesempatan mencoba lagi (percobaan {finishedBefore.length + 1} dari {maksAttempt}).
          </p>
          <MulaiKuis kuisId={kuisId} label="Coba Lagi" />
        </div>
      )}

      {state === "finished" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Anda sudah menghabiskan seluruh kesempatan mengerjakan kuis ini.
          </p>
          {!adaMenungguEsai ? (
            <div
              className="text-4xl font-bold"
              style={{ color: (bestSkor ?? 0) >= 60 ? "#1e40af" : "#c23b3b" }}
            >
              {bestSkor}
            </div>
          ) : (
            <div className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
              Menunggu penilaian dosen untuk soal esai. Nilai akhir akan muncul di sini setelah dosen selesai menilai.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
