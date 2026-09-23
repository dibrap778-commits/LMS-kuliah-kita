"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar({
  nama,
  role,
}: {
  nama: string;
  role: "dosen" | "mahasiswa";
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={role === "dosen" ? "/dosen" : "/mahasiswa"} className="flex items-center gap-2">
          <span className="text-lg font-bold text-emerald-700">Kuliah Kita</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {nama}
            <span className="ml-1.5 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              {role}
            </span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Keluar
          </button>
        </div>
      </div>
    </nav>
  );
}
