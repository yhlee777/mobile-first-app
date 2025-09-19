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
  LogOut,
  CheckCircle,
  MapPin,
  Users,
  RefreshCw,
  UserCircle,
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
  const [sortBy, setSortBy] = useState<'팔로워순' | '참여율순'>('팔로워순')
  const [showFilters, setShowFilters] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadInfluencersAndProfile()
  }, [])

  const loadInfluencersAndProfile = async () => {
    try {
      setLoading(true)
      
      // 현재 사용자 정보 로드
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from('influencers')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (profileData) {
          setCurrentUser(profileData)
          
          // 프로필 완성도 계산
          let score = 0
          if (profileData.name) score += 20
          if (profileData.bio) score += 20
          if (profileData.category) score += 20
          if (profileData.location) score += 10
          if (profileData.profile_image) score += 10
          if (profileData.portfolio_urls?.length > 0) score += 20
          setCompletionScore(score)
        }
      }
      
      // 모든 인플루언서 로드 (본인 제외)
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

      {/* 검색 및 필터 */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 bg-white border-b">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="이름으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 h-9 text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 h-9"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* 필터 옵션 - 토글 방식 */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1.5 block">카테고리</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 text-xs">
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
                <Label className="text-xs mb-1.5 block">지역</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
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
                    {followerTiers.map(tier => (
                      <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">정렬</Label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="팔로워순">팔로워순</SelectItem>
                    <SelectItem value="참여율순">참여율순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 프로필 완성도 알림 */}
      {!isProfileComplete && (
        <div className="px-3 sm:px-4 py-2 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-amber-800 font-medium">
                프로필 완성도: {completionScore}%
              </p>
              <div className="w-full bg-amber-200 rounded-full h-1.5 mt-1">
                <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${completionScore}%` }} />
              </div>
            </div>
            <Link href="/profile/edit">
              <Button variant="outline" size="sm" className="ml-4 text-xs">
                프로필 완성하기
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 결과 카운트 */}
      <div className="px-3 sm:px-4 py-2 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-gray-600">
            총 <span className="font-semibold text-gray-900">{filteredInfluencers.length}</span>명의 인플루언서
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadInfluencersAndProfile()}
            className="text-xs p-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 인플루언서 그리드 */}
      <main className="px-3 sm:px-4 py-4">
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
                    <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      {influencer.profile_image ? (
                        <img 
                          src={influencer.profile_image} 
                          alt={influencer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                      )}
                    </div>

                    <div className="absolute bottom-1.5 left-1.5 z-10">
                      <Badge className={`text-[10px] px-1.5 py-0.5 border ${categoryColors[influencer.category] || categoryColors['기타']}`}>
                        {influencer.category || '미정'}
                      </Badge>
                    </div>
                  </div>

                  {/* 정보 영역 - 컴팩트하게 조정 */}
                  <div className="p-2.5 flex flex-col flex-1">
                    {/* 이름 영역 */}
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">
                        {influencer.name || '이름 미설정'}
                      </h3>
                      {influencer.is_verified && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* 위치 영역 */}
                    <div className="flex items-center gap-1 mb-1.5">
                      {influencer.location ? (
                        <>
                          <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="text-xs text-gray-500 truncate">{influencer.location}</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">위치 미설정</span>
                      )}
                    </div>

                    {/* 팔로워/참여율 영역 */}
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[10px] text-gray-500 block">팔로워</span>
                        <div className="font-semibold text-gray-900 text-xs">
                          {formatFollowers(influencer.followers_count)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block">참여율</span>
                        <div className="font-semibold text-gray-900 text-xs">
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
            <p className="text-gray-500 text-lg mb-2">검색 결과가 없습니다</p>
            <p className="text-sm text-gray-400">다른 검색 조건을 시도해보세요</p>
          </div>
        )}
      </main>
    </div>
  )
}