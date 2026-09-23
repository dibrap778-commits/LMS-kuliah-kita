"use server";

import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function isiAbsensi(pertemuanId: string) {
  const session = await getSession();
  if (!session || session.role !== "mahasiswa") return { error: "Unauthorized" };

  const supabase = createServerClient();

  const { data: pertemuan } = await supabase
    .from("pertemuan")
    .select("absensi_buka")
    .eq("id", pertemuanId)
    .single();

  if (!pertemuan?.absensi_buka) return { error: "Absensi belum dibuka" };

  const { error } = await supabase.from("absensi").insert({
    pertemuan_id: pertemuanId,
    mahasiswa_id: session.id,
  });

  if (error) {
    if (error.code === "23505") return { error: "Anda sudah absen" };
    return { error: "Gagal mengisi absensi" };
  }

  return { success: true };
}
