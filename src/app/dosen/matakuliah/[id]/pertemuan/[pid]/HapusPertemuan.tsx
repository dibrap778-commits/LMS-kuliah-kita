"use client";

import { useState } from "react";
import { deletePertemuan } from "@/lib/actions/pertemuan";

export default function HapusPertemuan({
  pertemuanId,
  mkId,
  judul,
}: {
  pertemuanId: string;
  mkId: string;
  judul: string;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleHapus() {
    if (!confirm(`Hapus pertemuan "${judul}"? Materi, tugas, kuis, dan absensi di dalamnya akan ikut terhapus permanen.`)) return;
    setDeleting(true);
    try {
      const res = await deletePertemuan(pertemuanId, mkId);
      if (res?.error) {
        setDeleting(false);
        alert(res.error);
      }
    } catch {
      // redirect on success
    }
  }

  return (
    <button onClick={handleHapus} disabled={deleting} className="btn btn-secondary" style={{ color: "#b91c1c", borderColor: "#fecaca" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
      </svg>
      {deleting ? "Menghapus..." : "Hapus Pertemuan"}
    </button>
  );
}
