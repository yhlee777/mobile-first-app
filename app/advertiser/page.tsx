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
  MapPin, 
  ChevronDown, 
  LogOut, 
  X,
  CheckCircle,
  AlertCircle,
  Instagram,
  Camera,
  ExternalLink,
  User
} from 'lucide-react'

interface Influencer {
  id: string
  instagram_handle: string
  name: string
  bio: string
  category: string
  location?: string
  followers_count: number
  engagement_rate: number
  profile_picture_url?: string
  is_verified?: boolean
  media_urls?: string[]
}

const getMockInfluencers = (): Influencer[] => [
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
    engagement_rate: 5.1,
    is_verified: false
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
    engagement_rate: 6.2,
    is_verified: false
  }
]

const categories = ['전체', '패션', '뷰티', '음식', '여행', '피트니스', '테크', '라이프스타일']
const locations = ['전체', '서울', '부산', '대구', '인천', '광주', '대전', '제주']

export default function AdvertiserPage() {
  const router = useRouter()
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [locationFilter, setLocationFilter] = useState('전체')
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null)
  const [useMockData, setUseMockData] = useState(false)

  useEffect(() => {
    fetchInfluencers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [influencers, searchTerm, categoryFilter, locationFilter])

  const fetchInfluencers = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('No user, using mock data')
        setInfluencers(getMockInfluencers())
        setUseMockData(true)
        setLoading(false)
        return
      }
      
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
      
      if (error || !data || data.length === 0) {
        console.log('No data, using mock')
        setInfluencers(getMockInfluencers())
        setUseMockData(true)
      } else {
        setInfluencers(data)
        setUseMockData(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setInfluencers(getMockInfluencers())
      setUseMockData(true)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...influencers]
    
    if (searchTerm) {
      filtered = filtered.filter(inf => 
        inf.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inf.instagram_handle?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (categoryFilter !== '전체') {
      filtered = filtered.filter(inf => inf.category === categoryFilter)
    }
    
    if (locationFilter !== '전체') {
      filtered = filtered.filter(inf => inf.location === locationFilter)
    }
    
    setFilteredInfluencers(filtered)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleInstagramClick = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation()
    window.open(`https://www.instagram.com/${handle}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-green-600">
              itda
            </Link>
            <span className="text-sm">광고주 대시보드</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {useMockData && (
        <div className="bg-yellow-50 border-b px-4 py-2">
          <div className="container mx-auto flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm">샘플 데이터를 표시 중입니다</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="검색..."
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
                필터
              </Button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div>
                  <Label>카테고리</Label>
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
                  <Label>지역</Label>
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
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfluencers.map((influencer) => (
            <Card key={influencer.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-1">
                      {influencer.name}
                      {influencer.is_verified && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </h3>
                    <button
                      onClick={(e) => handleInstagramClick(e, influencer.instagram_handle)}
                      className="text-sm text-green-600 hover:text-green-700 inline-flex items-center gap-1"
                    >
                      @{influencer.instagram_handle}
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{influencer.bio}</p>
                
                <div className="flex gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    {influencer.category}
                  </span>
                  {influencer.location && (
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
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
      </div>

      {selectedInfluencer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>인플루언서 프로필</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInfluencer(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                    <Instagram className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedInfluencer.name}</h2>
                    <button
                      onClick={(e) => handleInstagramClick(e, selectedInfluencer.instagram_handle)}
                      className="text-green-600 hover:text-green-700 inline-flex items-center gap-1"
                    >
                      @{selectedInfluencer.instagram_handle}
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                        {selectedInfluencer.category}
                      </span>
                      {selectedInfluencer.location && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {selectedInfluencer.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {formatNumber(selectedInfluencer.followers_count)}
                    </p>
                    <p className="text-sm text-gray-500">팔로워</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {selectedInfluencer.engagement_rate}%
                    </p>
                    <p className="text-sm text-gray-500">참여율</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">소개</h3>
                  <p className="text-gray-600">{selectedInfluencer.bio}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">포트폴리오</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div 
                        key={i} 
                        className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center"
                      >
                        <Camera className="h-6 w-6 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" size="lg" className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  찜하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}