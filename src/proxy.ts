import { NextRequest, NextResponse } from "next/server";
import { securityHeaders } from "@/lib/security-headers";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/artikel/")) {
    const authToken = request.cookies.get("auth-token")?.value;
    if (!authToken && request.nextUrl.searchParams.has("premium")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  for (const header of securityHeaders()) {
    response.headers.set(header.key, header.value);
  }
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
