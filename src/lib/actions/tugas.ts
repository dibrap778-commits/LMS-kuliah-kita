"use server";

import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTugas(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const pertemuan_id = formData.get("pertemuan_id") as string;
  const judul = formData.get("judul") as string;
  const deskripsi = formData.get("deskripsi") as string;
  const deadline = formData.get("deadline") as string;

  const supabase = createServerClient();

  const { error } = await supabase.from("tugas").insert({
    pertemuan_id,
    judul,
    deskripsi,
    deadline,
  });

  if (error) return { error: "Gagal membuat tugas" };

  return { success: true };
}

export async function submitTugas(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "mahasiswa") return { error: "Unauthorized" };

  const tugas_id = formData.get("tugas_id") as string;
  const file_url = formData.get("file_url") as string;
  const nama_file = formData.get("nama_file") as string;
  const mk_id = formData.get("mk_id") as string;
  const pertemuan_id = formData.get("pertemuan_id") as string;

  const supabase = createServerClient();

  const { error } = await supabase.from("submission").upsert(
    {
      tugas_id,
      mahasiswa_id: session.id,
      file_url,
      nama_file,
      waktu_submit: new Date().toISOString(),
    },
    { onConflict: "tugas_id,mahasiswa_id" }
  );

  if (error) return { error: "Gagal mengirim tugas" };

  revalidatePath(`/mahasiswa/matakuliah/${mk_id}/pertemuan/${pertemuan_id}`);
  return { success: true };
}
