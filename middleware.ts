// 프로젝트 루트에 위치
// Next.js가 이 파일을 찾아서 실행함
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'  // 헬퍼 함수 import

export async function middleware(request: NextRequest) {
  // lib/supabase/middleware.ts의 updateSession 함수 호출
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}