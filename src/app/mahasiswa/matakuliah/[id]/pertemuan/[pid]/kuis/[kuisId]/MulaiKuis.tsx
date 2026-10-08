"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startAttempt } from "@/lib/actions/kuis";

export default function MulaiKuis({ kuisId }: { kuisId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleStart() {
    setLoading(true);
    setError("");
    const res = await startAttempt(kuisId);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
      <button
        onClick={handleStart}
        disabled={loading}
        style={{
          padding: "10px 28px", borderRadius: 10, background: "#185B37",
          color: "#fff", border: "none", fontSize: 14, fontWeight: 700,
          fontFamily: "inherit", cursor: "pointer", opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Memulai..." : "Mulai Kuis"}
      </button>
    </div>
  );
}
