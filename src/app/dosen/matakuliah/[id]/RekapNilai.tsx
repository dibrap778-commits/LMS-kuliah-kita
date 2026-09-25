"use client";

import { useState } from "react";
import { saveNilai } from "@/lib/actions/nilai";

type StudentRow = {
  id: string;
  nim: string;
  nama: string;
  presensiPct: number;
  tugas: number | null;
  uts: number | null;
  uas: number | null;
};

const BOBOT = { presensi: 10, tugas: 20, uts: 30, uas: 40 };

function hitungNilaiAkhir(row: StudentRow): number | null {
  if (row.tugas === null || row.uts === null || row.uas === null) return null;
  return Math.round(
    (row.presensiPct * BOBOT.presensi +
      row.tugas * BOBOT.tugas +
      row.uts * BOBOT.uts +
      row.uas * BOBOT.uas) /
      100
  );
}

export default function RekapNilai({
  mkId,
  initialStudents,
}: {
  mkId: string;
  initialStudents: StudentRow[];
}) {
  const [rows, setRows] = useState<StudentRow[]>(initialStudents);
  const [saving, setSaving] = useState<string>("");

  async function handleBlur(
    mahasiswaId: string,
    field: "tugas" | "uts" | "uas",
    raw: string
  ) {
    const parsed = raw === "" ? null : Math.min(100, Math.max(0, Number(raw)));
    if (isNaN(parsed as number) && parsed !== null) return;

    setSaving(`${mahasiswaId}-${field}`);
    setRows((prev) =>
      prev.map((r) => (r.id === mahasiswaId ? { ...r, [field]: parsed } : r))
    );
    await saveNilai(mahasiswaId, mkId, field, parsed);
    setSaving("");
  }

  const nilaiList = rows.map(hitungNilaiAkhir).filter((n): n is number => n !== null);
  const rataRata = nilaiList.length ? Math.round(nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length) : null;
  const tertinggi = nilaiList.length ? Math.max(...nilaiList) : null;
  const terendah = nilaiList.length ? Math.min(...nilaiList) : null;
  const belumLengkap = rows.filter((r) => r.tugas === null || r.uts === null || r.uas === null).length;

  function exportCSV() {
    const header = "Nama,NIM,Presensi (%),Tugas,UTS,UAS,Nilai Akhir";
    const lines = rows.map((r) => {
      const na = hitungNilaiAkhir(r);
      return [r.nama, r.nim, r.presensiPct.toFixed(0), r.tugas ?? "", r.uts ?? "", r.uas ?? "", na ?? ""].join(",");
    });
    const csv = "﻿" + [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekap-nilai-${mkId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ marginTop: 48 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>Rekapitulasi Nilai</div>
          <div style={{ fontSize: 13, color: "rgba(0,0,0,.45)", marginTop: 2 }}>
            Bobot: Presensi {BOBOT.presensi}% · Tugas {BOBOT.tugas}% · UTS {BOBOT.uts}% · UAS {BOBOT.uas}%
          </div>
        </div>
        <button
          onClick={exportCSV}
          style={{
            padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(0,0,0,.15)",
            background: "#1f9d63", color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit"
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Rata-rata Kelas", value: rataRata !== null ? rataRata : "—" },
          { label: "Nilai Tertinggi", value: tertinggi !== null ? tertinggi : "—" },
          { label: "Nilai Terendah", value: terendah !== null ? terendah : "—" },
          { label: "Belum Lengkap", value: belumLengkap },
        ].map((card) => (
          <div key={card.label} style={{
            background: "#fff", border: "1px solid rgba(0,0,0,.08)", borderRadius: 10,
            padding: "16px 18px"
          }}>
            <div style={{ fontSize: 12.5, color: "rgba(0,0,0,.45)", marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,.08)", borderRadius: 10, overflow: "hidden" }}>
        {rows.length === 0 ? (
          <div style={{ padding: "32px 0", textAlign: "center", color: "rgba(0,0,0,.35)", fontSize: 14 }}>
            Belum ada mahasiswa terdaftar.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid rgba(0,0,0,.08)" }}>
                {["Mahasiswa", "NIM", "Presensi", "Tugas", "UTS", "UAS", "Nilai Akhir"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: h === "Mahasiswa" ? "left" : "center",
                    fontSize: 12.5, fontWeight: 600, color: "rgba(0,0,0,.45)"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const na = hitungNilaiAkhir(row);
                return (
                  <tr key={row.id} style={{ borderBottom: "1px solid rgba(0,0,0,.06)" }}>
                    <td style={{ padding: "10px 14px", color: "#1a1a1a" }}>{row.nama}</td>
                    <td style={{ padding: "10px 14px", textAlign: "center", fontFamily: "monospace", color: "rgba(0,0,0,.5)", fontSize: 13 }}>{row.nim}</td>
                    <td style={{ padding: "10px 14px", textAlign: "center", color: "#1a1a1a" }}>{row.presensiPct.toFixed(0)}%</td>
                    {(["tugas", "uts", "uas"] as const).map((field) => (
                      <td key={field} style={{ padding: "10px 14px", textAlign: "center" }}>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          defaultValue={row[field] ?? ""}
                          onBlur={(e) => handleBlur(row.id, field, e.target.value)}
                          style={{
                            width: 56, textAlign: "center", padding: "4px 6px",
                            border: saving === `${row.id}-${field}` ? "1.5px solid #1f9d63" : "1px solid rgba(0,0,0,.15)",
                            borderRadius: 6, fontSize: 14, fontFamily: "inherit",
                            outline: "none"
                          }}
                        />
                      </td>
                    ))}
                    <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700,
                      color: na === null ? "rgba(0,0,0,.35)" : na >= 60 ? "#177a4d" : "#c23b3b"
                    }}>
                      {na !== null ? na : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
