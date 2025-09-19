// components/navigation/bottom-nav.tsx

'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Megaphone, UserCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setIsLoggedIn(true)
        
        // 먼저 users 테이블에서 user_type 확인
        const { data: userData } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .single()
        
        if (userData?.user_type) {
          setUserType(userData.user_type)
          console.log('✅ User type:', userData.user_type)
        }
      } else {
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error('❌ Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const hideOnPaths = ['/login', '/signup', '/auth', '/onboarding', '/']
  const shouldHide = loading || !isLoggedIn || hideOnPaths.some(path => pathname === path)
  
  if (shouldHide) {
    return null
  }

  const navItems = [
    {
      label: '홈',
      icon: Home,
      onClick: () => {
        console.log('🏠 홈 클릭, userType:', userType)
        if (userType === 'advertiser') {
          router.push('/advertiser')
        } else if (userType === 'influencer') {
          router.push('/influencer/dashboard')
        } else {
          router.push('/dashboard')
        }
      },
      isActive: () => {
        if (userType === 'advertiser') {
          return pathname.startsWith('/advertiser')
        }
        if (userType === 'influencer') {
          return pathname.startsWith('/influencer')
        }
        return pathname.startsWith('/dashboard')
      }
    },
    {
      label: '캠페인',
      icon: Megaphone,
      onClick: () => router.push('/campaigns'),
      isActive: () => pathname.startsWith('/campaigns')
    },
    {
      label: '내프로필',
      icon: UserCircle,
      onClick: () => {
        console.log('👤 프로필 클릭, userType:', userType)
        if (userType === 'advertiser') {
          router.push('/advertiser/profile')
        } else {
          router.push('/profile')
        }
      },
      isActive: () => {
        if (userType === 'advertiser') {
          return pathname.startsWith('/advertiser/profile')
        }
        return pathname.startsWith('/profile')
      }
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.isActive()
          
          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                isActive ? 'text-[#51a66f]' : 'text-gray-500'
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'stroke-2' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}