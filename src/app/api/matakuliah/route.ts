import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("mata_kuliah")
    .select("id, kode, nama")
    .order("nama");

  return NextResponse.json(data || []);
}
