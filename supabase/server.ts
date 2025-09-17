﻿import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Database } from "@/types/database"

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // Server Component에서 쿠키 설정 실패 처리
          }
        },
      },
    }
  )
}
