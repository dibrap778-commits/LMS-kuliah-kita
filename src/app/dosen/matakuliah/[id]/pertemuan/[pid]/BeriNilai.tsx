"use client";

import { useState } from "react";
import { saveNilaiSubmission } from "@/lib/actions/nilai";

export default function BeriNilai({
  submissionId,
  mkId,
  pertemuanId,
  initialNilai,
  initialFeedback,
}: {
  submissionId: string;
  mkId: string;
  pertemuanId: string;
  initialNilai: number | null;
  initialFeedback: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [nilai, setNilai] = useState(initialNilai?.toString() ?? "");
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [saving, setSaving] = useState(false);
  const [currentNilai, setCurrentNilai] = useState(initialNilai);

  async function handleSave() {
    const n = Number(nilai);
    if (isNaN(n) || n < 0 || n > 100) return;
    setSaving(true);
    await saveNilaiSubmission(submissionId, n, feedback, pertemuanId, mkId);
    setSaving(false);
    setCurrentNilai(n);
    setOpen(false);
  }

  if (!open) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {currentNilai !== null && (
          <span style={{
            fontSize: 12, fontWeight: 700, color: currentNilai >= 60 ? "#177a4d" : "#c23b3b",
            background: currentNilai >= 60 ? "#dcf2e4" : "#fee2e2",
            padding: "2px 8px", borderRadius: 999
          }}>
            {currentNilai}
          </span>
        )}
        <button
          onClick={() => setOpen(true)}
          style={{
            fontSize: 12, color: "#185B37", border: "1px solid #185B37",
            borderRadius: 6, padding: "2px 10px", background: "none",
            cursor: "pointer", fontFamily: "inherit", fontWeight: 600
          }}
        >
          {currentNilai !== null ? "Edit Nilai" : "Beri Penilaian"}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      marginTop: 8, padding: "14px 16px", background: "#f9f8f5",
      borderRadius: 10, border: "1px solid rgba(0,0,0,.1)"
    }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#65635d", display: "block", marginBottom: 4 }}>
            Nilai (0–100)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={nilai}
            onChange={(e) => setNilai(e.target.value)}
            autoFocus
            style={{
              width: 80, padding: "7px 10px", borderRadius: 7,
              border: "1.5px solid #dfdeda", fontSize: 15,
              fontFamily: "inherit", textAlign: "center"
            }}
          />
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "#65635d", display: "block", marginBottom: 4 }}>
          Catatan / Feedback (opsional)
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tuliskan catatan atau koreksi untuk mahasiswa..."
          rows={2}
          style={{
            width: "100%", padding: "7px 10px", borderRadius: 7,
            border: "1.5px solid #dfdeda", fontSize: 13,
            fontFamily: "inherit", resize: "vertical", display: "block"
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleSave}
          disabled={saving || nilai === ""}
          style={{
            padding: "6px 16px", borderRadius: 7, background: "#185B37",
            color: "#fff", border: "none", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", opacity: saving || nilai === "" ? 0.6 : 1
          }}
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          onClick={() => setOpen(false)}
          style={{
            padding: "6px 14px", borderRadius: 7, background: "none",
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
