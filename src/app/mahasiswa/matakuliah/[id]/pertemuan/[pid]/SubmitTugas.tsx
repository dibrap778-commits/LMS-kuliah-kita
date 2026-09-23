"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitTugas } from "@/lib/actions/tugas";

export default function SubmitTugas({
  tugasId,
  mkId,
  pertemuanId,
}: {
  tugasId: string;
  mkId: string;
  pertemuanId: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setUploading(true);

    const form = e.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];

    if (!file) {
      setError("Pilih file terlebih dahulu");
      setUploading(false);
      return;
    }

    const uploadData = new FormData();
    uploadData.set("file", file);
    uploadData.set("bucket", "tugas");

    const res = await fetch("/api/upload", { method: "POST", body: uploadData });
    const uploadResult = await res.json();

    if (uploadResult.error) {
      setError(uploadResult.error);
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.set("tugas_id", tugasId);
    formData.set("file_url", uploadResult.url);
    formData.set("nama_file", uploadResult.nama_file);
    formData.set("mk_id", mkId);
    formData.set("pertemuan_id", pertemuanId);

    const result = await submitTugas(formData);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
    setUploading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-2 text-sm text-red-700 bg-red-50 rounded px-3 py-2">
          {error}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept=".doc,.docx,.pdf,.zip,.rar,.txt"
          className="flex-1 text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
        />
        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 disabled:opacity-50 shrink-0"
        >
          {uploading ? "Mengirim..." : "Kirim"}
        </button>
      </div>
    </form>
  );
}
