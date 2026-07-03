import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Server-side guard for /admin/* routes.
 *
 * Edge middleware cannot call FastAPI to verify the JWT, so this is a
 * presence-only check on the `optionsaji_jwt` HttpOnly cookie that the backend
 * sets alongside the JSON token on login. The existing client-side `useAuth`
 * admin role check is unchanged and remains the authoritative gate; this just
 * prevents unauthenticated visitors from receiving the admin HTML shell.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("optionsaji_jwt")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
