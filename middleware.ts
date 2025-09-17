import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const isAuthPage = req.nextUrl.pathname === '/login' || 
                     req.nextUrl.pathname === '/signup' ||
                     req.nextUrl.pathname === '/'
  
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') ||
                          req.nextUrl.pathname.startsWith('/influencer') ||
                          req.nextUrl.pathname.startsWith('/profile')
  
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}