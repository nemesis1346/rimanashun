import type { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth0";

// Serves the SDK's /auth/* routes and keeps sessions fresh. It doesn't require
// a login: every page stays open to logged-out visitors.
export async function middleware(request: NextRequest) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|sounds|favicon.ico|sitemap.xml|robots.txt).*)"],
};
