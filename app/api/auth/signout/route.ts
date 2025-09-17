import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  
  await supabase.auth.signOut()
  
  return NextResponse.redirect(new URL('/login', request.url))
}