"use client";

import { useState } from "react";
import { saveLinkMeeting } from "@/lib/actions/pertemuan";

export default function EditLinkMeeting({
  pertemuanId, mkId, initialLink,
}: {
  pertemuanId: string; mkId: string; initialLink: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState(initialLink ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const res = await saveLinkMeeting(pertemuanId, mkId, link.trim() || null);
    setSaving(false);
    if (res?.error) { setError(res.error); return; }
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 7,
          background: initialLink ? "#e8f5ee" : "#fff",
          border: `1px solid ${initialLink ? "#b0dfc0" : "rgba(0,0,0,.15)"}`,
          fontSize: 12, fontWeight: 500,
          color: initialLink ? "#185B37" : "#65635d",
          cursor: "pointer", fontFamily: "inherit"
        }}
      >
        🎥 {initialLink ? "Edit Link Meeting" : "Tambah Link Meeting"}
      </button>
    );
  }

  return (
    <div style={{
      marginTop: 8, padding: "14px 16px",
      background: "#f9f8f5", borderRadius: 10,
      border: "1.5px solid #185B37"
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", marginBottom: 10 }}>
        Link Zoom / Google Meet
      </div>
      {error && (
        <div style={{ marginBottom: 8, padding: "6px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12, color: "#b91c1c" }}>
          {error}
        </div>
      )}
      <input
        type="url"
        value={link}
        onChange={e => setLink(e.target.value)}
        placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
        autoFocus
        style={{
          width: "100%", padding: "8px 12px", borderRadius: 7,
          border: "1.5px solid #DFDEDA", fontSize: 13,
          fontFamily: "inherit", background: "#fff", display: "block",
          boxSizing: "border-box"
        }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={handleSave} disabled={saving}
          style={{
            padding: "6px 16px", borderRadius: 7, background: "#185B37",
            color: "#fff", border: "none", fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            opacity: saving ? 0.6 : 1
          }}>
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        {initialLink && (
          <button onClick={async () => {
            setSaving(true);
            await saveLinkMeeting(pertemuanId, mkId, null);
            setSaving(false);
            setLink("");
            setOpen(false);
          }} disabled={saving}
            style={{
              padding: "6px 14px", borderRadius: 7, background: "#fef2f2",
              border: "1px solid #fecaca", fontSize: 12, color: "#b91c1c",
              cursor: "pointer", fontFamily: "inherit"
            }}>
            Hapus
          </button>
        )}
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
