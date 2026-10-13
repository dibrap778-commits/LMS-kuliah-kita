import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const BOBOT = { presensi: 10, tugas: 20, uts: 30, uas: 40 };

export default async function MahasiswaMKDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  const { data: mkRaw } = await supabase
    .from("mata_kuliah")
    .select("*, dosen:dosen_id(nama)")
    .eq("id", id)
    .single();

  if (!mkRaw) redirect("/mahasiswa");

  const dosenNama = Array.isArray(mkRaw.dosen) ? mkRaw.dosen[0]?.nama : mkRaw.dosen?.nama;

  const { data: pertemuan } = await supabase
    .from("pertemuan")
    .select("*, materi(count), tugas(count)")
    .eq("mk_id", id)
    .order("tanggal", { ascending: true });

  const pertemuanList = pertemuan || [];
  const pertemuanIds = pertemuanList.map((p) => p.id);
  const totalPertemuanReal = pertemuanIds.length;
  const totalCells = Math.max(totalPertemuanReal, 16);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const doneCount = pertemuanList.filter((p) => new Date(p.tanggal) <= today).length;

  const { data: absensiSaya } = pertemuanIds.length > 0
    ? await supabase
        .from("absensi")
        .select("pertemuan_id")
        .eq("mahasiswa_id", session.id)
        .in("pertemuan_id", pertemuanIds)
    : { data: [] };
  const hadirSet = new Set((absensiSaya || []).map((a) => a.pertemuan_id));

  const presensiPct = totalPertemuanReal > 0
    ? Math.round((hadirSet.size / totalPertemuanReal) * 100)
    : 0;

  const { data: nilaiData } = await supabase
    .from("nilai")
    .select("uts, uas")
    .eq("mahasiswa_id", session.id)
    .eq("mk_id", id)
    .single();

  const uts = nilaiData?.uts ?? null;
  const uas = nilaiData?.uas ?? null;

  const { data: tugasAll } = pertemuanIds.length > 0
    ? await supabase.from("tugas").select("id").in("pertemuan_id", pertemuanIds)
    : { data: [] };

  const tugasIds = (tugasAll || []).map((t) => t.id);
  const { data: mySubmissionNilai } = tugasIds.length > 0
    ? await supabase
        .from("submission")
        .select("nilai")
        .eq("mahasiswa_id", session.id)
        .in("tugas_id", tugasIds)
        .not("nilai", "is", null)
    : { data: [] };

  const tugasNilaiList = (mySubmissionNilai || []).map((s) => s.nilai).filter((v) => v !== null);
  const tugas = tugasNilaiList.length > 0
    ? Math.round(tugasNilaiList.reduce((a: number, b: number) => a + b, 0) / tugasNilaiList.length)
    : null;

  const nilaiAkhir =
    tugas !== null && uts !== null && uas !== null
      ? Math.round(
          (presensiPct * BOBOT.presensi + tugas * BOBOT.tugas + uts * BOBOT.uts + uas * BOBOT.uas) / 100
        )
      : null;

  const rekapItems = [
    { label: "Presensi", value: presensiPct, bobot: BOBOT.presensi },
    { label: "Tugas", value: tugas, bobot: BOBOT.tugas },
    { label: "UTS", value: uts, bobot: BOBOT.uts },
    { label: "UAS", value: uas, bobot: BOBOT.uas },
  ];

  const nextMeeting = pertemuanList[doneCount] || pertemuanList[pertemuanList.length - 1] || null;
  const nextIndex = nextMeeting ? pertemuanList.indexOf(nextMeeting) : -1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start" }}>
        <Link href="/mahasiswa" className="btn btn-ghost" style={{ gap: 6, paddingLeft: 0, border: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          Semua mata kuliah
        </Link>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", width: "100%" }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span className="tag tag-outline">{mkRaw.kode}</span>
              {mkRaw.semester && <span className="tag tag-neutral">Sem {mkRaw.semester}</span>}
              {dosenNama && <span className="tag tag-neutral">Dosen: {dosenNama}</span>}
            </div>
            <h1 style={{
              margin: 0, fontSize: 60, lineHeight: .92, textTransform: "uppercase", maxWidth: 760,
              fontFamily: "var(--font-heading)", fontWeight: 600,
            }}>
              {mkRaw.nama}
            </h1>
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
              let tagText = "";
              let tagClass = "tag";
              if (hadirSet.has(p.id)) { tagText = "Hadir"; tagClass = "tag tag-accent"; }
              else if (p.absensi_buka) { tagText = "Absensi Dibuka"; tagClass = "tag tag-outline"; }
              else if (isNext) { tagText = "Berikutnya"; tagClass = "tag tag-accent"; }

              return (
                <Link
                  key={p.id}
                  href={`/mahasiswa/matakuliah/${id}/pertemuan/${p.id}`}
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
                    {tagText && <span className={tagClass}>{tagText}</span>}
                    <span style={{ opacity: .6, whiteSpace: "nowrap" }}>
                      {p.materi?.[0]?.count || 0} materi · {p.tugas?.[0]?.count || 0} tugas
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

        {/* Right: rekap nilai */}
        <div style={{ flex: "0 1 340px", minWidth: 280, width: "100%", position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 30, textTransform: "uppercase", fontFamily: "var(--font-heading)", fontWeight: 600 }}>
              Rekapitulasi Nilai
            </h2>
            <div style={{ fontSize: 12, opacity: .6, marginTop: 2 }}>
              Bobot: Presensi {BOBOT.presensi}% · Tugas {BOBOT.tugas}% · UTS {BOBOT.uts}% · UAS {BOBOT.uas}%
            </div>
          </div>
          <div className="blueprint" style={{ background: "var(--color-bg)" }}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
            {rekapItems.map((g) => (
              <div key={g.label} style={{ padding: "14px 18px", borderBottom: "1px solid var(--color-divider)", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 13 }}>{g.label} <span style={{ fontSize: 11, opacity: .55 }}>bobot {g.bobot}%</span></span>
                  <span style={{ font: "600 28px/1 var(--font-heading)", opacity: g.value !== null ? 1 : .3 }}>
                    {g.value !== null ? g.value : "—"}
                  </span>
                </div>
                <div style={{ height: 6, border: "1px solid var(--color-accent)" }}>
                  <div style={{ height: "100%", background: "var(--color-accent)", width: `${g.value ?? 0}%` }} />
                </div>
              </div>
            ))}
            <div style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ font: "600 22px var(--font-heading)", textTransform: "uppercase" }}>Nilai Akhir</div>
                <div style={{ fontSize: 12, opacity: .6 }}>
                  {nilaiAkhir === null
                    ? "Menunggu nilai dari dosen"
                    : nilaiAkhir >= 60
                    ? "Lulus mata kuliah ini"
                    : "Belum mencapai nilai minimum"}
                </div>
              </div>
              <span style={{
                font: "600 44px/1 var(--font-heading)",
                opacity: nilaiAkhir === null ? .3 : 1,
                color: nilaiAkhir === null ? "var(--color-text)" : nilaiAkhir >= 60 ? "var(--color-accent-700)" : "#c23b3b",
              }}>
                {nilaiAkhir !== null ? nilaiAkhir : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
