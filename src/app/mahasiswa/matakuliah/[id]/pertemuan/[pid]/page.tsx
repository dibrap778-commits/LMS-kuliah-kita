import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AbsenButton from "./AbsenButton";
import SubmitTugas from "./SubmitTugas";

export default async function MahasiswaPertemuanDetail({
  params,
}: {
  params: Promise<{ id: string; pid: string }>;
}) {
  const { id, pid } = await params;
  const session = await getSession();
  const supabase = createServerClient();

  const { data: pertemuan } = await supabase
    .from("pertemuan")
    .select("*, mata_kuliah!inner(kode, nama)")
    .eq("id", pid)
    .single();

  if (!pertemuan) redirect(`/mahasiswa/matakuliah/${id}`);

  const { data: materiList } = await supabase
    .from("materi")
    .select("*")
    .eq("pertemuan_id", pid)
    .order("created_at");

  const { data: sudahAbsen } = await supabase
    .from("absensi")
    .select("id")
    .eq("pertemuan_id", pid)
    .eq("mahasiswa_id", session!.id)
    .single();

  const { data: tugasList } = await supabase
    .from("tugas")
    .select("*")
    .eq("pertemuan_id", pid)
    .order("created_at");

  const tugasIds = (tugasList || []).map((t) => t.id);
  const { data: mySubmissions } = tugasIds.length > 0
    ? await supabase
        .from("submission")
        .select("id, tugas_id, file_url, nama_file, waktu_submit, nilai, feedback")
        .eq("mahasiswa_id", session!.id)
        .in("tugas_id", tugasIds)
    : { data: [] };

  const { data: kuisList } = await supabase
    .from("kuis")
    .select("*, kuis_soal(count)")
    .eq("pertemuan_id", pid)
    .order("created_at");

  const kuisIds = (kuisList || []).map((k) => k.id);
  const { data: myAttempts } = kuisIds.length > 0
    ? await supabase
        .from("kuis_attempt")
        .select("kuis_id, waktu_mulai, waktu_selesai, skor")
        .eq("mahasiswa_id", session!.id)
        .in("kuis_id", kuisIds)
    : { data: [] };

  function getYoutubeEmbedUrl(url: string) {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) {
        const v = u.searchParams.get("v");
        return v ? `https://www.youtube.com/embed/${v}` : null;
      }
      if (u.hostname.includes("youtu.be")) {
        return `https://www.youtube.com/embed${u.pathname}`;
      }
    } catch {
      //
    }
    return null;
  }

  return (
    <div>
      <Link
        href={`/mahasiswa/matakuliah/${id}`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        &larr; Kembali ke {pertemuan.mata_kuliah.nama}
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{pertemuan.judul}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(pertemuan.tanggal).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        {pertemuan.deskripsi && (
          <p className="text-sm text-gray-600 mt-2">{pertemuan.deskripsi}</p>
        )}
        {pertemuan.link_meeting && (
          <a
            href={pertemuan.link_meeting}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              marginTop: 12, padding: "8px 16px", borderRadius: 8,
              background: "#185B37", color: "#fff",
              fontSize: 13, fontWeight: 600, textDecoration: "none"
            }}
          >
            🎥 Gabung Meeting
          </a>
        )}
      </div>

      {/* Absensi */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Absensi</h2>
        {sudahAbsen ? (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Anda sudah mengisi absensi untuk pertemuan ini.
          </div>
        ) : pertemuan.absensi_buka ? (
          <AbsenButton pertemuanId={pid} />
        ) : (
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
            Absensi belum dibuka oleh dosen.
          </div>
        )}
      </div>

      {/* Materi */}
      {materiList && materiList.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Materi</h2>
          <div className="space-y-3">
            {materiList.map((m) => (
              <div key={m.id}>
                {m.tipe === "video" ? (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {getYoutubeEmbedUrl(m.url) ? (
                      <iframe
                        src={getYoutubeEmbedUrl(m.url)!}
                        className="w-full aspect-video"
                        allowFullScreen
                      />
                    ) : (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-3 text-sm text-emerald-700 hover:underline"
                      >
                        Buka Video
                      </a>
                    )}
                  </div>
                ) : (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-emerald-300 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-700">{m.nama_file || "Dokumen"}</span>
                    <span className="ml-auto text-xs text-emerald-700">Unduh</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kuis */}
      {kuisList && kuisList.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Kuis</h2>
          <div className="space-y-3">
            {kuisList.map((k) => {
              const attempt = myAttempts?.find((a) => a.kuis_id === k.id);
              const selesai = attempt?.waktu_selesai;
              const sedang = attempt && !attempt.waktu_selesai;
              return (
                <Link
                  key={k.id}
                  href={`/mahasiswa/matakuliah/${id}/pertemuan/${pid}/kuis/${k.id}`}
                  className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{k.judul}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {k.kuis_soal?.[0]?.count || 0} soal · {k.durasi_menit} menit
                    </p>
                  </div>
                  {selesai ? (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: (attempt!.skor ?? 0) >= 60 ? "#dcf5e6" : "#fde8e8",
                        color: (attempt!.skor ?? 0) >= 60 ? "#177a4d" : "#c23b3b",
                      }}
                    >
                      Selesai · Nilai {attempt!.skor}
                    </span>
                  ) : sedang ? (
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                      Sedang berlangsung
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                      Belum dikerjakan
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Tugas */}
      {tugasList && tugasList.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Tugas</h2>
          <div className="space-y-3">
            {tugasList.map((t) => {
              const sub = mySubmissions?.find((s) => s.tugas_id === t.id);
              const isPastDeadline = new Date(t.deadline) < new Date();

              return (
                <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{t.judul}</h3>
                    {sub ? (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        Sudah dikumpulkan
                      </span>
                    ) : isPastDeadline ? (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                        Melewati deadline
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                        Belum dikumpulkan
                      </span>
                    )}
                  </div>
                  {t.deskripsi && (
                    <p className="text-sm text-gray-600 mb-2">{t.deskripsi}</p>
                  )}
                  {t.soal_url && (
                    <a
                      href={t.soal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:underline mb-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {t.soal_nama_file || "File Soal Tugas"}
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mb-3">
                    Deadline:{" "}
                    {new Date(t.deadline).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {sub ? (
                    <div className="space-y-2">
                      <div className="bg-gray-50 rounded-lg px-4 py-2.5 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Dikirim{" "}
                            {new Date(sub.waktu_submit).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <a href={sub.file_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-emerald-700 hover:underline">
                          {sub.nama_file || "Lihat file"}
                        </a>
                      </div>
                      {sub.nilai !== null ? (
                        <div style={{
                          borderRadius: 10, border: "1px solid rgba(0,0,0,.08)",
                          padding: "12px 16px", background: "#fff"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: sub.feedback ? 8 : 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#3E3A2F" }}>Nilai dari Dosen</span>
                            <span style={{
                              fontSize: 20, fontWeight: 800,
                              color: sub.nilai >= 60 ? "#177a4d" : "#c23b3b"
                            }}>
                              {sub.nilai}
                            </span>
                          </div>
                          {sub.feedback && (
                            <div style={{
                              background: "#f9f8f5", borderRadius: 7,
                              padding: "8px 12px", fontSize: 13, color: "#4a4540"
                            }}>
                              <span style={{ fontWeight: 600, fontSize: 12, color: "#65635d" }}>Catatan dosen: </span>
                              {sub.feedback}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic px-1">
                          Menunggu penilaian dari dosen...
                        </div>
                      )}
                    </div>
                  ) : !isPastDeadline ? (
                    <SubmitTugas tugasId={t.id} mkId={id} pertemuanId={pid} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
