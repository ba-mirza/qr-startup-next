import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { refreshSession } from "@/shared/api/supabase/proxy";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED = ["/dashboard", "/onboarding"];
const AUTH_ONLY_FOR_GUESTS = ["/login", "/register"];

const splitLocale = (pathname: string) => {
  const [, first, ...rest] = pathname.split("/");
  const hasPrefix = (routing.locales as readonly string[]).includes(first);
  return hasPrefix
    ? { prefix: `/${first}`, path: `/${rest.join("/")}` }
    : { prefix: "", path: pathname };
};

const matches = (path: string, prefixes: string[]) =>
  prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

// Оптимистичная проверка для редиректов. Права на данные проверяет RLS.
export const proxy = async (request: NextRequest) => {
  const response = intlMiddleware(request);
  const user = await refreshSession(request, response);
  const { prefix, path } = splitLocale(request.nextUrl.pathname);

  const redirectTo = (target: string) => {
    const url = request.nextUrl.clone();
    url.pathname = `${prefix}${target}`;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (!user && matches(path, PROTECTED)) return redirectTo("/login");
  if (user && matches(path, AUTH_ONLY_FOR_GUESTS)) return redirectTo("/dashboard");

  return response;
};

export const config = {
  matcher: ["/((?!api|auth|q|_next|_vercel|.*\\..*).*)"],
};
