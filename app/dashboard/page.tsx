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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Heart, 
  LogOut,
  CheckCircle,
  MapPin,
  Users,
  RefreshCw,
  ArrowRight,
  UserCircle,
  Loader2,
  Sparkles,
  Zap,
  TrendingUp
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
  is_verified?: boolean
  is_active?: boolean
  portfolio_urls?: string[]
}

interface CurrentUser {
  id: string
  name: string
  instagram_handle: string
  bio?: string
  category?: string
  location?: string
  profile_image?: string
  portfolio_urls?: string[]
  followers_count?: number
  engagement_rate?: number
}

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

export default function InfluencerDashboard() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [completionScore, setCompletionScore] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [followerTier, setFollowerTier] = useState('전체')
  const [locationFilter, setLocationFilter] = useState('전체')
  const [sortBy, setSortBy] = useState<'팔로워순' | '참여율순' | '최신순'>('팔로워순')
  const [showFilters, setShowFilters] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadInfluencers()
    checkCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      calculateCompletion()
    }
  }, [currentUser])

  const calculateCompletion = () => {
    if (!currentUser) return
    
    let score = 0
    const fields = [
      { value: currentUser.name, weight: 20 },
      { value: currentUser.instagram_handle, weight: 20 },
      { value: currentUser.category, weight: 20 },
      { value: currentUser.bio, weight: 20 },
      { value: currentUser.profile_image, weight: 10 },
      { value: (currentUser.followers_count || 0) > 0, weight: 5 },
      { value: (currentUser.engagement_rate || 0) > 0, weight: 5 }
    ]
    
    fields.forEach(field => {
      if (field.value) score += field.weight
    })
    
    // 포트폴리오는 별도 처리
    const portfolioCount = currentUser.portfolio_urls?.length || 0
    if (portfolioCount >= 3) {
      score = Math.min(100, score + 10)
    } else if (portfolioCount >= 1) {
      score = Math.min(100, score + 5)
    }
    
    setCompletionScore(Math.min(100, score))
  }

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    
    const { data } = await supabase
      .from('influencers')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (data) {
      setCurrentUser({
        id: data.id,
        name: data.name,
        instagram_handle: data.instagram_handle,
        bio: data.bio,
        category: data.category,
        location: data.location,
        profile_image: data.profile_image,
        portfolio_urls: data.portfolio_urls,
        followers_count: data.followers_count,
        engagement_rate: data.engagement_rate
      })
    }
  }

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
        // 현재 사용자 제외
        const filteredData = currentUser 
          ? data.filter(inf => inf.id !== currentUser.id)
          : data
        setInfluencers(filteredData)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatFollowers = (count: number): string => {
    if (!count) return '0'
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 10000) return `${Math.floor(count / 1000)}K`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => 
      prev.includes(id) 
        ? prev.filter(fId => fId !== id)
        : [...prev, id]
    )
  }

  const filteredInfluencers = influencers.filter(influencer => {
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
      case '팔로워순': return (b.followers_count || 0) - (a.followers_count || 0)
      case '참여율순': return (b.engagement_rate || 0) - (a.engagement_rate || 0)
      default: return 0
    }
  })

  const isProfileComplete = completionScore >= 100

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
      {/* 프로필 완성도 배너 */}
      {!isProfileComplete && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b-2 border-yellow-200">
          <div className="px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-yellow-200 rounded-full shadow-sm">
                  <Sparkles className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold mb-1 text-gray-800">
                    프로필을 완성해보세요!
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-2">
                    현재 완성도 <span className="text-yellow-600 font-bold">{completionScore}%</span>
                  </p>
                  <div className="w-full sm:w-80 bg-white rounded-full h-2.5 shadow-inner border border-yellow-200">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${completionScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    광고주들에게 더 많은 관심을 받으려면 프로필을 완성하세요
                  </p>
                </div>
              </div>
              <Link href="/profile/edit">
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  지금 완성하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 프로필 완성 시 성공 배너 */}
      {isProfileComplete && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
          <div className="px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-200 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-green-800">
                  🎉 프로필 완성! 이제 광고주들이 당신을 발견할 준비가 되었습니다.
                </p>
              </div>
              <Link href="/profile/edit">
                <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800">
                  프로필 수정
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">인플루언서 둘러보기</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">다른 인플루언서들을 만나보세요</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/profile/edit">
                <Button
                  variant="outline"
                  size="sm"
                  className="p-2"
                >
                  <UserCircle className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="p-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 검색 및 필터 - 기존과 동일 */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 bg-white border-b">
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

        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {(['팔로워순', '참여율순', '최신순'] as const).map((sort) => (
            <Button
              key={sort}
              variant={sortBy === sort ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy(sort)}
              className={`h-8 text-xs whitespace-nowrap flex-shrink-0 ${
                sortBy === sort ? 'brand-primary brand-primary-hover text-white' : ''
              }`}
            >
              {sort}
            </Button>
          ))}
        </div>

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

      {/* 인플루언서 목록 - 기존과 동일 */}
      <main className="px-3 sm:px-4 py-4 sm:py-6">
        {filteredInfluencers.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredInfluencers.map((influencer) => (
              <Card key={influencer.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
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
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white p-0 shadow-md"
                      onClick={() => toggleFavorite(influencer.id)}
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

                  <div className="p-3 flex flex-col flex-1">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">
                          {influencer.name || '이름 미설정'}
                        </h3>
                        {influencer.is_verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        @{influencer.instagram_handle}
                      </div>

                      {influencer.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="text-xs text-gray-500 truncate">{influencer.location}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500">팔로워</span>
                          <div className="font-semibold text-gray-900 text-sm">
                            {formatFollowers(influencer.followers_count)}
                          </div>
                        </div>
                        {influencer.engagement_rate && (
                          <div className="text-right">
                            <span className="text-xs text-gray-500">참여율</span>
                            <div className="font-semibold text-gray-900 text-sm">
                              {influencer.engagement_rate}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link href={`/advertiser/influencer/${influencer.id}`} className="mt-3">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full h-10 text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
                      >
                        프로필 보기
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {loading ? '로딩 중...' : '인플루언서가 없습니다'}
            </p>
            <p className="text-sm text-gray-400">
              {!loading && '필터 조건을 변경해보세요'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}