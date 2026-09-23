"use client";

import { useState } from "react";
import Link from "next/link";
import { createMataKuliah } from "@/lib/actions/matakuliah";

export default function BuatMataKuliah() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    try {
      const result = await createMataKuliah(formData);
      if (result?.error) setError(result.error);
    } catch {
      // redirect on success
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <Link href="/dosen" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        &larr; Kembali
      </Link>
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        Tambah Mata Kuliah
      </h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kode MK
            </label>
            <input
              name="kode"
              type="text"
              required
              placeholder="IF101"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Mata Kuliah
            </label>
            <input
              name="nama"
              type="text"
              required
              placeholder="Pemrograman Web"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="deskripsi"
              rows={3}
              placeholder="Deskripsi singkat mata kuliah..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-700 text-white font-medium rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </div>
    </div>
  );
}
