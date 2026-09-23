import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const path = request.nextUrl.pathname;

  if (path.startsWith("/dosen") || path.startsWith("/mahasiswa")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;

      if (path.startsWith("/dosen") && role !== "dosen") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      if (path.startsWith("/mahasiswa") && role !== "mahasiswa") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if ((path === "/login" || path === "/register") && token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;
      const dest = role === "dosen" ? "/dosen" : "/mahasiswa";
      return NextResponse.redirect(new URL(dest, request.url));
    } catch {
      // invalid token, let them proceed to login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dosen/:path*", "/mahasiswa/:path*", "/login", "/register"],
};
