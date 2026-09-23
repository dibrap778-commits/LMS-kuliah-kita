"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isiAbsensi } from "@/lib/actions/absensi";

export default function AbsenButton({ pertemuanId }: { pertemuanId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleAbsen() {
    setLoading(true);
    setError("");
    const result = await isiAbsensi(pertemuanId);
    if (result.error) {
      setError(result.error);
    } else {
      setDone(true);
      router.refresh();
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Absensi berhasil dicatat!
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-2 text-sm text-red-700 bg-red-50 rounded-lg px-4 py-2">
          {error}
        </div>
      )}
      <button
        onClick={handleAbsen}
        disabled={loading}
        className="w-full py-3 bg-emerald-700 text-white font-medium rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50 text-sm"
      >
        {loading ? "Memproses..." : "Hadir"}
      </button>
    </div>
  );
}
