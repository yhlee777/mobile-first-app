'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
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
import { formatNumber } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Heart, 
  LogOut,
  Eye,
  CheckCircle,
  MapPin,
  Users,
  RefreshCw,
  Menu,
  Star,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2
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
  created_at?: string
}

// 카테고리별 색상 매핑
const categoryColors: Record<string, string> = {
  '패션': 'bg-pink-100 text-pink-700 border-pink-200',
  '뷰티': 'bg-purple-100 text-purple-700 border-purple-200',
  '음식': 'bg-orange-100 text-orange-700 border-orange-200',
  '여행': 'bg-blue-100 text-blue-700 border-blue-200',
  '피트니스': 'bg-green-100 text-green-700 border-green-200',
  '테크': 'bg-slate-100 text-slate-700 border-slate-200',
  '라이프스타일': 'bg-amber-100 text-amber-700 border-amber-200',
  '육아': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  '기타': 'bg-gray-100 text-gray-700 border-gray-200'
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
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadInfluencers()
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

  // 로그아웃 처리
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  // 팔로워 수 포맷팅 함수
  const formatFollowers = (count: number): string => {
    if (!count) return '0'
    if (count >= 10000000) return `${Math.floor(count / 1000000)}M`
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 10000) return `${Math.floor(count / 1000)}K`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  // 찜하기 토글
  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => 
      prev.includes(id) 
        ? prev.filter(fId => fId !== id)
        : [...prev, id]
    )
  }

  // 정렬/필터링된 인플루언서 목록
  const filteredInfluencers = influencers.filter(influencer => {
    // 찜한목록 필터
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
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-gray-500">인플루언서 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
      {/* 상단 헤더 */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">광고주 대시보드</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">인플루언서를 찾아보세요</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* 검색 및 필터 섹션 */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 bg-white border-b">
        {/* 검색바와 필터 토글 */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="인플루언서 검색..."
              className="pl-9 h-9 sm:h-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 sm:h-10 px-3"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">필터</span>
          </Button>
        </div>

        {/* 정렬 및 찜한목록 버튼 */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {(['팔로워순', '참여율순', '최신순', '찜한목록'] as SortType[]).map((sort) => (
            <Button
              key={sort}
              variant={sortBy === sort ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy(sort)}
              className={`h-8 text-xs whitespace-nowrap flex-shrink-0 ${
                sortBy === sort ? 'brand-primary brand-primary-hover text-white' : ''
              }`}
            >
              {sort === '찜한목록' && <Heart className="h-3 w-3 mr-1" />}
              {sort}
            </Button>
          ))}
        </div>

        {/* 확장 필터 */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">카테고리</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-500 mb-1 block">팔로워</Label>
              <Select value={followerTier} onValueChange={setFollowerTier}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {followerTiers.map(tier => (
                    <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-500 mb-1 block">지역</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('전체')
                  setFollowerTier('전체')
                  setLocationFilter('전체')
                  setSortBy('팔로워순')
                }}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                초기화
              </Button>
            </div>
          </div>
        )}
      </div>

{/* 인플루언서 목록 */}
<main className="px-3 sm:px-4 py-4 sm:py-6">
  {filteredInfluencers.length > 0 ? (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {filteredInfluencers.map((influencer) => (
        <Card 
          key={influencer.id} 
          className="overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex flex-col"
          onClick={() => router.push(`/advertiser/influencer/${influencer.id}`)}
        >
          <CardContent className="p-0 flex flex-col h-full">
            {/* 이미지 영역 - 고정 */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {influencer.profile_image ? (
                  <img 
                    src={influencer.profile_image} 
                    alt={influencer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                )}
              </div>
              
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

              <div className="absolute bottom-2 left-2 z-10">
                <Badge className={`text-xs px-2 py-1 border ${categoryColors[influencer.category] || categoryColors['기타']}`}>
                  {influencer.category || '미정'}
                </Badge>
              </div>
            </div>

            {/* 정보 영역 - 고정 높이들 */}
            <div className="p-3 flex flex-col flex-1">
              {/* 이름 영역 - 고정 높이 */}
              <div className="h-6 flex items-center gap-1 mb-1">
                <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">
                  {influencer.name || '이름 미설정'}
                </h3>
                {influencer.is_verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>

              {/* 인스타 아이디 영역 - 고정 높이 */}
              <div className="h-5 flex items-center mb-1">
                <span className="text-xs text-gray-500 truncate">
                  @{influencer.instagram_handle}
                </span>
              </div>

              {/* 위치 영역 - 고정 높이 */}
              <div className="h-5 flex items-center gap-1 mb-2">
                {influencer.location ? (
                  <>
                    <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-500 truncate">{influencer.location}</span>
                  </>
                ) : (
                  <span className="text-xs text-transparent">-</span>
                )}
              </div>

              {/* 팔로워/참여율 영역 - 고정 높이 */}
              <div className="h-10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">팔로워</span>
                  <div className="font-semibold text-gray-900 text-sm">
                    {formatFollowers(influencer.followers_count)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">참여율</span>
                  <div className="font-semibold text-gray-900 text-sm">
                    {influencer.engagement_rate || 0}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
            <p className="text-sm text-gray-400 mb-4">
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