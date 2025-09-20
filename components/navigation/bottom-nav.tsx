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
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setIsLoggedIn(true)
        
        const { data: userData } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .single()
        
        if (userData?.user_type) {
          setUserType(userData.user_type)
        } else {
          // 각 테이블 확인 로직
          const { data: influencer } = await supabase
            .from('influencers')
            .select('id')
            .eq('user_id', user.id)
            .single()
            
          if (influencer) {
            setUserType('influencer')
          } else {
            const { data: brand } = await supabase
              .from('brands')
              .select('id')
              .eq('user_id', user.id)
              .single()
              
            if (brand) {
              setUserType('advertiser')
            }
          }
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
        if (userType === 'advertiser') {
          router.push('/advertiser/dashboard')
        } else {
          router.push('/influencer/dashboard')
        }
      },
      isActive: () => {
        if (userType === 'advertiser') {
          return pathname.startsWith('/advertiser/dashboard')
        }
        return pathname.startsWith('/influencer/dashboard')
      }
    },
    {
      label: '파트너',
      icon: Users2,
      onClick: () => {
        if (userType === 'advertiser') {
          router.push('/advertiser/partners')
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
        // 광고주도 전체 캠페인 보기로 변경
        if (userType === 'advertiser') {
          router.push('/advertiser/explore')
        } else {
          router.push('/influencer/campaigns')
        }
      },
      isActive: () => {
        if (userType === 'advertiser') {
          return pathname.startsWith('/advertiser/explore') || pathname.startsWith('/advertiser/campaigns')
        }
        return pathname.startsWith('/influencer/campaigns')
      }
    },
    {
      label: '프로필',
      icon: UserCircle,
      onClick: () => {
        if (userType === 'advertiser') {
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