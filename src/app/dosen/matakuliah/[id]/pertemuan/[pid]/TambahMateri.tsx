"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addMateri } from "@/lib/actions/pertemuan";

export default function TambahMateri({ pertemuanId }: { pertemuanId: string }) {
  const [open, setOpen] = useState(false);
  const [tipe, setTipe] = useState<"dokumen" | "video">("dokumen");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setUploading(true);

    const form = e.currentTarget;
    const formData = new FormData();
    formData.set("pertemuan_id", pertemuanId);
    formData.set("tipe", tipe);

    if (tipe === "dokumen") {
      const fileInput = form.querySelector<HTMLInputElement>('input[name="file"]');
      const file = fileInput?.files?.[0];
      if (!file) {
        setError("Pilih file terlebih dahulu");
        setUploading(false);
        return;
      }

      const uploadData = new FormData();
      uploadData.set("file", file);
      uploadData.set("bucket", "materi");

      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
        setUploading(false);
        return;
      }

      formData.set("url", result.url);
      formData.set("nama_file", result.nama_file);
    } else {
      const url = (form.querySelector<HTMLInputElement>('input[name="video_url"]'))?.value;
      if (!url) {
        setError("Masukkan URL video");
        setUploading(false);
        return;
      }
      formData.set("url", url);
      formData.set("nama_file", "");
    }

    const result = await addMateri(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      router.refresh();
    }
    setUploading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
      >
        + Tambah Materi
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
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setTipe("dokumen")}
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            tipe === "dokumen" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          Dokumen
        </button>
        <button
          onClick={() => setTipe("video")}
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            tipe === "video" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          Video
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {tipe === "dokumen" ? (
          <input
            name="file"
            type="file"
            accept=".doc,.docx,.pdf"
            className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
        ) : (
          <input
            name="video_url"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        )}
        <div className="flex gap-2 mt-3">
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 disabled:opacity-50"
          >
            {uploading ? "Mengupload..." : "Upload"}
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
