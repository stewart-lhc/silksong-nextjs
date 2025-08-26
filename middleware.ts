import { NextRequest, NextResponse } from 'next/server';
import { i18nConfig, isValidLocale, type Locale } from '@/i18n/config';

export function middleware(request: NextRequest) {
  // Get the pathname from the request URL
  const pathname = request.nextUrl.pathname;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18nConfig.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Skip middleware for static assets, API routes, and special Next.js routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/sw.js') ||
    pathname.includes('/og/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Get locale from Accept-Language header or use default
    let locale: Locale = i18nConfig.defaultLocale;

    // Try to detect locale from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      // Parse the Accept-Language header
      const preferredLocales = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim().toLowerCase())
        .map(lang => lang.split('-')[0]); // Get just the language part (e.g., 'en' from 'en-US')

      // Find the first supported locale
      const supportedLocale = preferredLocales.find(lang => 
        i18nConfig.locales.includes(lang as any)
      );

      if (supportedLocale && isValidLocale(supportedLocale)) {
        locale = supportedLocale;
      }
    }

    // Check for saved locale in cookie
    const savedLocale = request.cookies.get('silksong-locale')?.value;
    if (savedLocale && isValidLocale(savedLocale)) {
      locale = savedLocale;
    }

    // Redirect to localized path
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    const response = NextResponse.redirect(newUrl);
    
    // Set locale cookie for future requests
    response.cookies.set('silksong-locale', locale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: false, // Allow client-side access for language switcher
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  }

  // If the pathname has a locale, ensure it's valid
  const localeInPath = pathname.split('/')[1];
  if (!isValidLocale(localeInPath)) {
    // Invalid locale, redirect to default locale
    const newUrl = new URL(
      pathname.replace(`/${localeInPath}`, `/${i18nConfig.defaultLocale}`),
      request.url
    );
    return NextResponse.redirect(newUrl);
  }

  // Update locale cookie if different from current
  const currentLocale = request.cookies.get('silksong-locale')?.value;
  if (currentLocale !== localeInPath) {
    const response = NextResponse.next();
    response.cookies.set('silksong-locale', localeInPath, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except those starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|sw.js|.*\\.).*)',
  ],
};