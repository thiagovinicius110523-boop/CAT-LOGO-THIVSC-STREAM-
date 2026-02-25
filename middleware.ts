import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const url = req.nextUrl;
  const pathname = url.pathname;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/no-access") ||
    pathname.startsWith("/reset-password"); // importante pro reset
  const isApi = pathname.startsWith("/api");
  const isPublic =
    isAuthRoute ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/favicon.ico");

  if (!user && !isPublic) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && !isAuthRoute && !isApi) {
    const { data: allowed } = await supabase.rpc("is_whitelisted_uid", { p_uid: user.id });
    if (!allowed) {
      url.pathname = "/no-access";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};