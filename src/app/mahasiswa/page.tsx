import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

function computeProgress(pertemuanList: { id: string; tanggal: string }[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sorted = [...pertemuanList].sort(
    (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
  );
  const lewat = sorted.filter((p) => new Date(p.tanggal) <= today);
  const total = Math.max(sorted.length, 16);
  const nextP = sorted.find((p) => new Date(p.tanggal) > today);
  return { total, done: lewat.length, lewatIds: lewat.map((p) => p.id), nextTanggal: nextP?.tanggal ?? null };
}

function formatNext(dateStr: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const weekday = d.toLocaleDateString("id-ID", { weekday: "short" });
  const day = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  return `Berikut: ${weekday}, ${day}`;
}

export default async function MahasiswaDashboard() {
  const session = await getSession();
  const supabase = createServerClient();

  const { data: enrollments } = await supabase
    .from("enrollment")
    .select("mata_kuliah:mk_id(id, kode, nama, semester, dosen:dosen_id(nama), pertemuan(id, tanggal))")
    .eq("mahasiswa_id", session!.id);

  const mataKuliah = (enrollments || []).map((e: Record<string, unknown>, i: number) => {
    const mk = e.mata_kuliah as unknown as {
      id: string; kode: string; nama: string; semester: number | null;
      dosen: { nama: string } | { nama: string }[] | null;
      pertemuan: { id: string; tanggal: string }[];
    };
    const dosenNama = Array.isArray(mk.dosen) ? mk.dosen[0]?.nama : mk.dosen?.nama;
    const { total, done, lewatIds, nextTanggal } = computeProgress(mk.pertemuan || []);
    return {
      id: mk.id, kode: mk.kode, nama: mk.nama, semester: mk.semester,
      num: String(i + 1).padStart(2, "0"),
      dosenNama: dosenNama ?? null,
      total, done, lewatIds, next: formatNext(nextTanggal), nextTanggal,
    };
  });

  const pertemuanLewatIds = mataKuliah.flatMap((mk) => mk.lewatIds);
  const { data: absensiSaya } = pertemuanLewatIds.length > 0
    ? await supabase
        .from("absensi")
        .select("pertemuan_id", { count: "exact" })
        .eq("mahasiswa_id", session!.id)
        .in("pertemuan_id", pertemuanLewatIds)
    : { data: [] };

  const hadirCount = absensiSaya?.length || 0;
  const kehadiranPct = pertemuanLewatIds.length > 0
    ? Math.round((hadirCount / pertemuanLewatIds.length) * 100)
    : null;

  const nextOverall = mataKuliah
    .filter((mk) => mk.nextTanggal)
    .sort((a, b) => new Date(a.nextTanggal!).getTime() - new Date(b.nextTanggal!).getTime())[0];
  const nextWeekday = nextOverall ? new Date(nextOverall.nextTanggal!).toLocaleDateString("id-ID", { weekday: "short" }) : "-";
  const nextDay = nextOverall ? new Date(nextOverall.nextTanggal!).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "";

  const stats = [
    { label: "Mata kuliah diambil", value: mataKuliah.length, unit: "MK" },
    { label: "Pertemuan berikutnya", value: nextWeekday, unit: nextDay },
    { label: "Kehadiran", value: kehadiranPct !== null ? kehadiranPct : "-", unit: "%" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {/* Page head */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent-700)", marginBottom: 8 }}>
            Ruang belajar · Semester ganjil
          </div>
          <h1 style={{ margin: 0, fontSize: 68, lineHeight: .9, textTransform: "uppercase", letterSpacing: ".01em", fontFamily: "var(--font-heading)", fontWeight: 600 }}>
            Mata Kuliah Saya
          </h1>
        </div>
        <Link href="/mahasiswa/kelola-mk" className="btn btn-primary blueprint" style={{ padding: "10px 18px", gap: 8 }}>
          <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14" /></svg>
          Kelola Mata Kuliah
        </Link>
      </div>

      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", border: "1px solid var(--color-divider)", background: "var(--color-bg)" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ padding: "16px 20px", borderRight: "1px solid var(--color-divider)", display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", opacity: .6 }}>{s.label}</span>
            <span style={{ font: "600 38px/1.1 var(--font-heading)" }}>
              {s.value}<span style={{ fontSize: 18, opacity: .5 }}> {s.unit}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Card grid */}
      {mataKuliah.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", border: "1px solid var(--color-divider)" }}>
          <p style={{ color: "var(--color-text)", opacity: .6, margin: 0 }}>Belum terdaftar di mata kuliah manapun.</p>
          <Link href="/mahasiswa/kelola-mk" style={{ fontSize: 13, marginTop: 8, display: "inline-block" }}>
            Daftar mata kuliah sekarang
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 28 }}>
          {mataKuliah.map((mk) => (
            <div key={mk.id} className="blueprint" style={{ background: "var(--color-bg)", padding: 22, display: "flex", flexDirection: "column", gap: 18, overflow: "hidden" }}>
              <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
              <div style={{
                position: "absolute", right: 10, top: -8, font: "700 140px/1 var(--font-heading)",
                color: "var(--color-accent)", opacity: .14, pointerEvents: "none",
              }}>
                {mk.num}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
                <span className="tag tag-outline">{mk.kode}</span>
                {mk.semester && <span className="tag tag-neutral">Sem {mk.semester}</span>}
              </div>

              <Link
                href={`/mahasiswa/matakuliah/${mk.id}`}
                style={{
                  margin: 0, fontSize: 30, lineHeight: 1.02, textTransform: "uppercase",
                  minHeight: 62, position: "relative", maxWidth: "85%",
                  fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--color-text)",
                  textDecoration: "none", display: "block",
                }}
              >
                {mk.nama}
              </Link>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>
                  <span>Pertemuan {mk.done} / {mk.total}</span>
                  {mk.next && <span style={{ color: "var(--color-accent-700)" }}>{mk.next}</span>}
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  {Array.from({ length: mk.total }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1, height: 14, border: "1px solid var(--color-accent)",
                        background: i < mk.done ? "var(--color-accent)" : i === mk.done ? "var(--color-accent-200)" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: "1px solid var(--color-divider)", paddingTop: 16 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
                  </svg>
                  {mk.dosenNama || "-"}
                </span>
                <Link href={`/mahasiswa/matakuliah/${mk.id}`} className="btn btn-primary" style={{ padding: "8px 14px", gap: 8 }}>
                  Masuk Kelas
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
