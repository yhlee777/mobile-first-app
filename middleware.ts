import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // /advertiser 경로 명시적 허용
  if (req.nextUrl.pathname === '/advertiser' && session) {
    return res
  }
  
  // /influencer/* 경로 명시적 허용  
  if (req.nextUrl.pathname.startsWith('/influencer/') && session) {
    return res
  }
  
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}