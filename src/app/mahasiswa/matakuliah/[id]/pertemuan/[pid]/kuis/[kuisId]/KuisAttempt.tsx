"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { submitAttempt } from "@/lib/actions/kuis";

type Soal = {
  id: string; urutan: number; pertanyaan: string;
  pilihan_a: string; pilihan_b: string; pilihan_c: string; pilihan_d: string;
};

export default function KuisAttempt({
  attemptId, deadlineIso, soalList,
}: {
  attemptId: string; deadlineIso: string; soalList: Soal[];
}) {
  const router = useRouter();
  const deadline = useMemo(() => new Date(deadlineIso).getTime(), [deadlineIso]);
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()));
  const [jawaban, setJawaban] = useState<Record<string, "a" | "b" | "c" | "d">>({});
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  async function handleSubmit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    const payload = soalList.map((s) => ({ soal_id: s.id, jawaban_dipilih: jawaban[s.id] ?? null }));
    await submitAttempt(attemptId, payload);
    router.refresh();
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, deadline - Date.now());
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        handleSubmit();
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isLow = remaining < 60000;
  const dijawab = Object.keys(jawaban).length;

  return (
    <div>
      <div
        style={{
          position: "sticky", top: 0, background: "#F9F8F5", padding: "10px 0",
          zIndex: 10, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <span className="text-sm text-gray-500">{dijawab}/{soalList.length} terjawab</span>
        <span
          style={{
            fontSize: 18, fontWeight: 700, fontFamily: "monospace",
            padding: "4px 14px", borderRadius: 8,
            background: isLow ? "#fef2f2" : "#eafaf1",
            color: isLow ? "#b91c1c" : "#177a4d",
          }}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>

      <div className="space-y-4">
        {soalList.map((s, i) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-900 mb-3">{i + 1}. {s.pertanyaan}</p>
            <div className="space-y-2">
              {(["a", "b", "c", "d"] as const).map((opt) => (
                <label
                  key={opt}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer",
                    padding: "8px 12px", borderRadius: 8,
                    border: jawaban[s.id] === opt ? "1.5px solid #185B37" : "1px solid rgba(0,0,0,.12)",
                    background: jawaban[s.id] === opt ? "#eafaf1" : "#fff",
                  }}
                >
                  <input
                    type="radio"
                    name={`soal-${s.id}`}
                    checked={jawaban[s.id] === opt}
                    onChange={() => setJawaban((prev) => ({ ...prev, [s.id]: opt }))}
                    style={{ accentColor: "#185B37" }}
                  />
                  <span style={{ textTransform: "uppercase", fontWeight: 600, color: "#65635d", width: 16 }}>
                    {opt}
                  </span>
                  <span>{s[`pilihan_${opt}` as keyof Soal]}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: "100%", marginTop: 20, padding: 14, borderRadius: 10,
          background: "#185B37", color: "#fff", border: "none",
          fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
          opacity: submitting ? 0.6 : 1,
        }}
      >
        {submitting ? "Mengirim..." : "Selesai & Kirim Jawaban"}
      </button>
    </div>
  );
}
