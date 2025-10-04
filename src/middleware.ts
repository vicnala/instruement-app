import createMiddleware from "next-intl/middleware";
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized/desired pathnames
  // matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
  matcher: '/((?!api|_next/static|_next/image|_vercel|favicon.ico|.*\\..*).*)',
};