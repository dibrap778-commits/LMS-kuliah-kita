"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleAbsensi } from "@/lib/actions/pertemuan";
import Spinner from "@/components/Spinner";

export default function AbsensiToggle({
  pertemuanId,
  initialBuka,
}: {
  pertemuanId: string;
  initialBuka: boolean;
}) {
  const [buka, setBuka] = useState(initialBuka);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    const result = await toggleAbsensi(pertemuanId, !buka);
    if (result.success) {
      setBuka(!buka);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors disabled:opacity-50 inline-flex items-center gap-2 ${
        buka
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-green-100 text-green-700 hover:bg-green-200"
      }`}
    >
      {loading && <Spinner size={12} />}
      {buka ? "Tutup Absensi" : "Buka Absensi"}
    </button>
  );
}
