"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTugas } from "@/lib/actions/tugas";

export default function TambahTugas({ pertemuanId }: { pertemuanId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    const result = await createTugas(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
      >
        + Buat Tugas
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
      <form action={handleSubmit} className="space-y-3">
        <input type="hidden" name="pertemuan_id" value={pertemuanId} />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Judul Tugas</label>
          <input
            name="judul"
            required
            placeholder="Tugas 1 - Membuat halaman HTML"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi</label>
          <textarea
            name="deskripsi"
            rows={2}
            placeholder="Instruksi tugas..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Deadline</label>
          <input
            name="deadline"
            type="datetime-local"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
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
