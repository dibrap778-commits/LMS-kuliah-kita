"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createKuis } from "@/lib/actions/kuis";

export default function TambahKuis({
  pertemuanId,
  mkId,
}: {
  pertemuanId: string;
  mkId: string;
}) {
  const [open, setOpen] = useState(false);
  const [judul, setJudul] = useState("");
  const [durasi, setDurasi] = useState("30");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!judul.trim() || !durasi) return;
    setLoading(true);
    setError("");
    const res = await createKuis(pertemuanId, mkId, judul.trim(), Number(durasi));
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    if (res.id) {
      router.push(`/dosen/matakuliah/${mkId}/pertemuan/${pertemuanId}/kuis/${res.id}`);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
      >
        + Buat Kuis
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Judul Kuis</label>
          <input
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            required
            placeholder="Kuis 1 - Dasar Manajemen Keuangan"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Durasi (menit)</label>
          <input
            type="number"
            min={1}
            value={durasi}
            onChange={(e) => setDurasi(e.target.value)}
            required
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <p className="text-xs text-gray-400">
          Setelah dibuat, Anda akan diarahkan untuk menambahkan soal.
        </p>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Lanjut Tambah Soal"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
