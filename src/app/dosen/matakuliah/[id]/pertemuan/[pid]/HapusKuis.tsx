"use client";

import { deleteKuis } from "@/lib/actions/kuis";

export default function HapusKuis({
  kuisId,
  pertemuanId,
  mkId,
}: {
  kuisId: string;
  pertemuanId: string;
  mkId: string;
}) {
  async function handleHapus() {
    if (!confirm("Hapus kuis ini? Semua soal dan hasil pengerjaan mahasiswa akan ikut terhapus.")) return;
    await deleteKuis(kuisId, pertemuanId, mkId);
  }

  return (
    <button
      onClick={handleHapus}
      className="text-xs text-red-500 hover:text-red-700 hover:underline flex-shrink-0"
    >
      Hapus
    </button>
  );
}
