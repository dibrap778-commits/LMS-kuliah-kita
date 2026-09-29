"use client";

import { useState } from "react";
import { editTugas } from "@/lib/actions/tugas";

function toDatetimeLocal(iso: string) {
  return iso.slice(0, 16);
}

export default function EditTugas({
  tugasId, pertemuanId, mkId,
  initialJudul, initialDeskripsi, initialDeadline,
}: {
  tugasId: string; pertemuanId: string; mkId: string;
  initialJudul: string; initialDeskripsi: string | null; initialDeadline: string;
}) {
  const [open, setOpen] = useState(false);
  const [judul, setJudul] = useState(initialJudul);
  const [deskripsi, setDeskripsi] = useState(initialDeskripsi ?? "");
  const [deadline, setDeadline] = useState(toDatetimeLocal(initialDeadline));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!judul.trim() || !deadline) return;
    setSaving(true);
    setError("");
    const res = await editTugas(tugasId, pertemuanId, mkId, judul.trim(), deskripsi, deadline);
    setSaving(false);
    if (res?.error) { setError(res.error); return; }
    setOpen(false);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 7,
    border: "1.5px solid #DFDEDA", fontSize: 13,
    fontFamily: "inherit", background: "#fff", display: "block"
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: 11, color: "#65635d", background: "none",
          border: "1px solid rgba(0,0,0,.12)", borderRadius: 5,
          padding: "2px 8px", cursor: "pointer", fontFamily: "inherit"
        }}
      >
        ✏️ Edit
      </button>
    );
  }

  return (
    <div style={{
      marginTop: 10, padding: "16px 18px",
      background: "#f9f8f5", borderRadius: 10,
      border: "1.5px solid #185B37"
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", marginBottom: 12 }}>Edit Tugas</div>
      {error && (
        <div style={{ marginBottom: 10, padding: "7px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12, color: "#b91c1c" }}>
          {error}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#65635d", marginBottom: 4 }}>Judul</label>
          <input type="text" value={judul} onChange={e => setJudul(e.target.value)} style={inputStyle} autoFocus />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#65635d", marginBottom: 4 }}>Deskripsi (opsional)</label>
          <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} rows={2}
            style={{ ...inputStyle, resize: "vertical" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#65635d", marginBottom: 4 }}>Deadline</label>
          <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)}
            style={{ ...inputStyle, width: "auto" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={handleSave} disabled={saving || !judul.trim() || !deadline}
          style={{
            padding: "6px 16px", borderRadius: 7, background: "#185B37",
            color: "#fff", border: "none", fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            opacity: saving || !judul.trim() || !deadline ? 0.6 : 1
          }}>
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        <button onClick={() => { setOpen(false); setError(""); }}
          style={{
            padding: "6px 14px", borderRadius: 7, background: "none",
            border: "1px solid rgba(0,0,0,.15)", fontSize: 12,
            cursor: "pointer", fontFamily: "inherit"
          }}>
          Batal
        </button>
      </div>
    </div>
  );
}
