"use client";

import { useState } from "react";
import { editPertemuan } from "@/lib/actions/pertemuan";

export default function EditPertemuan({
  pertemuanId,
  mkId,
  initialJudul,
  initialTanggal,
  initialDeskripsi,
}: {
  pertemuanId: string;
  mkId: string;
  initialJudul: string;
  initialTanggal: string;
  initialDeskripsi: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [judul, setJudul] = useState(initialJudul);
  const [tanggal, setTanggal] = useState(initialTanggal.slice(0, 10));
  const [deskripsi, setDeskripsi] = useState(initialDeskripsi ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!judul.trim() || !tanggal) return;
    setSaving(true);
    setError("");
    const res = await editPertemuan(pertemuanId, mkId, judul.trim(), tanggal, deskripsi);
    setSaving(false);
    if (res?.error) { setError(res.error); return; }
    setOpen(false);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1.5px solid #DFDEDA", fontSize: 14,
    fontFamily: "inherit", background: "#fff", display: "block"
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: 12, color: "#65635d", background: "none",
          border: "1px solid rgba(0,0,0,.12)", borderRadius: 6,
          padding: "3px 10px", cursor: "pointer", fontFamily: "inherit"
        }}
      >
        ✏️ Edit pertemuan
      </button>
    );
  }

  return (
    <div style={{
      background: "#fff", border: "1.5px solid #185B37",
      borderRadius: 12, padding: "20px 24px", marginTop: 12
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}>
        Edit Pertemuan
      </div>
      {error && (
        <div style={{ marginBottom: 12, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, fontSize: 13, color: "#b91c1c" }}>
          {error}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#65635d", marginBottom: 6 }}>Judul</label>
          <input
            type="text"
            value={judul}
            onChange={e => setJudul(e.target.value)}
            style={inputStyle}
            autoFocus
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#65635d", marginBottom: 6 }}>Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={e => setTanggal(e.target.value)}
            style={{ ...inputStyle, width: "auto" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#65635d", marginBottom: 6 }}>Deskripsi (opsional)</label>
          <textarea
            value={deskripsi}
            onChange={e => setDeskripsi(e.target.value)}
            rows={2}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          onClick={handleSave}
          disabled={saving || !judul.trim() || !tanggal}
          style={{
            padding: "8px 18px", borderRadius: 8, background: "#185B37",
            color: "#fff", border: "none", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            opacity: saving || !judul.trim() || !tanggal ? 0.6 : 1
          }}
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          onClick={() => { setOpen(false); setError(""); }}
          style={{
            padding: "8px 16px", borderRadius: 8, background: "none",
            border: "1px solid rgba(0,0,0,.15)", fontSize: 13,
            cursor: "pointer", fontFamily: "inherit"
          }}
        >
          Batal
        </button>
      </div>
    </div>
  );
}
