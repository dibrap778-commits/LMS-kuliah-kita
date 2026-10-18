"use client";

import { useState } from "react";
import { editMataKuliah, deleteMataKuliah } from "@/lib/actions/matakuliah";
import Spinner from "@/components/Spinner";

export default function EditMataKuliah({
  id, initialKode, initialNama, initialDeskripsi, initialSemester,
}: {
  id: string; initialKode: string; initialNama: string; initialDeskripsi: string | null; initialSemester: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [kode, setKode] = useState(initialKode);
  const [nama, setNama] = useState(initialNama);
  const [deskripsi, setDeskripsi] = useState(initialDeskripsi ?? "");
  const [semester, setSemester] = useState(initialSemester ? String(initialSemester) : "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!kode.trim() || !nama.trim() || !semester) return;
    setSaving(true);
    setError("");
    const res = await editMataKuliah(id, kode.trim(), nama.trim(), deskripsi, Number(semester));
    setSaving(false);
    if (res?.error) { setError(res.error); return; }
    setOpen(false);
  }

  async function handleDelete() {
    if (!confirm(`Hapus mata kuliah "${nama}"? Semua pertemuan, materi, tugas, kuis, dan nilai di dalamnya akan ikut terhapus permanen.`)) return;
    setDeleting(true);
    setError("");
    try {
      const res = await deleteMataKuliah(id);
      if (res?.error) {
        setDeleting(false);
        setError(res.error);
      }
    } catch {
      // redirect on success
    }
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
        className="btn btn-secondary btn-icon"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
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
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#65635d", marginBottom: 4 }}>Semester</label>
                <select value={semester} onChange={e => setSemester(e.target.value)} style={{ ...inputStyle, background: "#fff" }}>
                  <option value="" disabled>Pilih semester</option>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
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
                disabled={saving || deleting || !kode.trim() || !nama.trim() || !semester}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 18px", borderRadius: 8, background: "#2563eb",
                  color: "#fff", border: "none", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                  opacity: saving || deleting || !kode.trim() || !nama.trim() || !semester ? 0.6 : 1
                }}
              >
                {saving && <Spinner light />}
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); setError(""); }}
                disabled={deleting}
                style={{
                  padding: "8px 16px", borderRadius: 8, background: "none",
                  border: "1px solid rgba(0,0,0,.15)", fontSize: 13,
                  cursor: "pointer", fontFamily: "inherit"
                }}
              >
                Batal
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
                disabled={deleting}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  marginLeft: "auto", padding: "8px 16px", borderRadius: 8,
                  background: "#fef2f2", border: "1px solid #fecaca",
                  color: "#b91c1c", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                  opacity: deleting ? 0.6 : 1
                }}
              >
                {deleting && <Spinner />}
                {deleting ? "Menghapus..." : "Hapus MK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
