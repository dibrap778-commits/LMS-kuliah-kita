"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { submitAttempt } from "@/lib/actions/kuis";
import Spinner from "@/components/Spinner";

const MAX_PELANGGARAN = 3;

type Soal = {
  id: string; urutan: number; tipe: "pilihan_ganda" | "esai"; pertanyaan: string;
  pilihan_a: string | null; pilihan_b: string | null; pilihan_c: string | null; pilihan_d: string | null;
};

export default function KuisAttempt({
  attemptId, deadlineIso, soalList,
}: {
  attemptId: string; deadlineIso: string; soalList: Soal[];
}) {
  const router = useRouter();
  const deadline = useMemo(() => new Date(deadlineIso).getTime(), [deadlineIso]);
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()));
  const [jawaban, setJawaban] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [pelanggaran, setPelanggaran] = useState(0);
  const [peringatan, setPeringatan] = useState("");
  const submittedRef = useRef(false);
  const pelanggaranRef = useRef(0);
  const jawabanRef = useRef(jawaban);
  jawabanRef.current = jawaban;

  async function handleSubmit(finalPelanggaran?: number) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    const payload = soalList.map((s) => {
      const nilai = jawabanRef.current[s.id];
      return s.tipe === "esai"
        ? { soal_id: s.id, jawaban_dipilih: null, jawaban_esai: nilai ?? null }
        : { soal_id: s.id, jawaban_dipilih: nilai ?? null, jawaban_esai: null };
    });
    await submitAttempt(attemptId, payload, finalPelanggaran ?? pelanggaranRef.current);
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

  useEffect(() => {
    function onVisibilityChange() {
      if (!document.hidden || submittedRef.current) return;
      pelanggaranRef.current += 1;
      const count = pelanggaranRef.current;
      setPelanggaran(count);
      if (count >= MAX_PELANGGARAN) {
        setPeringatan(`Kuis otomatis dikirim karena Anda keluar dari tab sebanyak ${count}x.`);
        handleSubmit(count);
      } else {
        setPeringatan(`Pelanggaran terdeteksi: Anda keluar dari tab kuis (${count}/${MAX_PELANGGARAN}). Kuis akan otomatis dikirim kalau mencapai ${MAX_PELANGGARAN}x.`);
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isLow = remaining < 60000;
  const dijawab = Object.values(jawaban).filter((v) => v && v.trim() !== "").length;
  const adaEsai = soalList.some((s) => s.tipe === "esai");

  return (
    <div>
      <div
        style={{
          position: "sticky", top: 0, background: "#eff6ff", padding: "10px 0",
          zIndex: 10, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="text-sm text-gray-500">{dijawab}/{soalList.length} terjawab</span>
          <span
            title="Jumlah kali Anda terdeteksi keluar dari tab kuis ini"
            style={{
              fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
              background: pelanggaran > 0 ? "#fef2f2" : "#f1f5f9",
              color: pelanggaran > 0 ? "#b91c1c" : "#64748b",
            }}
          >
            Pelanggaran: {pelanggaran}/{MAX_PELANGGARAN}
          </span>
        </div>
        <span
          style={{
            fontSize: 18, fontWeight: 700, fontFamily: "monospace",
            padding: "4px 14px", borderRadius: 8,
            background: isLow ? "#fef2f2" : "#fff",
            color: isLow ? "#b91c1c" : "#1e40af",
          }}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>

      {peringatan && (
        <div
          role="alert"
          style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            marginBottom: 16, padding: "12px 16px", borderRadius: 10,
            background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13.5,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" />
          </svg>
          <span>{peringatan}</span>
        </div>
      )}

      <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 16 }}>
        Jangan berpindah tab atau aplikasi lain selama mengerjakan — sistem mendeteksi dan mencatatnya sebagai pelanggaran.
        {adaEsai && " Soal esai dinilai manual oleh dosen setelah Anda mengumpulkan."}
      </p>

      <div className="space-y-4">
        {soalList.map((s, i) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start gap-2 mb-3">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${
                s.tipe === "esai" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
              }`}>
                {s.tipe === "esai" ? "ESAI" : "PG"}
              </span>
              <p className="text-sm font-medium text-gray-900">{i + 1}. {s.pertanyaan}</p>
            </div>
            {s.tipe === "esai" ? (
              <textarea
                value={jawaban[s.id] ?? ""}
                onChange={(e) => setJawaban((prev) => ({ ...prev, [s.id]: e.target.value }))}
                placeholder="Tulis jawaban Anda di sini..."
                rows={4}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1.5px solid rgba(0,0,0,.12)", fontSize: 14, fontFamily: "inherit",
                  resize: "vertical", boxSizing: "border-box",
                }}
              />
            ) : (
              <div className="space-y-2">
                {(["a", "b", "c", "d"] as const).map((opt) => (
                  <label
                    key={opt}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer",
                      padding: "8px 12px", borderRadius: 8,
                      border: jawaban[s.id] === opt ? "1.5px solid #2563eb" : "1px solid rgba(0,0,0,.12)",
                      background: jawaban[s.id] === opt ? "#eff6ff" : "#fff",
                    }}
                  >
                    <input
                      type="radio"
                      name={`soal-${s.id}`}
                      checked={jawaban[s.id] === opt}
                      onChange={() => setJawaban((prev) => ({ ...prev, [s.id]: opt }))}
                      style={{ accentColor: "#2563eb" }}
                    />
                    <span style={{ textTransform: "uppercase", fontWeight: 600, color: "#65635d", width: 16 }}>
                      {opt}
                    </span>
                    <span>{s[`pilihan_${opt}` as "pilihan_a" | "pilihan_b" | "pilihan_c" | "pilihan_d"]}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => handleSubmit()}
        disabled={submitting}
        style={{
          width: "100%", marginTop: 20, padding: 14, borderRadius: 10,
          background: "#2563eb", color: "#fff", border: "none",
          fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
          opacity: submitting ? 0.6 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}
      >
        {submitting && <Spinner light />}
        {submitting ? "Mengirim..." : "Selesai & Kirim Jawaban"}
      </button>
    </div>
  );
}
