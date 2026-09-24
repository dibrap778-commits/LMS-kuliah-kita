import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import AbsensiToggle from "./AbsensiToggle";
import TambahMateri from "./TambahMateri";
import TambahTugas from "./TambahTugas";
import HapusTugas from "./HapusTugas";

export default async function PertemuanDetail({
  params,
}: {
  params: Promise<{ id: string; pid: string }>;
}) {
  const { id, pid } = await params;
  const supabase = createServerClient();

  const { data: pertemuan } = await supabase
    .from("pertemuan")
    .select("*, mata_kuliah!inner(kode, nama, dosen_id)")
    .eq("id", pid)
    .single();

  if (!pertemuan) redirect(`/dosen/matakuliah/${id}`);

  const { data: materiList } = await supabase
    .from("materi")
    .select("*")
    .eq("pertemuan_id", pid)
    .order("created_at");

  const { data: absensiList } = await supabase
    .from("absensi")
    .select("*, mahasiswa:mahasiswa_id(nim, nama)")
    .eq("pertemuan_id", pid)
    .order("waktu");

  const { data: tugasList } = await supabase
    .from("tugas")
    .select("*, submission(count)")
    .eq("pertemuan_id", pid)
    .order("created_at");

  const { data: submissions } = await supabase
    .from("submission")
    .select("*, mahasiswa:mahasiswa_id(nim, nama), tugas:tugas_id(judul)")
    .in(
      "tugas_id",
      (tugasList || []).map((t) => t.id)
    );

  return (
    <div>
      <Link
        href={`/dosen/matakuliah/${id}`}
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
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Absensi */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Absensi</h2>
            <AbsensiToggle pertemuanId={pid} initialBuka={pertemuan.absensi_buka} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200">
            {!absensiList || absensiList.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                Belum ada yang absen.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {absensiList.map((a, i) => {
                  const mhs = a.mahasiswa as { nim: string; nama: string };
                  return (
                    <div key={a.id} className="px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                        <span className="text-sm text-gray-700">{mhs.nama}</span>
                        <span className="text-xs text-gray-400 font-mono">{mhs.nim}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(a.waktu).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="px-4 py-2 bg-gray-50 rounded-b-xl text-xs text-gray-500 border-t border-gray-100">
              Total hadir: {absensiList?.length || 0}
            </div>
          </div>
        </div>

        {/* Materi & Tugas */}
        <div className="space-y-6">
          {/* Materi */}
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900">Materi</h2>
            <TambahMateri pertemuanId={pid} />
            {materiList && materiList.length > 0 && (
              <div className="space-y-2">
                {materiList.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium uppercase">
                        {m.tipe}
                      </span>
                      <span className="text-sm text-gray-700">
                        {m.nama_file || "Video"}
                      </span>
                    </div>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:underline"
                    >
                      Buka
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tugas */}
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900">Tugas</h2>
            <TambahTugas pertemuanId={pid} />
            {tugasList && tugasList.length > 0 && (
              <div className="space-y-3">
                {tugasList.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm text-gray-900">{t.judul}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {t.submission?.[0]?.count || 0} dikumpulkan
                        </span>
                        <HapusTugas tugasId={t.id} pertemuanId={pid} mkId={id} />
                      </div>
                    </div>
                    {t.deskripsi && (
                      <p className="text-xs text-gray-500 mb-2">{t.deskripsi}</p>
                    )}
                    {t.soal_url && (
                      <a
                        href={t.soal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline mb-2"
                      >
                        📄 {t.soal_nama_file || "File Soal"}
                      </a>
                    )}
                    <p className="text-xs text-gray-400">
                      Deadline:{" "}
                      {new Date(t.deadline).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {submissions && submissions.filter((s) => s.tugas_id === t.id).length > 0 && (
                      <div className="mt-3 border-t border-gray-100 pt-3 space-y-1.5">
                        {submissions
                          .filter((s) => s.tugas_id === t.id)
                          .map((s) => {
                            const mhs = s.mahasiswa as { nim: string; nama: string };
                            return (
                              <div key={s.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-700">{mhs.nama}</span>
                                  <span className="text-gray-400 font-mono">{mhs.nim}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-gray-400">
                                    {new Date(s.waktu_submit).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  <a
                                    href={s.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-700 hover:underline"
                                  >
                                    {s.nama_file || "Unduh"}
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
