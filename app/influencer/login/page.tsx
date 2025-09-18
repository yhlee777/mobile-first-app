'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OldInfluencerLoginPage() {
  const router = useRouter()
  
  useEffect(() => {
    // 통합 로그인 페이지로 리다이렉트
    router.replace('/login')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>로그인 페이지로 이동 중...</p>
    </div>
  )
}