"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleKuis } from "@/lib/actions/kuis";
import Spinner from "@/components/Spinner";

export default function KuisToggle({
  kuisId,
  pertemuanId,
  mkId,
  initialBuka,
}: {
  kuisId: string;
  pertemuanId: string;
  mkId: string;
  initialBuka: boolean;
}) {
  const [buka, setBuka] = useState(initialBuka);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const result = await toggleKuis(kuisId, pertemuanId, mkId, !buka);
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
      className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 flex-shrink-0 ${
        buka
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {loading && <Spinner size={11} />}
      {buka ? "Terbuka" : "Terkunci"}
    </button>
  );
}
