import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function DosenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "dosen") redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <Navbar nama={session.nama} role="dosen" />
      <main className="mx-auto w-full" style={{ maxWidth: 1160, padding: "48px 32px 80px" }}>{children}</main>
    </div>
  );
}
