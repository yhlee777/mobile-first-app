'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { InfluencerCard } from '@/components/cards/influencer-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Heart, 
  Bell,
  Users,
  Loader2,
  LogOut
} from 'lucide-react'

interface Influencer {
  id: string
  instagram_handle: string
  name: string
  bio: string
  category: string
  followers_count: number
  engagement_rate: number
  profile_image?: string
  location?: string
  avg_views?: number
  is_verified?: boolean
  is_active?: boolean
  created_at?: string
  hashtags?: string[]
}

const categories = ['전체', '패션', '뷰티', '음식', '여행', '피트니스', '테크', '라이프스타일', '육아', '기타']
const followerTiers = ['전체', '1만-5만', '5만-10만', '10만-50만', '50만+']
const locations = ['전체', '서울', '경기', '부산', '대구', '인천', '광주', '대전', '울산', '제주', '기타']

type SortType = '팔로워순' | '참여율순' | '최신순' | '찜한목록'

export default function AdvertiserDashboard() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [followerTier, setFollowerTier] = useState('전체')
  const [locationFilter, setLocationFilter] = useState('전체')
  const [sortBy, setSortBy] = useState<SortType>('팔로워순')
  const [showFilters, setShowFilters] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [notificationCount, setNotificationCount] = useState(0)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadInfluencers()
    loadFavorites()
    loadNotificationCount()
  }, [])

  const loadInfluencers = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('is_active', true)
        .order('followers_count', { ascending: false })
      
      if (error) {
        console.error('Error loading influencers:', error)
        return
      }
      
      if (data) {
        setInfluencers(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('wishlists')
      .select('influencer_id')
      .eq('brand_id', user.id)
    
    if (data) {
      setFavoriteIds(data.map(item => item.influencer_id))
    }
  }

  const loadNotificationCount = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    
    setNotificationCount(count || 0)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const toggleFavorite = async (influencerId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const isFavorited = favoriteIds.includes(influencerId)
  
  if (isFavorited) {
    await supabase
      .from('wishlists')
      .delete()
      .eq('brand_id', user.id)
      .eq('influencer_id', influencerId)
    
    setFavoriteIds(prev => prev.filter(id => id !== influencerId))
  } else {
    await supabase
      .from('wishlists')
      .insert({
        brand_id: user.id,
        influencer_id: influencerId
      })
    
    setFavoriteIds(prev => [...prev, influencerId])
    
    // 인플루언서에게 찜 알림 보내기
    try {
      const { data: influencerData } = await supabase
        .from('influencers')
        .select('user_id')
        .eq('id', influencerId)
        .single()

      if (influencerData?.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: influencerData.user_id,
            type: 'profile_favorited',
            title: '💚 프로필이 찜되었습니다!',
            message: '광고주가 인플루언서님의 프로필을 찜했어요! 좋은 기회가 올지도 몰라요.',
            is_read: false
          })
      }
    } catch (error) {
      console.error('찜 알림 생성 실패:', error)
    }
  }
}
  const filteredInfluencers = influencers.filter(influencer => {
    if (sortBy === '찜한목록' && !favoriteIds.includes(influencer.id)) {
      return false
    }

    const matchesSearch = influencer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         influencer.instagram_handle?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === '전체' || influencer.category === categoryFilter
    const matchesLocation = locationFilter === '전체' || influencer.location === locationFilter
    
    const matchesFollowerTier = (() => {
      if (followerTier === '전체') return true
      const count = influencer.followers_count || 0
      switch (followerTier) {
        case '1만-5만': return count >= 10000 && count < 50000
        case '5만-10만': return count >= 50000 && count < 100000
        case '10만-50만': return count >= 100000 && count < 500000
        case '50만+': return count >= 500000
        default: return true
      }
    })()
    
    return matchesSearch && matchesCategory && matchesLocation && matchesFollowerTier
  }).sort((a, b) => {
    if (sortBy === '팔로워순') {
      return (b.followers_count || 0) - (a.followers_count || 0)
    } else if (sortBy === '참여율순') {
      return (b.engagement_rate || 0) - (a.engagement_rate || 0)
    } else if (sortBy === '최신순') {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    }
    return 0
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#51a66f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/10">
      {/* 모바일 헤더 */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b">
  <div className="px-4 py-3">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold">대시보드</h1>
        <p className="text-xs text-gray-500">광고주 모드</p>
      </div>
      <div className="flex items-center gap-2">
        {/* 알림 버튼 수정 - 빨간 점 표시 추가 */}
        <Button
  variant="outline"
  size="sm"
  onClick={() => router.push('/notifications')}
  className="relative p-2"
>
  <Bell className="h-4 w-4" />
  {notificationCount > 0 && (
    <div className="absolute -top-1 -right-1 z-10">
      <span className="flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
    </div>
  )}
</Button>
        
        {/* 찜목록 버튼 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortBy('찜한목록')}
          className="relative p-2"
        >
          <Heart className={`h-5 w-5 ${sortBy === '찜한목록' ? 'fill-red-500 text-red-500' : ''}`} />
          {favoriteIds.length > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 flex items-center justify-center bg-[#51a66f] border-0">
              <span className="text-[10px] text-white">
                {favoriteIds.length}
              </span>
            </Badge>
          )}
        </Button>
      </div>
    </div>
  </div>
</header>

      {/* 데스크탑 헤더 */}
      <header className="hidden md:block sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b">
  <div className="px-6 py-4">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">인플루언서 찾기</h2>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => router.push('/advertiser/campaigns')}
        >
          내 캠페인 관리
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push('/notifications')}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center">
              <span className="absolute h-5 w-5 bg-red-500 rounded-full animate-ping opacity-75" />
              <Badge className="relative h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] border-0">
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  </div>
</header>

      {/* 검색 및 필터 섹션 */}
      <div className="px-4 md:px-6 py-3 bg-white/90 backdrop-blur-sm border-b sticky top-[57px] md:top-[73px] z-20">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="이름 또는 @핸들로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-full bg-white/80"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-[#51a66f] text-white' : ''}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* 필터 옵션 - 토글 시 표시 */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50/50 rounded-lg space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {/* 카테고리 필터 */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 팔로워 규모 필터 */}
              <Select value={followerTier} onValueChange={setFollowerTier}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="팔로워" />
                </SelectTrigger>
                <SelectContent>
                  {followerTiers.map(tier => (
                    <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 지역 필터 */}
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="지역" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 정렬 옵션 */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="팔로워순">팔로워순</SelectItem>
                  <SelectItem value="참여율순">참여율순</SelectItem>
                  <SelectItem value="최신순">최신순</SelectItem>
                  <SelectItem value="찜한목록">찜한목록</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 필터 초기화 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategoryFilter('전체')
                setFollowerTier('전체')
                setLocationFilter('전체')
                setSortBy('팔로워순')
                setSearchTerm('')
              }}
              className="text-xs text-gray-600"
            >
              필터 초기화
            </Button>
          </div>
        )}
      </div>

      {/* 결과 카운트 */}
      <div className="px-4 md:px-6 py-2 bg-gray-50/50 border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            총 <span className="font-semibold text-gray-900">{filteredInfluencers.length}</span>명의 인플루언서
          </span>
        </div>
      </div>

      {/* 인플루언서 그리드 */}
      <main className="px-4 md:px-6 py-4">
        {filteredInfluencers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filteredInfluencers.map((influencer) => (
              <InfluencerCard 
                key={influencer.id}
                influencer={influencer}
                viewType="advertiser"
                onFavorite={() => toggleFavorite(influencer.id)}
                isFavorited={favoriteIds.includes(influencer.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {sortBy === '찜한목록' 
                ? '찜한 인플루언서가 없습니다' 
                : '검색 결과가 없습니다'
              }
            </p>
          </div>
        )}
      </main>
    </div>
  )
}