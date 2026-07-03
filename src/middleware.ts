import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login"];
const AUTH_COOKIE = "palmlearn-auth";

const ROLE_ROUTES: Record<string, string> = {
  admin: "/admin",
  trainer: "/trainer",
  learner: "/learner",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/file.svg") ||
    pathname.startsWith("/globe.svg") ||
    pathname.startsWith("/next.svg") ||
    pathname.startsWith("/vercel.svg") ||
    pathname.startsWith("/window.svg")
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(AUTH_COOKIE);
  if (!authCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let userData: { role: string } | null = null;
  try {
    userData = JSON.parse(atob(authCookie.value));
  } catch {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!userData || !userData.role) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based route access
  for (const [role, prefix] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      if (userData.role !== role) {
        // Redirect to the user's own dashboard
        const homeUrl = new URL(ROLE_ROUTES[userData.role] || "/login", request.url);
        return NextResponse.redirect(homeUrl);
      }
      break;
    }
  }

  // Allow /dashboard for any authenticated user
  if (pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|file.svg|globe.svg|next.svg|vercel.svg|window.svg).*)",
  ],
};
