import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/pricing", "/features", "/contact", "/auth/login", "/auth/register"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // Auth routes
  const isAuthRoute = pathname.startsWith("/auth/")
  const isAppRoute = pathname.startsWith("/app/")

  // Allow public routes
  if (isPublicRoute && !isAuthRoute) {
    return NextResponse.next()
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/app", request.url))
  }

  // Protect app routes
  if (isAppRoute && !token) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check clinic access for clinic routes
  if (pathname.startsWith("/app/clinic/") && token) {
    const clinicIdMatch = pathname.match(/\/app\/clinic\/([^/]+)/)
    if (clinicIdMatch) {
      const clinicId = clinicIdMatch[1]
      // Note: Full clinic membership check happens in the route handler
      // Middleware only checks authentication
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

