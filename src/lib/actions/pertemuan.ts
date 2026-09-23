"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function createPertemuan(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const mk_id = formData.get("mk_id") as string;
  const judul = formData.get("judul") as string;
  const tanggal = formData.get("tanggal") as string;
  const deskripsi = formData.get("deskripsi") as string;

  const supabase = createServerClient();

  const { error } = await supabase.from("pertemuan").insert({
    mk_id,
    judul,
    tanggal,
    deskripsi,
  });

  if (error) return { error: "Gagal membuat pertemuan" };

  redirect(`/dosen/matakuliah/${mk_id}`);
}

export async function toggleAbsensi(pertemuanId: string, buka: boolean) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const supabase = createServerClient();
  await supabase
    .from("pertemuan")
    .update({ absensi_buka: buka })
    .eq("id", pertemuanId);

  return { success: true };
}

export async function addMateri(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const pertemuan_id = formData.get("pertemuan_id") as string;
  const tipe = formData.get("tipe") as string;
  const url = formData.get("url") as string;
  const nama_file = formData.get("nama_file") as string;

  const supabase = createServerClient();

  const { error } = await supabase.from("materi").insert({
    pertemuan_id,
    tipe,
    url,
    nama_file: nama_file || null,
  });

  if (error) return { error: "Gagal menambah materi" };

  return { success: true };
}

export async function deleteMateri(id: string) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const supabase = createServerClient();
  await supabase.from("materi").delete().eq("id", id);
  return { success: true };
}
