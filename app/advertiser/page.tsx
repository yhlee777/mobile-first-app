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
  Instagram,
  MapPin,
  Users,
  RefreshCw
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
}

const categories = ['전체', '패션', '뷰티', '라이프스타일', '여행', '음식', '피트니스', '테크', '육아', '기타']
const followerTierOptions = [
  { value: 'all', label: '전체' },
  { value: 'nano', label: '나노 (1K-10K)' },
  { value: 'micro', label: '마이크로 (10K-100K)' },
  { value: 'macro', label: '매크로 (100K-1M)' },
  { value: 'mega', label: '메가 (1M+)' }
]
const sortOptions = [
  { value: 'followers', label: '팔로워순' },
  { value: 'engagement', label: '참여율순' },
  { value: 'recent', label: '최신순' }
]

export default function AdvertiserPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [followerTier, setFollowerTier] = useState('all')
  const [sortBy, setSortBy] = useState('followers')
  const [showFilters, setShowFilters] = useState(false)
  const [likedInfluencers, setLikedInfluencers] = useState<Set<string>>(new Set())
  const [useMockData, setUseMockData] = useState(false) // 목 데이터 사용 여부
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchInfluencers()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const fetchInfluencers = async () => {
    setLoading(true)
    try {
      console.log('🔍 인플루언서 데이터 가져오는 중...')
      
      // 실제 데이터베이스에서 인플루언서 가져오기
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('is_active', true)  // 활성 상태인 인플루언서만
        .order('followers_count', { ascending: false })
      
      if (error) {
        console.error('❌ 인플루언서 조회 에러:', error)
        throw error
      }
      
      console.log('✅ 인플루언서 데이터:', data)
      
      if (data && data.length > 0) {
        setInfluencers(data)
        console.log(`📊 총 ${data.length}명의 인플루언서 로드`)
      } else {
        console.log('⚠️ 등록된 인플루언서가 없습니다')
        setInfluencers([])
      }
      
    } catch (error: any) {
      console.error('Error fetching influencers:', error)
      // 에러 발생 시 빈 배열로 설정
      setInfluencers([])
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = (id: string) => {
    const newLiked = new Set(likedInfluencers)
    if (newLiked.has(id)) {
      newLiked.delete(id)
    } else {
      newLiked.add(id)
    }
    setLikedInfluencers(newLiked)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // 필터링 로직
  const filteredInfluencers = influencers.filter(inf => {
    const matchesSearch = inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inf.instagram_handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inf.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    
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

  // 정렬
  const sortedInfluencers = [...filteredInfluencers].sort((a, b) => {
    if (sortBy === 'followers') {
      return b.followers_count - a.followers_count
    } else if (sortBy === 'engagement') {
      return (b.engagement_rate || 0) - (a.engagement_rate || 0)
    } else {
      // 최신순 (ID 기준)
      return b.id.localeCompare(a.id)
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">광고주 대시보드</h1>
              <Badge className="bg-green-100 text-green-700">
                {influencers.length}명 등록
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchInfluencers}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="인플루언서 검색 (이름, @핸들, 소개)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              필터 ({filteredInfluencers.length})
            </Button>
            <Button
              onClick={fetchInfluencers}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          </div>

          {/* 필터 옵션 */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t">
              <div>
                <Label className="text-xs">카테고리</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9">
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
                <Label className="text-xs">팔로워</Label>
                <Select value={followerTier} onValueChange={setFollowerTier}>
                  <SelectTrigger className="h-9">
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
                <Label className="text-xs">정렬</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* 인플루언서 그리드 */}
        {sortedInfluencers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedInfluencers.map(influencer => (
              <Card key={influencer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {/* 커버 이미지 또는 포트폴리오 첫 번째 이미지 */}
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {influencer.cover_image || influencer.portfolio_urls?.[0] ? (
                      <img 
                        src={influencer.cover_image || influencer.portfolio_urls?.[0]} 
                        alt={influencer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                        <Instagram className="h-12 w-12 text-green-400" />
                      </div>
                    )}
                    {/* 좋아요 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(influencer.id)
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition"
                    >
                      <Heart 
                        className={`h-5 w-5 ${likedInfluencers.has(influencer.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                      />
                    </button>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* 프로필 이미지 */}
                    {influencer.profile_image ? (
                      <img 
                        src={influencer.profile_image}
                        alt={influencer.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-green-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                        {influencer.name?.charAt(0) || 'I'}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold">{influencer.name || '이름 미설정'}</h3>
                      </div>
                      <p className="text-sm text-gray-500">@{influencer.instagram_handle}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {influencer.bio || '소개가 없습니다'}
                  </p>

                  {/* 카테고리 뱃지 */}
                  {influencer.category && (
                    <div className="mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {influencer.category}
                      </Badge>
                    </div>
                  )}

                  {/* 통계 */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500">팔로워</p>
                      <p className="font-semibold">
                        {influencer.followers_count ? formatNumber(influencer.followers_count) : '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">참여율</p>
                      <p className="font-semibold">{influencer.engagement_rate || 0}%</p>
                    </div>
                  </div>

                  <Link href={`/advertiser/influencer/${influencer.id}`}>
                    <Button className="w-full mt-4" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      프로필 보기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm || categoryFilter !== '전체' || followerTier !== 'all' 
                  ? '검색 결과가 없습니다' 
                  : '등록된 인플루언서가 없습니다'}
              </h3>
              <p className="text-gray-500 text-sm">
                {searchTerm || categoryFilter !== '전체' || followerTier !== 'all'
                  ? '필터 조건을 변경해보세요'
                  : '인플루언서들이 가입하면 여기에 표시됩니다'}
              </p>
              {(searchTerm || categoryFilter !== '전체' || followerTier !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('')
                    setCategoryFilter('전체')
                    setFollowerTier('all')
                  }}
                >
                  필터 초기화
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* 디버그 정보 (개발 환경) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs">
            <p className="font-semibold mb-2">🔧 디버그 정보:</p>
            <p>총 인플루언서: {influencers.length}명</p>
            <p>필터링 후: {filteredInfluencers.length}명</p>
            <p>표시 중: {sortedInfluencers.length}명</p>
            <Button 
              size="sm" 
              variant="outline"
              className="mt-2"
              onClick={() => setUseMockData(!useMockData)}
            >
              {useMockData ? '실제 데이터 사용' : '목 데이터 사용'}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}