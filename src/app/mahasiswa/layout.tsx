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
    <div style={{ minHeight: "100vh", background: "var(--page-gradient)" }}>
      <Navbar nama={session.nama} role="mahasiswa" />
      <main className="mx-auto w-full" style={{ maxWidth: 1160, padding: "48px 32px 80px" }}>{children}</main>
    </div>
  );
}
