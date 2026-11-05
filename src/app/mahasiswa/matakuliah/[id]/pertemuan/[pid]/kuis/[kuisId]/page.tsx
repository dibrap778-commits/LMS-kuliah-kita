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

  const { data: attempt } = await supabase
    .from("kuis_attempt")
    .select("*")
    .eq("kuis_id", kuisId)
    .eq("mahasiswa_id", session!.id)
    .single();

  let state: "not_started" | "in_progress" | "finished" = "not_started";
  let skor: number | null = null;
  let sudahSelesai = false;
  let pelanggaran = 0;
  let deadlineIso: string | null = null;
  let soalList: {
    id: string; urutan: number; tipe: "pilihan_ganda" | "esai"; pertanyaan: string;
    pilihan_a: string | null; pilihan_b: string | null; pilihan_c: string | null; pilihan_d: string | null;
  }[] = [];

  if (attempt) {
    if (attempt.waktu_selesai) {
      state = "finished";
      skor = attempt.skor;
      sudahSelesai = true;
      pelanggaran = attempt.pelanggaran ?? 0;
    } else {
      const deadline = new Date(attempt.waktu_mulai).getTime() + kuis.durasi_menit * 60000;
      if (Date.now() >= deadline) {
        // Waktu habis tanpa interaksi klien (mis. tab ditutup) — finalisasi lewat
        // jalur yang sama dengan submit manual, supaya soal esai tetap menunggu
        // penilaian dosen alih-alih dipaksa skor 0.
        const res = await submitAttempt(attempt.id, [], attempt.pelanggaran ?? 0);
        state = "finished";
        sudahSelesai = true;
        skor = res?.skor ?? null;
        pelanggaran = attempt.pelanggaran ?? 0;
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
  }

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
      </p>

      {state === "not_started" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Kuis ini punya batas waktu {kuis.durasi_menit} menit sejak Anda menekan mulai, dan hanya
            bisa dikerjakan satu kali. Pastikan Anda siap sebelum memulai.
          </p>
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 mb-4">
            Jangan berpindah tab atau aplikasi lain selama mengerjakan — sistem akan mendeteksi dan
            mencatatnya sebagai pelanggaran. Terlalu sering keluar tab, kuis akan otomatis dikirim.
          </p>
          <MulaiKuis kuisId={kuisId} />
        </div>
      )}

      {state === "in_progress" && (
        <KuisAttempt attemptId={attempt!.id} deadlineIso={deadlineIso!} soalList={soalList} />
      )}

      {state === "finished" && sudahSelesai && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Anda sudah menyelesaikan kuis ini.</p>
          {skor !== null ? (
            <div
              className="text-4xl font-bold"
              style={{ color: skor >= 60 ? "#1e40af" : "#c23b3b" }}
            >
              {skor}
            </div>
          ) : (
            <div className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
              Menunggu penilaian dosen untuk soal esai. Nilai akhir akan muncul di sini setelah dosen selesai menilai.
            </div>
          )}
          {pelanggaran > 0 && (
            <p className="text-xs text-red-600 mt-3">
              Terdeteksi {pelanggaran}x keluar dari tab kuis selama pengerjaan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
