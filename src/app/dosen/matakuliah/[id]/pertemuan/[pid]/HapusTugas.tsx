"use client";

import { deleteTugas } from "@/lib/actions/tugas";

export default function HapusTugas({
  tugasId,
  pertemuanId,
  mkId,
}: {
  tugasId: string;
  pertemuanId: string;
  mkId: string;
}) {
  async function handleHapus() {
    if (!confirm("Hapus tugas ini? Semua submission akan ikut terhapus.")) return;
    await deleteTugas(tugasId, pertemuanId, mkId);
  }

  return (
    <button
      onClick={handleHapus}
      className="text-xs text-red-500 hover:text-red-700 hover:underline"
    >
      Hapus
    </button>
  );
}
