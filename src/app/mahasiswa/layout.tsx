import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function MahasiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "mahasiswa") redirect("/login");

  return (
    <>
      <Navbar nama={session.nama} role="mahasiswa" />
      <main className="max-w-5xl mx-auto px-4 py-6 w-full">{children}</main>
    </>
  );
}
