'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, UserCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [userType, setUserType] = useState<'brand' | 'influencer' | null>(null)
  const supabase = createClient()

  useEffect(() => {
    checkUserType()
  }, [])

  const checkUserType = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .single()
        
        if (data?.user_type) {
          setUserType(data.user_type as 'brand' | 'influencer')
        }
      }
    } catch (error) {
      console.error('Error checking user type:', error)
    }
  }

  const navItems = [
    {
      label: '홈',
      icon: Home,
      href: userType === 'brand' ? '/advertiser' : userType === 'influencer' ? '/dashboard' : '/'
    },
    {
      label: '캠페인',
      icon: Search,
      href: '/campaigns'
    },
    {
      label: '내프로필',
      icon: UserCircle,
      href: userType === 'brand' ? '/advertiser/profile' : '/profile'
    }
  ]

  // 하단 네비게이션을 숨길 경로들
  const hideOnPaths = ['/login', '/signup', '/auth', '/onboarding']
  const shouldHide = hideOnPaths.some(path => pathname.startsWith(path))
  
  if (shouldHide) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
                          (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
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