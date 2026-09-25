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

  const { data: mk } = await supabase
    .from("mata_kuliah")
    .select("*")
    .eq("id", id)
    .single();

  if (!mk) redirect("/mahasiswa");

  const { data: pertemuan } = await supabase
    .from("pertemuan")
    .select("*, materi(count), tugas(count)")
    .eq("mk_id", id)
    .order("tanggal", { ascending: false });

  // Rekap nilai
  const pertemuanIds = (pertemuan || []).map((p) => p.id);
  const totalPertemuan = pertemuanIds.length;

  const { count: jumlahHadir } = pertemuanIds.length > 0
    ? await supabase
        .from("absensi")
        .select("id", { count: "exact" })
        .eq("mahasiswa_id", session.id)
        .in("pertemuan_id", pertemuanIds)
    : { count: 0 };

  const presensiPct = totalPertemuan > 0
    ? Math.round(((jumlahHadir || 0) / totalPertemuan) * 100)
    : 0;

  const { data: nilaiData } = await supabase
    .from("nilai")
    .select("tugas, uts, uas")
    .eq("mahasiswa_id", session.id)
    .eq("mk_id", id)
    .single();

  const tugas = nilaiData?.tugas ?? null;
  const uts = nilaiData?.uts ?? null;
  const uas = nilaiData?.uas ?? null;

  const nilaiAkhir =
    tugas !== null && uts !== null && uas !== null
      ? Math.round(
          (presensiPct * BOBOT.presensi +
            tugas * BOBOT.tugas +
            uts * BOBOT.uts +
            uas * BOBOT.uas) / 100
        )
      : null;

  const rekapItems = [
    { label: "Presensi", value: presensiPct, satuan: "%", bobot: BOBOT.presensi },
    { label: "Tugas", value: tugas, satuan: "", bobot: BOBOT.tugas },
    { label: "UTS", value: uts, satuan: "", bobot: BOBOT.uts },
    { label: "UAS", value: uas, satuan: "", bobot: BOBOT.uas },
  ];

  return (
    <div>
      <Link href="/mahasiswa" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        &larr; Kembali
      </Link>

      <div className="mb-6">
        <div className="text-xs font-mono text-emerald-700 mb-1">{mk.kode}</div>
        <h1 className="text-xl font-bold text-gray-900">{mk.nama}</h1>
        {mk.deskripsi && <p className="text-sm text-gray-500 mt-1">{mk.deskripsi}</p>}
      </div>

      {!pertemuan || pertemuan.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Belum ada pertemuan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pertemuan.map((p) => (
            <Link
              key={p.id}
              href={`/mahasiswa/matakuliah/${id}/pertemuan/${p.id}`}
              className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-emerald-300 transition-colors"
            >
              <div>
                <div className="font-medium text-sm text-gray-900">{p.judul}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {new Date(p.tanggal).toLocaleDateString("id-ID", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {p.absensi_buka && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                    Absensi Dibuka
                  </span>
                )}
                <span>{p.materi?.[0]?.count || 0} materi</span>
                <span>{p.tugas?.[0]?.count || 0} tugas</span>
                <span className="text-gray-300">&rsaquo;</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Rekap Nilai */}
      <div style={{ marginTop: 40 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>Rekapitulasi Nilai Saya</div>
          <div style={{ fontSize: 13, color: "rgba(0,0,0,.45)", marginTop: 2 }}>
            Bobot: Presensi {BOBOT.presensi}% · Tugas {BOBOT.tugas}% · UTS {BOBOT.uts}% · UAS {BOBOT.uas}%
          </div>
        </div>

        {/* 4 cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 16 }}>
          {rekapItems.map((item) => (
            <div key={item.label} style={{
              background: "#fff", border: "1px solid rgba(0,0,0,.08)",
              borderRadius: 10, padding: "16px 18px"
            }}>
              <div style={{ fontSize: 12, color: "rgba(0,0,0,.45)", marginBottom: 6 }}>
                {item.label} <span style={{ fontSize: 11 }}>bobot {item.bobot}%</span>
              </div>
              <div style={{
                fontSize: 24, fontWeight: 700,
                color: item.value !== null ? "#1a1a1a" : "rgba(0,0,0,.25)"
              }}>
                {item.value !== null ? `${item.value}${item.satuan}` : "—"}
              </div>
            </div>
          ))}
        </div>

        {/* Nilai Akhir card */}
        <div style={{
          background: "#fff", border: "1px solid rgba(0,0,0,.08)",
          borderRadius: 10, padding: "22px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>Nilai Akhir</div>
            <div style={{ fontSize: 13, color: "rgba(0,0,0,.45)" }}>
              {nilaiAkhir === null
                ? "Menunggu nilai dari dosen"
                : nilaiAkhir >= 60
                ? "Lulus mata kuliah ini"
                : "Belum mencapai nilai minimum"}
            </div>
          </div>
          <div style={{
            fontSize: 38, fontWeight: 800,
            color: nilaiAkhir === null
              ? "rgba(0,0,0,.25)"
              : nilaiAkhir >= 60
              ? "#177a4d"
              : "#c23b3b"
          }}>
            {nilaiAkhir !== null ? nilaiAkhir : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
