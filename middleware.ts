import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) =>
          res.cookies.set({ name, value, ...options }),
        remove: (name: string, options: CookieOptions) =>
          res.cookies.set({ name, value: "", ...options, maxAge: 0 }),
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = req.nextUrl;
  const isAuthRoute = url.pathname.startsWith("/login") || url.pathname.startsWith("/no-access");
  const isApi = url.pathname.startsWith("/api");
  const isPublic = isAuthRoute || url.pathname.startsWith("/api/health") || url.pathname.startsWith("/favicon.ico");

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

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };