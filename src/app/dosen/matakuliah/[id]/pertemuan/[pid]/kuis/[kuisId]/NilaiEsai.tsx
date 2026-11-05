"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nilaiEsai } from "@/lib/actions/kuis";
import Spinner from "@/components/Spinner";

type Item = {
  jawabanId: string;
  pertanyaan: string;
  jawabanEsai: string | null;
  nilai: number | null;
};

export default function NilaiEsai({
  attemptId, kuisId, pertemuanId, mkId, items,
}: {
  attemptId: string; kuisId: string; pertemuanId: string; mkId: string; items: Item[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nilaiMap, setNilaiMap] = useState<Record<string, string>>(
    Object.fromEntries(items.map((it) => [it.jawabanId, it.nilai !== null ? String(it.nilai) : ""]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sudahDinilai = items.filter((it) => it.nilai !== null).length;

  async function handleSave() {
    for (const it of items) {
      const raw = nilaiMap[it.jawabanId];
      if (raw === "" || raw === undefined) continue;
      const n = Number(raw);
      if (isNaN(n) || n < 0 || n > 100) {
        setError(`Nilai untuk "${it.pertanyaan.slice(0, 40)}..." harus 0–100`);
        return;
      }
    }
    setSaving(true);
    setError("");
    for (const it of items) {
      const raw = nilaiMap[it.jawabanId];
      if (raw === "" || raw === undefined) continue;
      const res = await nilaiEsai(it.jawabanId, Number(raw), attemptId, kuisId, pertemuanId, mkId);
      if (res?.error) {
        setSaving(false);
        setError(res.error);
        return;
      }
    }
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-medium hover:bg-amber-200"
      >
        Nilai Esai ({sudahDinilai}/{items.length})
      </button>
    );
  }

  return (
    <div style={{
      marginTop: 10, padding: "14px 16px", background: "#fffbeb",
      border: "1px solid #fde68a", borderRadius: 10,
    }}>
      {error && (
        <div style={{ marginBottom: 10, padding: "7px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12, color: "#b91c1c" }}>
          {error}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((it, i) => (
          <div key={it.jawabanId}>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>
              {i + 1}. {it.pertanyaan}
            </p>
            <div style={{
              fontSize: 13, color: "#44403c", background: "#fff", border: "1px solid #eee",
              borderRadius: 7, padding: "8px 10px", marginBottom: 6, whiteSpace: "pre-wrap",
            }}>
              {it.jawabanEsai?.trim() || <span style={{ color: "#aaa", fontStyle: "italic" }}>Tidak dijawab</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label style={{ fontSize: 11, color: "#65635d" }}>Nilai (0–100):</label>
              <input
                type="number"
                min={0}
                max={100}
                value={nilaiMap[it.jawabanId]}
                onChange={(e) => setNilaiMap((m) => ({ ...m, [it.jawabanId]: e.target.value }))}
                style={{
                  width: 64, padding: "4px 8px", borderRadius: 6,
                  border: "1.5px solid #dfdeda", fontSize: 13, fontFamily: "inherit", textAlign: "center",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 7, background: "#2563eb",
            color: "#fff", border: "none", fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.6 : 1,
          }}
        >
          {saving && <Spinner light size={12} />}
          {saving ? "Menyimpan..." : "Simpan Nilai"}
        </button>
        <button
          onClick={() => setOpen(false)}
          style={{
            padding: "6px 14px", borderRadius: 7, background: "none",
            border: "1px solid rgba(0,0,0,.15)", fontSize: 12,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
