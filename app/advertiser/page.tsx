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
  RefreshCw,
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
      .eq('read', false)
    
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
    switch (sortBy) {
      case '팔로워순':
        return (b.followers_count || 0) - (a.followers_count || 0)
      case '참여율순':
        return (b.engagement_rate || 0) - (a.engagement_rate || 0)
      case '최신순':
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#51a66f]" />
          <p className="text-gray-500">인플루언서 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pb-20 md:pb-0 md:pl-64">
      {/* 모바일 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#51a66f]">Itda</h1>
            <div className="flex items-center gap-2">
              {/* 알림 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/notifications')}
                className="relative p-2"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 flex items-center justify-center bg-red-500 border-0">
                    <span className="text-[10px] text-white">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  </Badge>
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
      <header className="hidden md:block sticky top-0 z-30 bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">인플루언서 찾기</h2>
            <div className="flex items-center gap-3">
              {/* 알림 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/notifications')}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 border-0">
                    <span className="text-[9px] text-white">
                      {notificationCount}
                    </span>
                  </Badge>
                )}
              </Button>
              
              {/* 찜목록 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortBy('찜한목록')}
                className="relative"
              >
                <Heart className={`h-5 w-5 ${sortBy === '찜한목록' ? 'fill-red-500 text-red-500' : ''}`} />
                {favoriteIds.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-[#51a66f] border-0">
                    <span className="text-[9px] text-white">
                      {favoriteIds.length}
                    </span>
                  </Badge>
                )}
              </Button>

              {/* 로그아웃 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 검색 및 필터 섹션 */}
      <div className="px-4 md:px-6 py-3 bg-white border-b">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="이름 또는 @핸들로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs mb-1.5 block">카테고리</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">지역</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {locations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">팔로워</Label>
                <Select value={followerTier} onValueChange={setFollowerTier}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {followerTiers.map(tier => (
                        <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">정렬</Label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortType)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="팔로워순">팔로워순</SelectItem>
                      <SelectItem value="참여율순">참여율순</SelectItem>
                      <SelectItem value="최신순">최신순</SelectItem>
                      <SelectItem value="찜한목록">찜한목록</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 결과 카운트 */}
      <div className="px-4 md:px-6 py-2 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            총 <span className="font-semibold text-gray-900">{filteredInfluencers.length}</span>명의 인플루언서
            {sortBy === '찜한목록' && (
              <span className="ml-2 text-xs">
                (<Heart className="inline h-3 w-3 fill-red-500 text-red-500" /> {favoriteIds.length})
              </span>
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadInfluencers()}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 인플루언서 그리드 */}
      <main className="px-4 md:px-6 py-4">
        {filteredInfluencers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filteredInfluencers.map((influencer) => (
              <div key={influencer.id} className="relative">
                <InfluencerCard 
                  influencer={influencer}
                  viewType="advertiser"
                />
                {/* 찜하기 버튼 오버레이 */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white p-0 shadow-md z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(influencer.id)
                  }}
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      favoriteIds.includes(influencer.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-600'
                    }`} 
                  />
                </Button>
              </div>
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
            <p className="text-sm text-gray-400">
              {sortBy === '찜한목록' 
                ? '하트를 눌러 관심있는 인플루언서를 저장하세요' 
                : '다른 검색 조건을 시도해보세요'
              }
            </p>
          </div>
        )}
      </main>
    </div>
  )
}