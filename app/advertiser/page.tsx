'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
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
  Instagram,
  MapPin,
  Users,
  RefreshCw,
  X,
  User,
  Sparkles,
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
  cover_image?: string
  portfolio_urls?: string[]
  is_active?: boolean
  location?: string
}

const categories = ['전체', '패션', '뷰티', '라이프스타일', '여행', '음식', '피트니스', '테크', '육아', '기타']
const followerTierOptions = [
  { value: 'all', label: '전체', icon: '👥' },
  { value: 'nano', label: '나노 (1K-10K)', icon: '🌱' },
  { value: 'micro', label: '마이크로 (10K-100K)', icon: '🌿' },
  { value: 'macro', label: '매크로 (100K-1M)', icon: '🌳' },
  { value: 'mega', label: '메가 (1M+)', icon: '🌟' }
]
const sortOptions = [
  { value: 'followers', label: '팔로워순', icon: Users },
  { value: 'engagement', label: '참여율순', icon: TrendingUp },
  { value: 'recent', label: '최신순', icon: Clock }
]

// 카드 스켈레톤 컴포넌트
function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 mt-3" />
        <Skeleton className="h-3 w-full mt-2" />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
        <Skeleton className="h-8 w-full mt-3" />
      </CardContent>
    </Card>
  )
}

// 디바운스 훅
function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 300)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export default function AdvertiserPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [followerTier, setFollowerTier] = useState('all')
  const [sortBy, setSortBy] = useState('followers')
  const [showFilters, setShowFilters] = useState(false)
  const [likedInfluencers, setLikedInfluencers] = useState<Set<string>>(new Set())
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set())
  
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()
  
  // 디바운스된 검색어
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    checkAuth()
    fetchInfluencers()
    
    // 로컬 스토리지에서 좋아요 상태 복원
    const savedLikes = localStorage.getItem('likedInfluencers')
    if (savedLikes) {
      setLikedInfluencers(new Set(JSON.parse(savedLikes)))
    }
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const fetchInfluencers = async (showRefreshToast = false) => {
    if (showRefreshToast) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    
    try {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('is_active', true)
        .order('followers_count', { ascending: false })
      
      if (error) throw error
      
      if (data && data.length > 0) {
        setInfluencers(data)
        if (showRefreshToast) {
          addToast({
            title: "새로고침 완료",
            description: `${data.length}명의 인플루언서를 불러왔습니다`,
            variant: "success"
          })
        }
      } else {
        setInfluencers([])
      }
      
    } catch (error: any) {
      console.error('Error fetching influencers:', error)
      addToast({
        title: "오류 발생",
        description: "인플루언서 목록을 불러오는데 실패했습니다",
        variant: "error"
      })
      setInfluencers([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const toggleLike = useCallback((id: string, name: string) => {
    const newLiked = new Set(likedInfluencers)
    if (newLiked.has(id)) {
      newLiked.delete(id)
      addToast({
        title: "좋아요 취소",
        description: `${name}님을 관심 목록에서 제거했습니다`,
        variant: "default"
      })
    } else {
      newLiked.add(id)
      addToast({
        title: "좋아요!",
        description: `${name}님을 관심 목록에 추가했습니다`,
        variant: "success"
      })
    }
    setLikedInfluencers(newLiked)
    // 로컬 스토리지에 저장
    localStorage.setItem('likedInfluencers', JSON.stringify(Array.from(newLiked)))
  }, [likedInfluencers, addToast])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    addToast({
      title: "로그아웃",
      description: "안전하게 로그아웃되었습니다",
      variant: "success"
    })
    router.push('/login')
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setCategoryFilter('전체')
    setFollowerTier('all')
    addToast({
      title: "필터 초기화",
      description: "모든 필터가 초기화되었습니다",
      variant: "default"
    })
  }

  const handleImageError = (id: string) => {
    setImageLoadErrors(prev => new Set(prev).add(id))
  }

  const activeFiltersCount = 
    (categoryFilter !== '전체' ? 1 : 0) + 
    (followerTier !== 'all' ? 1 : 0) + 
    (debouncedSearchTerm ? 1 : 0)

  // 필터링 로직 - 메모이제이션 적용
  const filteredInfluencers = useMemo(() => {
    return influencers.filter(inf => {
      const matchesSearch = !debouncedSearchTerm || 
        inf.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        inf.instagram_handle.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        inf.bio?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      
      const matchesCategory = categoryFilter === '전체' || 
        inf.category === categoryFilter.toLowerCase() ||
        inf.category === categoryFilter
      
      let matchesFollowers = true
      if (followerTier !== 'all') {
        const followers = inf.followers_count
        matchesFollowers = 
          (followerTier === 'nano' && followers >= 1000 && followers < 10000) ||
          (followerTier === 'micro' && followers >= 10000 && followers < 100000) ||
          (followerTier === 'macro' && followers >= 100000 && followers < 1000000) ||
          (followerTier === 'mega' && followers >= 1000000)
      }
      
      return matchesSearch && matchesCategory && matchesFollowers
    })
  }, [influencers, debouncedSearchTerm, categoryFilter, followerTier])

  // 정렬 - 메모이제이션 적용
  const sortedInfluencers = useMemo(() => {
    return [...filteredInfluencers].sort((a, b) => {
      if (sortBy === 'followers') {
        return b.followers_count - a.followers_count
      } else if (sortBy === 'engagement') {
        return (b.engagement_rate || 0) - (a.engagement_rate || 0)
      } else {
        return b.id.localeCompare(a.id)
      }
    })
  }, [filteredInfluencers, sortBy])

  // 카테고리별 색상
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '패션': 'bg-purple-100 text-purple-700',
      '뷰티': 'bg-pink-100 text-pink-700',
      '여행': 'bg-blue-100 text-blue-700',
      '음식': 'bg-orange-100 text-orange-700',
      '피트니스': 'bg-green-100 text-green-700',
      '테크': 'bg-indigo-100 text-indigo-700',
      '육아': 'bg-yellow-100 text-yellow-700',
      '라이프스타일': 'bg-teal-100 text-teal-700'
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-4 sm:py-6">
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 - 애니메이션 추가 */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b transition-all duration-300">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                광고주 대시보드
              </h1>
              <Badge className="bg-green-100 text-green-700 text-xs sm:text-sm animate-fade-in">
                <Sparkles className="h-3 w-3 mr-1" />
                {influencers.length}명 등록
              </Badge>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => fetchInfluencers(true)}
                disabled={refreshing}
                className="h-8 w-8 sm:h-9 sm:w-9 transition-all hover:scale-105"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSignOut}
                className="h-8 w-8 sm:h-9 sm:w-9 transition-all hover:scale-105 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6">
        {/* 검색 및 필터 - 향상된 인터랙션 */}
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 transition-all hover:shadow-md">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              <Input
                type="text"
                placeholder="실시간 검색 (이름, @핸들, 소개)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 pr-10 text-sm sm:text-base focus:ring-2 focus:ring-green-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {debouncedSearchTerm && debouncedSearchTerm !== searchTerm && (
                <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                  검색 중...
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`text-sm sm:text-base relative transition-all ${showFilters ? 'bg-green-50 border-green-300' : ''}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              필터
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 px-1.5 py-0 text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white animate-pulse">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* 필터 옵션 - 애니메이션과 향상된 UI */}
          <div className={`overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-96' : 'max-h-0'}`}>
            <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs sm:text-sm font-medium flex items-center gap-1">
                    <span className="text-lg">🏷️</span> 카테고리
                  </Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="text-sm sm:text-base hover:border-green-300 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat} className="hover:bg-green-50">
                          <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(cat)}`}>
                            {cat}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs sm:text-sm font-medium">팔로워 규모</Label>
                  <Select value={followerTier} onValueChange={setFollowerTier}>
                    <SelectTrigger className="text-sm sm:text-base hover:border-green-300 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {followerTierOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="hover:bg-green-50">
                          <span className="flex items-center gap-2">
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs sm:text-sm font-medium">정렬</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="text-sm sm:text-base hover:border-green-300 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="hover:bg-green-50">
                          <span className="flex items-center gap-2">
                            <opt.icon className="h-4 w-4" />
                            <span>{opt.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  <X className="h-3 w-3 mr-1" />
                  모든 필터 초기화
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 검색 결과 수 표시 */}
        {debouncedSearchTerm && (
          <div className="mb-4 text-sm text-gray-600 animate-fade-in">
            "{debouncedSearchTerm}" 검색 결과: {filteredInfluencers.length}명
          </div>
        )}

        {/* 인플루언서 그리드 - 향상된 애니메이션과 인터랙션 */}
        {sortedInfluencers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {sortedInfluencers.map((influencer, index) => (
              <Card 
                key={influencer.id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => router.push(`/advertiser/influencer/${influencer.id}`)}
              >
                {/* 커버 이미지 영역 - 향상된 호버 효과 */}
                <div className="relative aspect-[4/3] sm:aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-110">
                    {!imageLoadErrors.has(influencer.id) && (influencer.cover_image || influencer.portfolio_urls?.[0]) ? (
                      <img 
                        src={influencer.cover_image || influencer.portfolio_urls?.[0]} 
                        alt={influencer.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={() => handleImageError(influencer.id)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 flex items-center justify-center">
                        <Instagram className="h-8 w-8 sm:h-12 sm:w-12 text-green-400 animate-pulse" />
                      </div>
                    )}
                  </div>
                  {/* 그라데이션 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* 좋아요 버튼 - 향상된 애니메이션 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLike(influencer.id, influencer.name)
                    }}
                    className="absolute top-2 right-2 p-2 sm:p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center shadow-lg"
                  >
                    <Heart 
                      className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 ${
                        likedInfluencers.has(influencer.id) 
                          ? 'fill-red-500 text-red-500 scale-110' 
                          : 'text-gray-600 hover:text-red-500'
                      }`}
                    />
                  </button>
                  
                  {/* 라이브 배지 */}
                  {influencer.is_active && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1 animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      LIVE
                    </div>
                  )}
                </div>
                
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    {/* 프로필 이미지 - 호버 효과 추가 */}
                    <div className="relative group/avatar">
                      {!imageLoadErrors.has(`profile-${influencer.id}`) && influencer.profile_image ? (
                        <img 
                          src={influencer.profile_image} 
                          alt={influencer.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200 group-hover/avatar:border-green-400 transition-all duration-300"
                          loading="lazy"
                          onError={() => handleImageError(`profile-${influencer.id}`)}
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center group-hover/avatar:scale-110 transition-transform duration-300">
                          <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                      )}
                      {/* 온라인 인디케이터 */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate flex items-center gap-1 group-hover:text-green-600 transition-colors">
                        {influencer.name}
                        {influencer.is_active && (
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                        )}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate hover:text-green-600 transition-colors">
                        @{influencer.instagram_handle}
                      </p>
                      {influencer.location && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {influencer.location}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* 카테고리 뱃지 - 색상 적용 */}
                  {influencer.category && (
                    <Badge className={`mt-2 text-xs ${getCategoryColor(influencer.category)}`}>
                      {influencer.category}
                    </Badge>
                  )}
                  
                  {/* 소개 텍스트 - 툴팁 추가 */}
                  {influencer.bio && (
                    <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-1 sm:line-clamp-2 hover:line-clamp-none transition-all" title={influencer.bio}>
                      {influencer.bio}
                    </p>
                  )}
                  
                  {/* 통계 - 애니메이션 추가 */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3">
                    <div className="group/stat cursor-pointer">
                      <p className="text-[10px] sm:text-xs text-gray-500 group-hover/stat:text-green-600 transition-colors">
                        팔로워
                      </p>
                      <p className="font-semibold text-sm sm:text-base group-hover/stat:scale-105 transition-transform origin-left">
                        {influencer.followers_count ? formatNumber(influencer.followers_count) : '0'}
                      </p>
                    </div>
                    <div className="group/stat cursor-pointer">
                      <p className="text-[10px] sm:text-xs text-gray-500 group-hover/stat:text-green-600 transition-colors">
                        참여율
                      </p>
                      <p className="font-semibold text-sm sm:text-base group-hover/stat:scale-105 transition-transform origin-left">
                        {influencer.engagement_rate || 0}%
                      </p>
                    </div>
                  </div>

                  <Link href={`/advertiser/influencer/${influencer.id}`}>
                    <Button 
                      className="w-full mt-3 text-xs sm:text-sm h-8 sm:h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 hover:shadow-lg" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      프로필 상세보기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 sm:p-12 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
              <div className="relative inline-block">
                <Users className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-4" />
                <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
                  😢
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                {searchTerm || categoryFilter !== '전체' || followerTier !== 'all' 
                  ? '검색 결과가 없습니다' 
                  : '등록된 인플루언서가 없습니다'}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-6">
                {searchTerm || categoryFilter !== '전체' || followerTier !== 'all'
                  ? '다른 필터 조건을 시도해보세요'
                  : '인플루언서들이 가입하면 여기에 표시됩니다'}
              </p>
              {(searchTerm || categoryFilter !== '전체' || followerTier !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-3 sm:mt-4 text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
                  onClick={clearAllFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  필터 초기화
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* 좋아요한 인플루언서 섹션 */}
        {likedInfluencers.size > 0 && (
          <div className="mt-8 p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-xl border border-pink-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                관심 인플루언서
              </h3>
              <Badge className="bg-red-100 text-red-700">
                {likedInfluencers.size}명
              </Badge>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from(likedInfluencers).map(id => {
                const influencer = influencers.find(i => i.id === id)
                if (!influencer) return null
                return (
                  <Button
                    key={id}
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/advertiser/influencer/${id}`)}
                    className="flex items-center gap-2 shrink-0 hover:bg-white hover:border-red-300"
                  >
                    {influencer.profile_image ? (
                      <img 
                        src={influencer.profile_image} 
                        alt={influencer.name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-pink-400 rounded-full" />
                    )}
                    <span className="text-xs">{influencer.name}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* 플로팅 액션 버튼 (모바일) */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}