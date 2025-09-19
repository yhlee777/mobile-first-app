'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Home,
  Megaphone,
  User,
  Store
} from 'lucide-react'

export function BottomNavigation() {
  const pathname = usePathname()
  const [userType, setUserType] = useState<'influencer' | 'advertiser' | null>(null)
  const supabase = createClient()

  useEffect(() => {
    checkUserType()
  }, [])

  const checkUserType = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('user_type')
        .eq('user_id', user.id)
        .single()
      
      setUserType(data?.user_type || null)
    }
  }

  // 인플루언서 메뉴
  const influencerMenus = [
    {
      name: '홈',
      href: '/dashboard',
      icon: Home,
      active: pathname === '/dashboard'
    },
    {
      name: '캠페인',
      href: '/influencer/campaigns',
      icon: Megaphone,
      active: pathname?.startsWith('/influencer/campaigns')
    },
    {
      name: '내프로필',
      href: '/influencer/profile',
      icon: User,
      active: pathname?.startsWith('/influencer/profile')
    }
  ]

  // 광고주 메뉴
  const advertiserMenus = [
    {
      name: '홈',
      href: '/advertiser',
      icon: Home,
      active: pathname === '/advertiser'
    },
    {
      name: '캠페인',
      href: '/advertiser/campaigns',
      icon: Megaphone,
      active: pathname?.startsWith('/advertiser/campaigns')
    },
    {
      name: '내프로필',
      href: '/advertiser/profile',
      icon: Store,
      active: pathname?.startsWith('/advertiser/profile')
    }
  ]

  const menus = userType === 'advertiser' ? advertiserMenus : influencerMenus

  // 로그인 페이지나 회원가입 페이지에서는 숨기기
  if (!userType || pathname === '/' || pathname === '/signup') {
    return null
  }

  return (
    <>
      {/* 모바일/태블릿 하단 네비게이션 (768px 이하) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 pb-safe md:hidden">
        <div className="flex items-center justify-around h-16">
          {menus.map((menu) => {
            const Icon = menu.icon
            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`
                  flex flex-col items-center justify-center px-5 py-2 rounded-lg
                  transition-all duration-200
                  ${menu.active 
                    ? 'text-[#51a66f]' 
                    : 'text-gray-500'
                  }
                `}
              >
                <Icon 
                  className={`h-6 w-6 ${menu.active ? 'scale-110' : ''}`}
                  strokeWidth={menu.active ? 2.5 : 2}
                />
                <span className={`
                  text-[10px] mt-1 font-medium
                  ${menu.active ? 'text-[#51a66f]' : 'text-gray-500'}
                `}>
                  {menu.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* 데스크탑 사이드바 (768px 이상) */}
      <nav className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#51a66f] mb-8">Itda</h1>
          <div className="space-y-2">
            {menus.map((menu) => {
              const Icon = menu.icon
              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${menu.active 
                      ? 'bg-[#51a66f]/10 text-[#51a66f]' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{menu.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}