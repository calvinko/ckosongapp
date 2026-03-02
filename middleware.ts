import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { KILLED_CITIES, WHITELIST_COUNTRIES } from './lib/constants';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  let country = request?.geo?.country;
  const city = request?.geo?.city;
  const region = request?.geo?.region;
  const ip = request?.ip

  let lowerCaseCity = city ? city?.toLowerCase() : null;

  if (process.env.NODE_ENV == "development") {
    country = "US";
    lowerCaseCity = "san jose"
  }

  console.log(`Visitor. country=${country} city=${lowerCaseCity} region=${region} pathName=${url?.pathname} ipAddress=${ip}`)

  url.searchParams.set('country', country)
  url.searchParams.set('city', lowerCaseCity)
  url.searchParams.set('region', region)

  if (url.pathname === "/signIn") {
    return NextResponse.rewrite(url);
  }

  // if (KILLED_CITIES.includes(lowerCaseCity)) {
  //   console.log(`Redirecting user in killed city. country=${country} city=${city} pathName=${url?.pathname} ip=${ip}`)
  //   return NextResponse.redirect(new URL('/access', request.url))
  // }

  // if (!WHITELIST_COUNTRIES.includes(country ?? "") || !request?.geo) {
  //   console.log(`Redirecting user in killed country. country=${country} city=${city} pathName=${url?.pathname} ip=${ip}`)
  //   return NextResponse.redirect(new URL('/signIn?error=true', request.url))
  // }

  // if (url.pathname === '/register') {
  //   return NextResponse.redirect(new URL('/signIn', request.url));
  // }

  return NextResponse.rewrite(url)
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\..*|favicon.ico|favicon|access).*)',
  ]
}