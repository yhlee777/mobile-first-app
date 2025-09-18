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
  Menu
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
}

// 고화질 샘플 데이터
const sampleInfluencers: Influencer[] = [
  {
    id: '1',
    name: '아이유 (IU)',
    instagram_handle: '@dlwlrma',
    bio: '가수, 배우',
    category: '피드',
    followers_count: 32000000,
    engagement_rate: 8.5,
    profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b03c?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
    location: '서울',
    avg_views: 5200000
  },
  {
    id: '2',
    name: '제시카 (Jessica)',
    instagram_handle: '@jessica_official',
    bio: '뷰티 & 패션 인플루언서',
    category: '피드/웰스',
    followers_count: 11934011,
    engagement_rate: 5.7,
    profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
    location: '서울',
    avg_views: 1850000
  },
  {
    id: '3',
    name: '포니 (PONY)',
    instagram_handle: '@ponysmakeup',
    bio: '메이크업 아티스트',
    category: '파트/웰스',
    followers_count: 8746801,
    engagement_rate: 6.2,
    profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
    location: '서울',
    avg_views: 980000
  },
  {
    id: '4',
    name: '오늘의집',
    instagram_handle: '@ohouse_official',
    bio: '인테리어 & 홈데코',
    category: '피드/웰스',
    followers_count: 1311961,
    engagement_rate: 4.8,
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
    location: '서울',
    avg_views: 125000
  },
  {
    id: '5',
    name: '리사베',
    instagram_handle: '@lisa_bp',
    bio: 'K-POP 아이돌',
    category: '엔터실습',
    followers_count: 1303371,
    engagement_rate: 7.1,
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
    location: '서울',
    avg_views: 195000
  },
  {
    id: '6',
    name: '심으뜸',
    instagram_handle: '@simeutteom',
    bio: '웹툰 작가',
    category: '일러/피트',
    followers_count: 831538,
    engagement_rate: 5.3,
    profile_image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
    location: '서울',
    avg_views: 89000
  }
]

export default function AdvertiserPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [influencers, setInfluencers] = useState<Influencer[]>(sampleInfluencers)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [followerTier, setFollowerTier] = useState('전체')
  const [sortBy, setSortBy] = useState('팔로워순')
  const [showFilters, setShowFilters] = useState(false)
  const [likedInfluencers, setLikedInfluencers] = useState<string[]>([])

  // 필터 옵션들
  const categories = ['전체', '피드', '파트/웰스', '엔터실습', '일러/피트', '뷰티', '맛집']
  const followerTierOptions = [
    { value: '전체', label: '전체' },
    { value: 'micro', label: '1만-10만' },
    { value: 'mid', label: '10만-100만' },
    { value: 'macro', label: '100만-1000만' },
    { value: 'mega', label: '1000만+' }
  ]
  
  const sortOptions = [
    { value: '팔로워순', label: '팔로워 많은 순' },
    { value: '팔로워역순', label: '팔로워 적은 순' },
    { value: '참여율순', label: '참여율 높은 순' },
    { value: '최신순', label: '최신 등록순' },
    { value: '이름순', label: '이름 순' }
  ]

  useEffect(() => {
    setInfluencers(sampleInfluencers)
  }, [])

  const formatFollowers = (count: number) => {
    if (count >= 10000000) {
      return (count / 10000000).toFixed(0) + '천만'
    }
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace('.0', '') + '백만'
    }
    if (count >= 10000) {
      return (count / 10000).toFixed(0) + '만'
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(0) + '천'
    }
    return count.toString()
  }

  const formatViews = (views?: number) => {
    if (!views) return '***'
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1).replace('.0', '') + '백만'
    }
    if (views >= 10000) {
      return (views / 10000).toFixed(0) + '만'
    }
    if (views >= 1000) {
      return (views / 1000).toFixed(0) + '천'
    }
    return views.toString()
  }

  const handleLike = (influencerId: string) => {
    setLikedInfluencers(prev => 
      prev.includes(influencerId) 
        ? prev.filter(id => id !== influencerId)
        : [...prev, influencerId]
    )
  }

  const getFilteredAndSortedInfluencers = () => {
    let filtered = [...influencers]

    if (searchTerm) {
      filtered = filtered.filter(inf => 
        inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inf.instagram_handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inf.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inf.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== '전체') {
      filtered = filtered.filter(inf => inf.category === categoryFilter)
    }

    if (followerTier !== '전체') {
      filtered = filtered.filter(inf => {
        switch (followerTier) {
          case 'micro':
            return inf.followers_count >= 10000 && inf.followers_count < 100000
          case 'mid':
            return inf.followers_count >= 100000 && inf.followers_count < 1000000
          case 'macro':
            return inf.followers_count >= 1000000 && inf.followers_count < 10000000
          case 'mega':
            return inf.followers_count >= 10000000
          default:
            return true
        }
      })
    }

    switch (sortBy) {
      case '팔로워순':
        filtered.sort((a, b) => b.followers_count - a.followers_count)
        break
      case '팔로워역순':
        filtered.sort((a, b) => a.followers_count - b.followers_count)
        break
      case '참여율순':
        filtered.sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
        break
      case '최신순':
        filtered.reverse()
        break
      case '이름순':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return filtered
  }

  const sortedInfluencers = getFilteredAndSortedInfluencers()

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* 타이틀 - 잇다 로고 제거, 글씨만 */}
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">인플루언서</h1>
            
            {/* 우측 아이콘들 */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="w-8 h-8 sm:w-10 sm:h-10"
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 검색창 */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="인플루언서 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 sm:h-12 bg-gray-50 border-gray-200 rounded-lg text-sm sm:text-base"
          />
        </div>

        {/* 필터 옵션들 */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t">
            <div>
              <Label className="text-xs text-gray-600">카테고리</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 sm:h-9 mt-1 text-xs sm:text-sm">
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
              <Label className="text-xs text-gray-600">팔로워</Label>
              <Select value={followerTier} onValueChange={setFollowerTier}>
                <SelectTrigger className="h-8 sm:h-9 mt-1 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {followerTierOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-600">정렬</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 sm:h-9 mt-1 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setCategoryFilter('전체')
                  setFollowerTier('전체')
                  setSortBy('팔로워순')
                  setSearchTerm('')
                }}
                className="h-8 sm:h-9 text-xs sm:text-sm"
              >
                초기화
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 인플루언서 그리드 - 모바일 최적화 + 데스크탑 더 많은 열 */}
      <main className="p-3 sm:p-4">
        {sortedInfluencers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
            {sortedInfluencers.map(influencer => (
              <Card key={influencer.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  {/* 프로필 이미지 */}
                  <div className="relative">
                    <div className="aspect-square bg-gray-100">
                      {influencer.profile_image ? (
                        <img 
                          src={influencer.profile_image}
                          alt={influencer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* 찜 버튼 */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-white/80 hover:bg-white w-6 h-6 sm:w-8 sm:h-8"
                      onClick={() => handleLike(influencer.id)}
                    >
                      <Heart 
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          likedInfluencers.includes(influencer.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-gray-600'
                        }`} 
                      />
                    </Button>
                  </div>

                  {/* 인플루언서 정보 */}
                  <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                    {/* 이름과 확인 배지 */}
                    <div className="flex items-center gap-1">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                        {influencer.name}
                      </h3>
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                    </div>

                    {/* 위치 */}
                    <div className="flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{influencer.location}</span>
                    </div>

                    {/* 팔로워 수와 참여율 */}
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div>
                        <span className="text-xs text-gray-500">팔로워</span>
                        <div className="font-semibold text-gray-900 text-xs sm:text-sm">
                          {formatFollowers(influencer.followers_count)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">참여율</span>
                        <div className="font-semibold text-gray-900 text-xs sm:text-sm">***</div>
                      </div>
                      <Button variant="ghost" size="sm" className="p-0.5 sm:p-1">
                        <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                      </Button>
                    </div>

                    {/* 월스 평균 조회수 */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">월스 평균 조회수</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-900 font-medium">***</span>
                        <Button variant="ghost" size="sm" className="p-0 w-3 h-3 sm:w-4 sm:h-4">
                          <Eye className="h-2 w-2 text-gray-400" />
                        </Button>
                      </div>
                    </div>

                    {/* 카테고리 태그들 */}
                    <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
                      <Badge 
                        className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 text-blue-700 border-0"
                      >
                        {influencer.category}
                      </Badge>
                      <Badge 
                        className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 brand-primary text-white border-0"
                      >
                        활동중
                      </Badge>
                    </div>

                    {/* 자세히 보기 버튼 */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2 sm:mt-3 text-xs sm:text-sm brand-primary-text brand-primary-border hover:bg-gray-50 h-7 sm:h-8"
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
            <p className="text-gray-500 text-lg">검색 결과가 없습니다</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('전체')
                setFollowerTier('전체')
                setSortBy('팔로워순')
              }}
            >
              필터 초기화
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}