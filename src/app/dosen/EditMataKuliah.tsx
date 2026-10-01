"use client";

import { useState } from "react";
import { editMataKuliah } from "@/lib/actions/matakuliah";

export default function EditMataKuliah({
  id, initialKode, initialNama, initialDeskripsi,
}: {
  id: string; initialKode: string; initialNama: string; initialDeskripsi: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [kode, setKode] = useState(initialKode);
  const [nama, setNama] = useState(initialNama);
  const [deskripsi, setDeskripsi] = useState(initialDeskripsi ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!kode.trim() || !nama.trim()) return;
    setSaving(true);
    setError("");
    const res = await editMataKuliah(id, kode.trim(), nama.trim(), deskripsi);
    setSaving(false);
    if (res?.error) { setError(res.error); return; }
    setOpen(false);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 7,
    border: "1.5px solid #DFDEDA", fontSize: 13,
    fontFamily: "inherit", background: "#fff", display: "block",
    boxSizing: "border-box"
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Edit mata kuliah"
        style={{
          position: "absolute", top: 14, right: 14, zIndex: 2,
          width: 28, height: 28, borderRadius: 7,
          background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, cursor: "pointer"
        }}
      >
        ✏️
      </button>

      {open && (
        <div
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 50, padding: 16
          }}
        >
          <div
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style={{
              background: "#fff", borderRadius: 14, padding: 22,
              width: "100%", maxWidth: 420, boxShadow: "0 20px 50px rgba(0,0,0,.25)"
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 14 }}>
              Edit Mata Kuliah
            </div>
            {error && (
              <div style={{ marginBottom: 10, padding: "7px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12, color: "#b91c1c" }}>
                {error}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#65635d", marginBottom: 4 }}>Kode MK</label>
                <input type="text" value={kode} onChange={e => setKode(e.target.value)} style={inputStyle} autoFocus />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#65635d", marginBottom: 4 }}>Nama Mata Kuliah</label>
                <input type="text" value={nama} onChange={e => setNama(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#65635d", marginBottom: 4 }}>Deskripsi (opsional)</label>
                <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} rows={3}
                  style={{ ...inputStyle, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSave(); }}
                disabled={saving || !kode.trim() || !nama.trim()}
                style={{
                  padding: "8px 18px", borderRadius: 8, background: "#185B37",
                  color: "#fff", border: "none", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                  opacity: saving || !kode.trim() || !nama.trim() ? 0.6 : 1
                }}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); setError(""); }}
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
        </div>
      )}
    </>
  );
}
