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
    <>
      <Navbar nama={session.nama} role="dosen" />
      <main className="max-w-5xl mx-auto px-4 py-6 w-full">{children}</main>
    </>
  );
}
