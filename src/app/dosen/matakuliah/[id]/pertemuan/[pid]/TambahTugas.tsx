"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTugas } from "@/lib/actions/tugas";

export default function TambahTugas({ pertemuanId }: { pertemuanId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData();
    formData.set("pertemuan_id", pertemuanId);
    formData.set("judul", (form.querySelector<HTMLInputElement>('[name="judul"]'))?.value || "");
    formData.set("deskripsi", (form.querySelector<HTMLTextAreaElement>('[name="deskripsi"]'))?.value || "");
    formData.set("deadline", (form.querySelector<HTMLInputElement>('[name="deadline"]'))?.value || "");

    const fileInput = form.querySelector<HTMLInputElement>('[name="soal_file"]');
    const file = fileInput?.files?.[0];
    if (file) {
      const uploadData = new FormData();
      uploadData.set("file", file);
      uploadData.set("bucket", "materi");
      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      formData.set("soal_url", result.url);
      formData.set("soal_nama_file", result.nama_file);
    }

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
      <form onSubmit={handleSubmit} className="space-y-3">
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
          <label className="block text-xs font-medium text-gray-600 mb-1">
            File Soal <span className="text-gray-400 font-normal">(opsional, PDF/Word)</span>
          </label>
          <input
            name="soal_file"
            type="file"
            accept=".pdf,.doc,.docx"
            className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
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
