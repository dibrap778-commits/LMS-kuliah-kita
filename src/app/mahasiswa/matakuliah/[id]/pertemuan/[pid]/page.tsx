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

  function getYoutubeId(url: string): string | null {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    } catch {
      //
    }
    return null;
  }

  function getYoutubeEmbedUrl(url: string): string | null {
    const ytId = getYoutubeId(url);
    return ytId ? `https://www.youtube.com/embed/${ytId}` : null;
  }

  const iconFile = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" /><path d="M14 2v6h6" />
    </svg>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Link
        href={`/mahasiswa/matakuliah/${id}`}
        style={{ fontSize: 14, color: "#2563eb", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
        Kembali ke {pertemuan.mata_kuliah.nama}
      </Link>

      <div>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 750, color: "#0b1748", fontFamily: "var(--font-heading)" }}>
          {pertemuan.judul}
        </h1>
        <p style={{ fontSize: 14, color: "#586b88", marginTop: 8 }}>
          {new Date(pertemuan.tanggal).toLocaleDateString("id-ID", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          })}
        </p>
        {pertemuan.deskripsi && (
          <p style={{ fontSize: 14, color: "#334155", marginTop: 8 }}>{pertemuan.deskripsi}</p>
        )}
      </div>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Kolom kiri: konten utama */}
        <div style={{ flex: "1 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Absensi */}
          <div>
            {sudahAbsen ? (
              <div style={{
                display: "flex", alignItems: "center", gap: 10, background: "#dcfce7",
                color: "#166534", borderRadius: 12, padding: "14px 18px", fontWeight: 700, fontSize: 14,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#166534"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Kehadiran tercatat
              </div>
            ) : pertemuan.absensi_buka ? (
              <div style={{ background: "#fff", border: "1.5px solid #c7ddfb", borderRadius: 12, padding: "16px 18px" }}>
                <AbsenButton pertemuanId={pid} />
              </div>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", gap: 10, background: "#f5f9ff",
                color: "#586b88", borderRadius: 12, padding: "14px 18px", fontSize: 13.5,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 16v-5M12 8h.01" /></svg>
                Absensi belum dibuka oleh dosen.
              </div>
            )}
          </div>

          {/* Materi */}
          {materiList && materiList.length > 0 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0b1748", marginBottom: 12 }}>Materi pembelajaran</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {materiList.map((m) => {
                  if (m.tipe === "video") {
                    const embedUrl = getYoutubeEmbedUrl(m.url);
                    return embedUrl ? (
                      <div
                        key={m.id}
                        style={{
                          background: "#fff", borderRadius: 14,
                          border: "1.5px solid #c7ddfb", overflow: "hidden",
                        }}
                      >
                        <div style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>
                          <iframe
                            src={embedUrl}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                          />
                        </div>
                        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#0b1748" }}>{m.nama_file || "Video materi pertemuan"}</span>
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 12.5, color: "#2563eb", fontWeight: 700, whiteSpace: "nowrap", textDecoration: "none" }}
                          >
                            Buka di YouTube ↗
                          </a>
                        </div>
                      </div>
                    ) : (
                      <a
                        key={m.id}
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex", alignItems: "center", gap: 12, background: "#fff",
                          borderRadius: 12, border: "1.5px solid #c7ddfb", padding: "14px 16px", textDecoration: "none",
                        }}
                      >
                        <span style={{ width: 36, height: 36, borderRadius: 9, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7Z" /></svg>
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#0b1748" }}>{m.nama_file || "Video materi pertemuan"}</span>
                        <span style={{ marginLeft: "auto", fontSize: 12.5, color: "#2563eb", fontWeight: 700 }}>Buka Video</span>
                      </a>
                    );
                  }
                  return (
                    <a
                      key={m.id}
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: 12, background: "#fff",
                        borderRadius: 12, border: "1.5px solid #c7ddfb", padding: "14px 16px", textDecoration: "none",
                      }}
                    >
                      <span style={{ width: 36, height: 36, borderRadius: 9, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0 }}>
                        {iconFile}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0b1748" }}>{m.nama_file || "Dokumen"}</span>
                      <span style={{ marginLeft: "auto", fontSize: 12.5, color: "#2563eb", fontWeight: 700 }}>Unduh</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kuis */}
          {kuisList && kuisList.length > 0 && (
            <div id="kuis-section">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0b1748", marginBottom: 12 }}>Kuis</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {kuisList.map((k) => {
                  const attempt = myAttempts?.find((a) => a.kuis_id === k.id);
                  const selesai = attempt?.waktu_selesai;
                  const sedang = attempt && !attempt.waktu_selesai;
                  return (
                    <Link
                      key={k.id}
                      id={`kuis-${k.id}`}
                      href={`/mahasiswa/matakuliah/${id}/pertemuan/${pid}/kuis/${k.id}`}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                        background: "#fff", borderRadius: 14, border: "1.5px solid #c7ddfb", padding: "16px 18px", textDecoration: "none",
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "#0b1748", margin: 0 }}>{k.judul}</h3>
                        <p style={{ fontSize: 12, color: "#586b88", marginTop: 4 }}>
                          {k.kuis_soal?.[0]?.count || 0} soal · {k.durasi_menit} menit
                        </p>
                      </div>
                      {selesai ? (
                        <span
                          style={{
                            fontSize: 11.5, padding: "4px 10px", borderRadius: 999, fontWeight: 700,
                            background: attempt!.skor === null ? "#fef3c7" : (attempt!.skor ?? 0) >= 60 ? "#dbeafe" : "#fde8e8",
                            color: attempt!.skor === null ? "#92400e" : (attempt!.skor ?? 0) >= 60 ? "#1e40af" : "#c23b3b",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {attempt!.skor === null ? "Menunggu dinilai" : `Selesai · Nilai ${attempt!.skor}`}
                        </span>
                      ) : sedang ? (
                        <span style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 999, fontWeight: 700, background: "#fef3c7", color: "#92400e", whiteSpace: "nowrap" }}>
                          Sedang berlangsung
                        </span>
                      ) : (
                        <span style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 999, fontWeight: 700, background: "#f1f5f9", color: "#64748b", whiteSpace: "nowrap" }}>
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
            <div id="tugas-section">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0b1748", marginBottom: 12 }}>Tugas</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {tugasList.map((t) => {
                  const sub = mySubmissions?.find((s) => s.tugas_id === t.id);
                  const isPastDeadline = new Date(t.deadline) < new Date();

                  return (
                    <div key={t.id} id={`tugas-${t.id}`} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #c7ddfb", padding: "18px 20px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0b1748", margin: 0 }}>{t.judul}</h3>
                        {sub ? (
                          <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, fontWeight: 700, background: "#dcfce7", color: "#166534", whiteSpace: "nowrap" }}>
                            Sudah dikumpulkan
                          </span>
                        ) : isPastDeadline ? (
                          <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, fontWeight: 700, background: "#fee2e2", color: "#b91c1c", whiteSpace: "nowrap" }}>
                            Melewati deadline
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, fontWeight: 700, background: "#fef3c7", color: "#92400e", whiteSpace: "nowrap" }}>
                            Belum dikumpulkan
                          </span>
                        )}
                      </div>
                      {t.deskripsi && (
                        <p style={{ fontSize: 13.5, color: "#334155", marginBottom: 8 }}>{t.deskripsi}</p>
                      )}
                      {t.soal_url && (
                        <a
                          href={t.soal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2563eb", fontWeight: 600, marginBottom: 8, textDecoration: "none" }}
                        >
                          {iconFile}
                          {t.soal_nama_file || "File Soal Tugas"}
                        </a>
                      )}
                      <p style={{ fontSize: 12, color: "#586b88", marginBottom: 12 }}>
                        Deadline:{" "}
                        {new Date(t.deadline).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>

                      {sub ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{
                            background: "#f5f9ff", borderRadius: 10, padding: "10px 14px",
                            display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13,
                          }}>
                            <span style={{ fontSize: 12, color: "#586b88" }}>
                              Dikirim {new Date(sub.waktu_submit).toLocaleDateString("id-ID", {
                                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                            <a href={sub.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
                              {sub.nama_file || "Lihat file"}
                            </a>
                          </div>
                          {sub.nilai !== null ? (
                            <div style={{ borderRadius: 10, border: "1px solid #c7ddfb", padding: "12px 16px", background: "#fff" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: sub.feedback ? 8 : 0 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#0b1748" }}>Nilai dari Dosen</span>
                                <span style={{ fontSize: 20, fontWeight: 800, color: sub.nilai >= 60 ? "#1e40af" : "#c23b3b" }}>
                                  {sub.nilai}
                                </span>
                              </div>
                              {sub.feedback && (
                                <div style={{ background: "#f5f9ff", borderRadius: 7, padding: "8px 12px", fontSize: 13, color: "#334155" }}>
                                  <span style={{ fontWeight: 600, fontSize: 12, color: "#586b88" }}>Catatan dosen: </span>
                                  {sub.feedback}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", padding: "0 2px" }}>
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

        {/* Kolom kanan: sidebar */}
        <div style={{ flex: "0 1 320px", minWidth: 260, width: "100%", position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 20 }}>
          {pertemuan.link_meeting && (
            <div className="blueprint" style={{ padding: "18px 20px", background: "var(--color-bg)" }}>
              <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
              <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-accent-700)", marginBottom: 10 }}>
                Meeting Online
              </div>
              <a
                href={pertemuan.link_meeting}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                🎥 Gabung Meeting
              </a>
            </div>
          )}

          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0b1748", marginBottom: 10 }}>
              Tugas &amp; kuis pertemuan ini
            </h2>
            {(!tugasList || tugasList.length === 0) && (!kuisList || kuisList.length === 0) ? (
              <div className="blueprint" style={{ padding: "18px", textAlign: "center", fontSize: 12.5, color: "#586b88", background: "var(--color-bg)" }}>
                <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
                Tidak ada tugas atau kuis di pertemuan ini.
              </div>
            ) : (
              <div className="blueprint" style={{ background: "var(--color-bg)" }}>
                <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
                {(tugasList || []).map((t) => {
                  const sub = mySubmissions?.find((s) => s.tugas_id === t.id);
                  const isPastDeadline = new Date(t.deadline) < new Date();
                  const label = sub ? "Terkumpul" : isPastDeadline ? "Terlambat" : "Belum";
                  const color = sub ? "#166534" : isPastDeadline ? "#b91c1c" : "#92400e";
                  const bg = sub ? "#dcfce7" : isPastDeadline ? "#fee2e2" : "#fef3c7";
                  return (
                    <a
                      key={t.id}
                      href={`#tugas-${t.id}`}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                        padding: "11px 16px", borderBottom: "1px solid var(--color-divider)",
                        fontSize: 13, color: "#0b1748", textDecoration: "none",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0, opacity: .5 }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" /><path d="M14 2v6h6M9 13h6M9 17h6" />
                        </svg>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.judul}</span>
                      </span>
                      <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: bg, color }}>
                        {label}
                      </span>
                    </a>
                  );
                })}
                {(kuisList || []).map((k) => {
                  const attempt = myAttempts?.find((a) => a.kuis_id === k.id);
                  const selesai = attempt?.waktu_selesai;
                  const sedang = attempt && !attempt.waktu_selesai;
                  const label = selesai ? (attempt!.skor === null ? "Dinilai" : "Selesai") : sedang ? "Berlangsung" : "Belum";
                  const color = selesai ? "#1e40af" : sedang ? "#92400e" : "#64748b";
                  const bg = selesai ? "#dbeafe" : sedang ? "#fef3c7" : "#f1f5f9";
                  return (
                    <a
                      key={k.id}
                      href={`#kuis-${k.id}`}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                        padding: "11px 16px", fontSize: 13, color: "#0b1748", textDecoration: "none",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0, opacity: .5 }}>
                          <path d="M9 11h6M9 15h4M7 3h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2Z" />
                        </svg>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.judul}</span>
                      </span>
                      <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: bg, color }}>
                        {label}
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
