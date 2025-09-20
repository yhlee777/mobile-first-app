'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Users2, Megaphone, UserCircle } from 'lucide-react'
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
    
    // auth state 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        checkUser()
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false)
        setUserType(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoggedIn(false)
        setUserType(null)
        setLoading(false)
        return
      }

      setIsLoggedIn(true)
      
      // 1. users 테이블에서 먼저 확인
      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single()
      
      if (userData?.user_type) {
        setUserType(userData.user_type)
        setLoading(false)
        return
      }
      
      // 2. influencers 테이블 확인
      const { data: influencer } = await supabase
        .from('influencers')
        .select('id')
        .eq('user_id', user.id)
        .single()
        
      if (influencer) {
        setUserType('influencer')
        // users 테이블 업데이트
        await supabase
          .from('users')
          .upsert({
            id: user.id,
            user_type: 'influencer',
            updated_at: new Date().toISOString()
          })
        setLoading(false)
        return
      }
      
      // 3. brands 테이블 확인
      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .single()
        
      if (brand) {
        setUserType('advertiser')
        // users 테이블 업데이트
        await supabase
          .from('users')
          .upsert({
            id: user.id,
            user_type: 'advertiser',
            updated_at: new Date().toISOString()
          })
        setLoading(false)
        return
      }
      
      // 4. advertisers 테이블도 확인
      const { data: advertiser } = await supabase
        .from('advertisers')
        .select('id')
        .eq('user_id', user.id)
        .single()
        
      if (advertiser) {
        setUserType('advertiser')
        await supabase
          .from('users')
          .upsert({
            id: user.id,
            user_type: 'advertiser',
            updated_at: new Date().toISOString()
          })
      } else {
        // 기본값: 인플루언서
        console.warn('User type not found, defaulting to influencer')
        setUserType('influencer')
      }
      
    } catch (error) {
      console.error('❌ Error checking user:', error)
      // 에러 시 기본값 설정
      setUserType('influencer')
    } finally {
      setLoading(false)
    }
  }

  const hideOnPaths = ['/login', '/signup', '/']
  const shouldHide = loading || !isLoggedIn || hideOnPaths.some(path => pathname === path)
  
  if (shouldHide) {
    return null
  }

  const navItems = [
    {
      label: '홈',
      icon: Home,
      onClick: () => {
        // userType이 없을 경우 기본값 처리
        const targetType = userType || 'influencer'
        if (targetType === 'advertiser') {
          router.push('/advertiser/dashboard')
        } else {
          router.push('/influencer/dashboard')
        }
      },
      isActive: () => {
        if (userType === 'advertiser') {
          return pathname === '/advertiser/dashboard'
        }
        return pathname === '/influencer/dashboard'
      }
    },
    {
  label: '파트너',
  icon: Users2,
  onClick: () => {
    if (userType === 'advertiser') {
      router.push('/advertiser/partners')  // partners 페이지로
    } else {
      router.push('/influencer/partners')
    }
  },
  isActive: () => {
    if (userType === 'advertiser') {
      return pathname.startsWith('/advertiser/partners')
    }
    return pathname.startsWith('/influencer/partners')
  }
},
    {
      label: '캠페인',
      icon: Megaphone,
      onClick: () => {
        const targetType = userType || 'influencer'
        if (targetType === 'advertiser') {
          router.push('/advertiser/campaigns')
        } else {
          router.push('/influencer/campaigns')
        }
      },
      isActive: () => {
        if (userType === 'advertiser') {
          return pathname.startsWith('/advertiser/campaigns') || pathname.startsWith('/advertiser/explore')
        }
        return pathname.startsWith('/influencer/campaigns')
      }
    },
    {
      label: '프로필',
      icon: UserCircle,
      onClick: () => {
        const targetType = userType || 'influencer'
        if (targetType === 'advertiser') {
          router.push('/advertiser/profile')
        } else {
          router.push('/influencer/profile')
        }
      },
      isActive: () => {
        if (userType === 'advertiser') {
          return pathname.startsWith('/advertiser/profile')
        }
        return pathname.startsWith('/influencer/profile')
      }
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.isActive()
          
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive 
                  ? 'text-[#51a66f]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}