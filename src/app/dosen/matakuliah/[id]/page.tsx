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
    .order("tanggal", { ascending: true });

  const pertemuanList = pertemuan || [];
  const totalCells = Math.max(pertemuanList.length, 16);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const doneCount = pertemuanList.filter((p) => new Date(p.tanggal) <= today).length;
  const nextMeeting = pertemuanList[doneCount] || pertemuanList[pertemuanList.length - 1] || null;
  const nextIndex = nextMeeting ? pertemuanList.indexOf(nextMeeting) : -1;

  const { data: mahasiswa } = await supabase
    .from("enrollment")
    .select("mahasiswa:mahasiswa_id(id, nim, nama)")
    .eq("mk_id", id);

  // Data for rekap nilai
  const pertemuanIds = pertemuanList.map((p) => p.id);
  const totalPertemuan = pertemuanIds.length;

  const { data: absensiAll } = pertemuanIds.length > 0
    ? await supabase.from("absensi").select("mahasiswa_id").in("pertemuan_id", pertemuanIds)
    : { data: [] };

  const { data: nilaiAll } = await supabase
    .from("nilai")
    .select("mahasiswa_id, tugas, uts, uas")
    .eq("mk_id", id);

  // Hitung rata-rata tugas dari submission yang sudah dinilai
  const { data: tugasAll } = pertemuanIds.length > 0
    ? await supabase.from("tugas").select("id").in("pertemuan_id", pertemuanIds)
    : { data: [] };

  const tugasIds = (tugasAll || []).map((t) => t.id);
  const { data: submissionNilai } = tugasIds.length > 0
    ? await supabase
        .from("submission")
        .select("mahasiswa_id, nilai")
        .in("tugas_id", tugasIds)
        .not("nilai", "is", null)
    : { data: [] };

  const tugasAkumulasi: Record<string, { sum: number; count: number }> = {};
  for (const s of submissionNilai || []) {
    if (s.nilai !== null) {
      if (!tugasAkumulasi[s.mahasiswa_id]) tugasAkumulasi[s.mahasiswa_id] = { sum: 0, count: 0 };
      tugasAkumulasi[s.mahasiswa_id].sum += s.nilai;
      tugasAkumulasi[s.mahasiswa_id].count += 1;
    }
  }

  const absensiCount: Record<string, number> = {};
  for (const a of absensiAll || []) {
    absensiCount[a.mahasiswa_id] = (absensiCount[a.mahasiswa_id] || 0) + 1;
  }

  const nilaiMap: Record<string, { tugas: number | null; uts: number | null; uas: number | null }> = {};
  for (const n of nilaiAll || []) {
    nilaiMap[n.mahasiswa_id] = { tugas: n.tugas ?? null, uts: n.uts, uas: n.uas };
  }

  const students = (mahasiswa || []).map((e: Record<string, unknown>) => {
    const mhs = e.mahasiswa as { id: string; nim: string; nama: string };
    const hadir = absensiCount[mhs.id] || 0;
    const presensiPct = totalPertemuan > 0 ? (hadir / totalPertemuan) * 100 : 0;
    const n = nilaiMap[mhs.id] || { tugas: null, uts: null, uas: null };
    const tugasAcc = tugasAkumulasi[mhs.id];
    const tugas = tugasAcc ? Math.round(tugasAcc.sum / tugasAcc.count) : n.tugas;
    return { id: mhs.id, nim: mhs.nim, nama: mhs.nama, presensiPct, tugas, tugasIsAuto: !!tugasAcc, uts: n.uts, uas: n.uas };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start" }}>
        <Link href="/dosen" className="btn btn-ghost" style={{ gap: 6, paddingLeft: 0, border: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          Semua mata kuliah
        </Link>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", width: "100%" }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span className="tag tag-outline">{mk.kode}</span>
              {mk.semester && <span className="tag tag-neutral">Sem {mk.semester}</span>}
              <span className="tag tag-neutral">{mahasiswa?.length || 0} mahasiswa</span>
            </div>
            <h1 style={{
              margin: 0, fontSize: 60, lineHeight: .92, textTransform: "uppercase", maxWidth: 760,
              fontFamily: "var(--font-heading)", fontWeight: 600,
            }}>
              {mk.nama}
            </h1>
            {mk.deskripsi && <p style={{ fontSize: 14, opacity: .7, marginTop: 10, maxWidth: 600 }}>{mk.deskripsi}</p>}
          </div>
          {nextMeeting && (
            <div className="blueprint" style={{ padding: "14px 20px", minWidth: 230, background: "var(--color-bg)" }}>
              <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
              <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-accent-700)" }}>
                Pertemuan berikutnya
              </div>
              <div style={{ font: "600 30px/1.1 var(--font-heading)", marginTop: 2 }}>
                Pertemuan {nextIndex + 1}
              </div>
              <div style={{ fontSize: 13, opacity: .7 }}>
                {new Date(nextMeeting.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Left: progress + meeting list */}
        <div style={{ flex: "1 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
            {Array.from({ length: totalCells }, (_, i) => (
              <div key={i} style={{
                flex: 1, height: 10, border: "1px solid var(--color-accent)",
                background: i < doneCount ? "var(--color-accent)" : i === doneCount ? "var(--color-accent-200)" : "transparent",
              }} />
            ))}
          </div>

          <TambahPertemuan mkId={id} />

          {pertemuanList.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, opacity: .5 }}>
              Belum ada pertemuan.
            </div>
          ) : (
            pertemuanList.map((p, i) => {
              const past = i < doneCount;
              const isNext = i === doneCount;
              const border = isNext ? "var(--color-accent)" : "var(--color-divider)";
              const numBg = past ? "var(--color-accent)" : isNext ? "var(--color-accent-200)" : "transparent";
              const numColor = past ? "var(--color-bg)" : "var(--color-text)";

              return (
                <Link
                  key={p.id}
                  href={`/dosen/matakuliah/${id}/pertemuan/${p.id}`}
                  style={{
                    display: "grid", gridTemplateColumns: "60px minmax(0,1fr) auto",
                    alignItems: "stretch", border: `1px solid ${border}`,
                    background: "var(--color-bg)", color: "var(--color-text)", textDecoration: "none",
                  }}
                >
                  <div style={{
                    display: "grid", placeItems: "center", font: "600 28px var(--font-heading)",
                    background: numBg, color: numColor, borderRight: `1px solid ${border}`,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <span style={{ fontSize: 15, lineHeight: 1.3 }}>{p.judul}</span>
                    <span style={{ fontSize: 12, opacity: .6 }}>
                      {new Date(p.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px", fontSize: 12 }}>
                    {p.absensi_buka && <span className="tag tag-accent">Absensi Dibuka</span>}
                    {isNext && !p.absensi_buka && <span className="tag tag-accent">Berikutnya</span>}
                    <span style={{ opacity: .6, whiteSpace: "nowrap" }}>
                      {p.absensi?.[0]?.count || 0} hadir · {p.tugas?.[0]?.count || 0} tugas
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: .5 }}>
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Right: mahasiswa roster */}
        <div style={{ flex: "0 1 340px", minWidth: 280, width: "100%", position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 30, textTransform: "uppercase", fontFamily: "var(--font-heading)", fontWeight: 600 }}>
              Mahasiswa
            </h2>
            <div style={{ fontSize: 12, opacity: .6, marginTop: 2 }}>
              {mahasiswa?.length || 0} terdaftar di kelas ini
            </div>
          </div>
          <div className="blueprint" style={{ background: "var(--color-bg)" }}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
            {!mahasiswa || mahasiswa.length === 0 ? (
              <div style={{ padding: "24px 18px", textAlign: "center", fontSize: 13, opacity: .5 }}>
                Belum ada mahasiswa terdaftar.
              </div>
            ) : (
              mahasiswa.map((e: Record<string, unknown>) => {
                const mhs = e.mahasiswa as { id: string; nim: string; nama: string };
                return (
                  <div key={mhs.id} style={{
                    padding: "12px 18px", borderBottom: "1px solid var(--color-divider)",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13,
                  }}>
                    <span>{mhs.nama}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 12, opacity: .6 }}>{mhs.nim}</span>
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
