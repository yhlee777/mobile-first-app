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
  Clock
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
  '기타': 'bg-gray-100 text-gray-700 border-gray-200'
}

// 향상된 샘플 데이터
const sampleInfluencers: Influencer[] = [
  {
    id: '1',
    name: '맛집탐방러',
    instagram_handle: '@foodie_explorer',
    bio: '전국 맛집을 찾아다니며 솔직한 리뷰를 전하는 푸드 인플루언서',
    category: '음식',
    followers_count: 42000,
    engagement_rate: 6.2,
    profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b03c?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
    location: '서울',
    avg_views: 15000,
    is_verified: true,
    created_at: '2024-01-15'
  },
  {
    id: '2',
    name: '카페마니아',
    instagram_handle: '@cafe_maniac',
    bio: '감성 카페와 디저트 소개',
    category: '뷰티',
    followers_count: 48000,
    engagement_rate: 7.1,
    profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
    location: '부산',
    avg_views: 18500,
    is_verified: false,
    created_at: '2024-02-20'
  },
  {
    id: '3',
    name: '홈트레이너민지',
    instagram_handle: '@hometrainer_minji',
    bio: '집에서도 할 수 있는 홈트레이닝',
    category: '피트니스',
    followers_count: 65000,
    engagement_rate: 8.3,
    profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
    location: '서울',
    avg_views: 25000,
    is_verified: true,
    created_at: '2024-03-10'
  },
  {
    id: '4',
    name: '여행가는아이',
    instagram_handle: '@traveler_kid',
    bio: '국내외 여행 정보 공유',
    category: '여행',
    followers_count: 89000,
    engagement_rate: 5.9,
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
    location: '제주',
    avg_views: 32000,
    is_verified: true,
    created_at: '2024-01-25'
  },
  {
    id: '5',
    name: '테크리뷰어',
    instagram_handle: '@tech_reviewer',
    bio: '최신 IT 제품 리뷰',
    category: '테크',
    followers_count: 156000,
    engagement_rate: 4.7,
    profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
    location: '경기',
    avg_views: 45000,
    is_verified: true,
    created_at: '2024-02-05'
  },
  {
    id: '6',
    name: '패션스타일리스트',
    instagram_handle: '@fashion_stylist',
    bio: '일상 스타일링 팁',
    category: '패션',
    followers_count: 234000,
    engagement_rate: 6.8,
    profile_image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
    location: '서울',
    avg_views: 58000,
    is_verified: true,
    created_at: '2024-03-15'
  }
]

const categories = ['전체', '패션', '뷰티', '음식', '여행', '피트니스', '테크', '라이프스타일', '기타']
const followerTiers = ['전체', '1만-5만', '5만-10만', '10만-50만', '50만+']
const locations = ['전체', '서울', '경기', '부산', '대구', '인천', '광주', '대전', '울산', '제주', '기타']

type SortType = '팔로워순' | '참여율순' | '최신순' | '찜한목록'

export default function AdvertiserDashboard() {
  const [influencers, setInfluencers] = useState<Influencer[]>(sampleInfluencers)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [followerTier, setFollowerTier] = useState('전체')
  const [locationFilter, setLocationFilter] = useState('전체')
  const [sortBy, setSortBy] = useState<SortType>('팔로워순')
  const [showFilters, setShowFilters] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['2', '4']) // 초기 찜한 목록
  
  const router = useRouter()
  const supabase = createClient()

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
    if (count >= 10000000) return `${Math.floor(count / 1000000)}M`
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 10000) return `${Math.floor(count / 1000)}K`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  // 정렬/필터링된 인플루언서 목록
  const filteredInfluencers = influencers.filter(influencer => {
    // 찜한목록 필터
    if (sortBy === '찜한목록' && !favoriteIds.includes(influencer.id)) {
      return false
    }

    const matchesSearch = influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         influencer.instagram_handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         influencer.bio.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === '전체' || influencer.category === categoryFilter
    
    const matchesLocation = locationFilter === '전체' || influencer.location === locationFilter
    
    let matchesFollowerTier = true
    if (followerTier !== '전체') {
      const count = influencer.followers_count
      switch (followerTier) {
        case '1만-5만':
          matchesFollowerTier = count >= 10000 && count < 50000
          break
        case '5만-10만':
          matchesFollowerTier = count >= 50000 && count < 100000
          break
        case '10만-50만':
          matchesFollowerTier = count >= 100000 && count < 500000
          break
        case '50만+':
          matchesFollowerTier = count >= 500000
          break
      }
    }
    
    return matchesSearch && matchesCategory && matchesFollowerTier && matchesLocation
  }).sort((a, b) => {
    switch (sortBy) {
      case '참여율순':
        return b.engagement_rate - a.engagement_rate
      case '최신순':
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      case '찜한목록':
        // 찜한목록에서는 팔로워순으로 정렬
        return b.followers_count - a.followers_count
      default: // 팔로워순
        return b.followers_count - a.followers_count
    }
  })

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => 
      prev.includes(id) 
        ? prev.filter(fId => fId !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* 좌측상단에 잇다 브랜드 로고 텍스트 */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold brand-primary-text">잇다</h1>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <span className="text-base sm:text-lg font-semibold text-gray-700 hidden sm:block">파트너 찾기</span>
            </div>
            
            {/* 우측 아이콘들 */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8 sm:w-10 sm:h-10"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 검색창 */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 bg-white border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="인플루언서 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 sm:h-11 bg-gray-50 border-gray-200 rounded-lg text-sm sm:text-base"
          />
        </div>
      </div>

      {/* 정렬 및 필터 버튼들 */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* 필터 아이콘 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-shrink-0 h-8 px-2 sm:px-3 ${showFilters ? 'bg-gray-200' : ''}`}
          >
            <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          {/* 정렬 및 찜한목록 버튼들 */}
          {(['팔로워순', '참여율순', '최신순', '찜한목록'] as SortType[]).map((sort) => (
            <Button
              key={sort}
              variant={sortBy === sort ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(sort)}
              className={`flex-shrink-0 h-8 px-2 sm:px-3 text-xs sm:text-sm transition-all ${
                sortBy === sort
                  ? 'brand-primary brand-primary-hover text-white'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {sort === '참여율순' && <TrendingUp className="h-3 w-3 mr-1" />}
              {sort === '최신순' && <Clock className="h-3 w-3 mr-1" />}
              {sort === '찜한목록' && <Heart className="h-3 w-3 mr-1" />}
              <span>{sort}</span>
            </Button>
          ))}
        </div>

        {/* 확장된 필터 옵션들 */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 pt-3 mt-3 border-t">
            <div>
              <Label className="text-xs text-gray-600">카테고리</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 sm:h-9 mt-1 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs text-gray-600">팔로워</Label>
              <Select value={followerTier} onValueChange={setFollowerTier}>
                <SelectTrigger className="h-8 sm:h-9 mt-1 text-xs sm:text-sm">
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
              <Label className="text-xs text-gray-600">지역</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-8 sm:h-9 mt-1 text-xs sm:text-sm">
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
              <Card key={influencer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* 프로필 이미지 */}
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
                    
                    {/* 좋아요 버튼 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white p-0"
                      onClick={() => toggleFavorite(influencer.id)}
                    >
                      <Heart 
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          favoriteIds.includes(influencer.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-gray-600'
                        }`} 
                      />
                    </Button>

                    {/* 카테고리 태그 */}
                    <div className="absolute bottom-2 left-2">
                      <Badge className={`text-xs px-2 py-1 border ${categoryColors[influencer.category] || categoryColors['기타']}`}>
                        {influencer.category}
                      </Badge>
                    </div>
                  </div>

                  {/* 인플루언서 정보 */}
                  <div className="p-3 space-y-2">
                    {/* 이름과 인증 배지 */}
                    <div className="flex items-center gap-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">
                        {influencer.name}
                      </h3>
                      {influencer.is_verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* 위치 */}
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500 truncate">{influencer.location}</span>
                    </div>

                    {/* 팔로워 수 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500">팔로워</span>
                        <div className="font-semibold text-gray-900 text-sm">
                          {formatFollowers(influencer.followers_count)}
                        </div>
                      </div>
                    </div>

                    {/* 자세히 보기 버튼 */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2 text-xs brand-primary-text brand-primary-border hover:brand-primary hover:text-white h-8"
                      asChild
                    >
                      <Link href={`/advertiser/influencer/${influencer.id}`}>
                        자세히 보기
                      </Link>
                    </Button>
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
                ? '하트 아이콘을 눌러 인플루언서를 찜해보세요' 
                : '다른 검색어나 필터를 시도해보세요'
              }
            </p>
            {sortBy !== '찜한목록' && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('전체')
                  setFollowerTier('전체')
                  setLocationFilter('전체')
                  setSortBy('팔로워순')
                }}
              >
                필터 초기화
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}