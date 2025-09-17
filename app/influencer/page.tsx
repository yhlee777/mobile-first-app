'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatNumber } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Heart, 
  MessageCircle, 
  Users, 
  User,
  TrendingUp, 
  MapPin, 
  ChevronDown, 
  LogOut, 
  Sparkles, 
  X,
  CheckCircle,
  AlertCircle 
} from 'lucide-react'

interface Influencer {
  id: string
  instagram_handle: string
  name: string
  bio: string
  category: string
  location: string
  followers_count: number
  engagement_rate: number
  profile_picture_url?: string
  is_verified?: boolean
}

// Mock 데이터
const mockInfluencers: Influencer[] = [
  {
    id: '1',
    name: '김민지',
    instagram_handle: 'minji_fashion',
    bio: '일상 속 특별한 순간을 담는 패션 인플루언서입니다.',
    category: '패션',
    location: '서울',
    followers_count: 52000,
    engagement_rate: 3.8,
    is_verified: true
  },
  {
    id: '2',
    name: '이서윤',
    instagram_handle: 'seoyoon_beauty',
    bio: '10년차 메이크업 아티스트가 알려주는 뷰티 팁',
    category: '뷰티',
    location: '서울',
    followers_count: 128000,
    engagement_rate: 4.2,
    is_verified: true
  },
  {
    id: '3',
    name: '박지훈',
    instagram_handle: 'jihoon_food',
    bio: '맛집 탐방가, 전국 맛집을 소개합니다',
    category: '음식',
    location: '부산',
    followers_count: 89000,
    engagement_rate: 5.1
  },
  {
    id: '4',
    name: '최유나',
    instagram_handle: 'yuna_travel',
    bio: '세계 각국을 여행하며 특별한 순간을 기록합니다',
    category: '여행',
    location: '제주',
    followers_count: 234000,
    engagement_rate: 3.5,
    is_verified: true
  },
  {
    id: '5',
    name: '정민수',
    instagram_handle: 'minsu_fit',
    bio: '건강한 라이프스타일을 추구하는 피트니스 코치',
    category: '피트니스',
    location: '서울',
    followers_count: 67000,
    engagement_rate: 6.2
  },
  {
    id: '6',
    name: '강하늘',
    instagram_handle: 'sky_tech',
    bio: '최신 테크 리뷰와 IT 트렌드를 소개합니다',
    category: '테크',
    location: '판교',
    followers_count: 45000,
    engagement_rate: 2.9
  },
  {
    id: '7',
    name: '김소연',
    instagram_handle: 'soyeon_lifestyle',
    bio: '미니멀 라이프와 인테리어를 사랑하는 일상 크리에이터',
    category: '라이프스타일',
    location: '서울',
    followers_count: 156000,
    engagement_rate: 4.8,
    is_verified: true
  },
  {
    id: '8',
    name: '이준호',
    instagram_handle: 'junho_game',
    bio: '게임 스트리머 & 콘텐츠 크리에이터',
    category: '게임',
    location: '서울',
    followers_count: 312000,
    engagement_rate: 7.1,
    is_verified: true
  }
]

const categories = ['전체', '패션', '뷰티', '음식', '여행', '피트니스', '테크', '라이프스타일', '게임']
const locations = ['전체', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '경기', '강원', '충청', '전라', '경상', '제주']
const followerRanges = [
  { label: '전체', value: '0' },
  { label: '1만+', value: '10000' },
  { label: '5만+', value: '50000' },
  { label: '10만+', value: '100000' },
  { label: '50만+', value: '500000' },
  { label: '100만+', value: '1000000' }
]

export default function AdvertiserPage() {
  const router = useRouter()
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [locationFilter, setLocationFilter] = useState('전체')
  const [followersMin, setFollowersMin] = useState('0')
  const [sortBy, setSortBy] = useState('followers')
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)

  useEffect(() => {
    fetchInfluencers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [influencers, searchTerm, categoryFilter, locationFilter, followersMin, sortBy])

  const fetchInfluencers = async () => {
    try {
      const supabase = createClient()
      
      // 사용자 인증 확인
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      // 인플루언서 데이터 가져오기
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('is_active', true)
      
      if (error) throw error
      
      if (data && data.length > 0) {
        setInfluencers(data)
        setUseMockData(false)
      } else {
        // 데이터가 없으면 mock 데이터 사용
        console.log('No data found, using mock data')
        setInfluencers(mockInfluencers)
        setUseMockData(true)
      }
    } catch (error: any) {
      console.error('Error fetching influencers:', error)
      setError('데이터를 불러오는 중 오류가 발생했습니다. 샘플 데이터를 표시합니다.')
      setInfluencers(mockInfluencers)
      setUseMockData(true)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...influencers]
    
    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(inf => 
        inf.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inf.instagram_handle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inf.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // 카테고리 필터
    if (categoryFilter !== '전체') {
      filtered = filtered.filter(inf => inf.category === categoryFilter)
    }
    
    // 지역 필터
    if (locationFilter !== '전체') {
      filtered = filtered.filter(inf => inf.location === locationFilter)
    }
    
    // 팔로워 수 필터
    const minFollowers = parseInt(followersMin)
    if (minFollowers > 0) {
      filtered = filtered.filter(inf => inf.followers_count >= minFollowers)
    }
    
    // 정렬
    filtered.sort((a, b) => {
      if (sortBy === 'followers') {
        return b.followers_count - a.followers_count
      } else if (sortBy === 'engagement') {
        return b.engagement_rate - a.engagement_rate
      }
      return 0
    })
    
    setFilteredInfluencers(filtered)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">인플루언서를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-green-600">
              itda
            </Link>
            <span className="text-gray-500">|</span>
            <span className="text-sm font-medium">광고주 대시보드</span>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* 알림 배너 */}
      {error && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="container mx-auto max-w-7xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">{error}</span>
            {useMockData && (
              <span className="ml-auto text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                샘플 데이터
              </span>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="이름, 계정, 소개로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                필터
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                <div>
                  <Label className="text-sm mb-2">카테고리</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label className="text-sm mb-2">지역</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label className="text-sm mb-2">최소 팔로워</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={followersMin}
                    onChange={(e) => setFollowersMin(e.target.value)}
                  >
                    {followerRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label className="text-sm mb-2">정렬</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="followers">팔로워 순</option>
                    <option value="engagement">참여율 순</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 결과 수 */}
        <div className="mb-4 text-sm text-gray-600">
          {filteredInfluencers.length}명의 인플루언서를 찾았습니다
        </div>

        {/* 인플루언서 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfluencers.map(influencer => (
            <Card key={influencer.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center gap-1">
                        {influencer.name}
                        {influencer.is_verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </h3>
                      <p className="text-sm text-green-600">@{influencer.instagram_handle}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {influencer.bio}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {influencer.category && (
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {influencer.category}
                    </span>
                  )}
                  {influencer.location && (
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {influencer.location}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500">팔로워</p>
                    <p className="font-semibold">{formatNumber(influencer.followers_count)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">참여율</p>
                    <p className="font-semibold">{influencer.engagement_rate}%</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4"
                  onClick={() => setSelectedInfluencer(influencer)}
                >
                  상세 보기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInfluencers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">조건에 맞는 인플루언서가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedInfluencer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>인플루언서 상세 정보</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedInfluencer(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <User className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedInfluencer.name}</h3>
                    <p className="text-green-600">@{selectedInfluencer.instagram_handle}</p>
                    <p className="text-sm text-gray-600 mt-2">{selectedInfluencer.bio}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">팔로워</p>
                    <p className="text-2xl font-bold">{formatNumber(selectedInfluencer.followers_count)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">참여율</p>
                    <p className="text-2xl font-bold">{selectedInfluencer.engagement_rate}%</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">카테고리</p>
                  <p className="font-medium">{selectedInfluencer.category}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">활동 지역</p>
                  <p className="font-medium">{selectedInfluencer.location}</p>
                </div>
                
                <Button className="w-full">
                  캠페인 제안하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}