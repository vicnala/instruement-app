import createMiddleware from "next-intl/middleware";
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized/desired pathnames
  matcher: ['/', '/(en|es|ar)/:path*', '/instrument/:path*']
};