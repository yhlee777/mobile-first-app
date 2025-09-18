'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
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
  LogOut,
  X,
  CheckCircle,
  AlertCircle,
  Instagram,
  Eye
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
    name: '방방뷔',
    instagram_handle: 'bangbangvui',
    bio: '서울시 성동구 | 26대 여성',
    category: '일상',
    location: '서울',
    followers_count: 20000,
    engagement_rate: 4.2,
    profile_picture_url: '/api/placeholder/80/80',
    is_verified: true,
    media_urls: ['/api/placeholder/200/200']
  },
  {
    id: '2', 
    name: '아이유 (IU)',
    instagram_handle: 'dlwlrma',
    bio: '서울',
    category: '셀럽',
    location: '서울',
    followers_count: 32000000,
    engagement_rate: 8.5,
    profile_picture_url: '/api/placeholder/80/80',
    is_verified: false,
    media_urls: []
  },
  {
    id: '3',
    name: '제시카 (Jessica)',
    instagram_handle: 'jessica.syj',
    bio: '서울',
    category: '패션',
    location: '서울',
    followers_count: 11934011,
    engagement_rate: 5.2,
    profile_picture_url: '/api/placeholder/80/80',
    is_verified: false,
    media_urls: []
  },
  {
    id: '4',
    name: '포니 (PONY)',
    instagram_handle: 'ponysmakeup',
    bio: '서울',
    category: '뷰티',
    location: '서울',
    followers_count: 8746801,
    engagement_rate: 6.8,
    profile_picture_url: '/api/placeholder/80/80',
    is_verified: false,
    media_urls: []
  },
  {
    id: '5',
    name: '오늘의집',
    instagram_handle: 'todayhouse',
    bio: '서울',
    category: '라이프스타일',
    location: '서울',
    followers_count: 1311961,
    engagement_rate: 3.9,
    profile_picture_url: '/api/placeholder/80/80',
    is_verified: true,
    media_urls: []
  },
  {
    id: '6',
    name: '리사베',
    instagram_handle: 'risabae',
    bio: '서울',
    category: '뷰티',
    location: '서울',
    followers_count: 1303371,
    engagement_rate: 4.7,
    profile_picture_url: '/api/placeholder/80/80',
    is_verified: false,
    media_urls: []
  },
  {
    id: '7',
    name: '심으뜸',
    instagram_handle: 'simeuttem',
    bio: '서울',
    category: '라이프스타일',
    location: '서울',
    followers_count: 831538,
    engagement_rate: 5.5,
    profile_picture_url: '/api/placeholder/80/80',
    is_verified: false,
    media_urls: []
  }
]

const categories = ['전체', '패션', '뷰티', '라이프스타일', '여행', '음식', '피트니스', '일상', '셀럽']
const locations = ['전체', '서울', '경기', '부산', '대구', '인천', '광주', '대전']

export default function AdvertiserPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [locationFilter, setLocationFilter] = useState('전체')
  const [showFilters, setShowFilters] = useState(false)
  const [likedInfluencers, setLikedInfluencers] = useState<Set<string>>(new Set())
  const [useMockData] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchInfluencers()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
    }
  }

  const fetchInfluencers = async () => {
    setLoading(true)
    if (useMockData) {
      setInfluencers(getMockInfluencers())
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('influencers')
      .select('*')
      .order('followers_count', { ascending: false })

    if (!error && data) {
      setInfluencers(data)
    }
    setLoading(false)
  }

  const filteredInfluencers = influencers.filter(inf => {
    const matchesSearch = inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inf.instagram_handle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === '전체' || inf.category === categoryFilter
    const matchesLocation = locationFilter === '전체' || inf.location === locationFilter
    
    return matchesSearch && matchesCategory && matchesLocation
  })

  const toggleLike = (id: string) => {
    setLikedInfluencers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      '패션': 'bg-purple-100 text-purple-700',
      '뷰티': 'bg-pink-100 text-pink-700',
      '여행': 'bg-blue-100 text-blue-700',
      '음식': 'bg-orange-100 text-orange-700',
      '피트니스': 'bg-green-100 text-green-700',
      '일상': 'bg-gray-100 text-gray-700',
      '라이프스타일': 'bg-yellow-100 text-yellow-700',
      '셀럽': 'bg-red-100 text-red-700'
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold">
            인플루언서
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/advertiser/likes">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="bg-white border-b px-4">
        <div className="container mx-auto flex gap-6 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`py-3 px-1 border-b-2 whitespace-nowrap text-sm ${
                categoryFilter === cat 
                  ? 'border-green-600 text-green-600 font-medium' 
                  : 'border-transparent text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-3">
        <div className="container mx-auto flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              placeholder="인플루언서 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters (if shown) */}
      {showFilters && (
        <div className="bg-white border-b px-4 py-3">
          <div className="container mx-auto">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-xs mb-1 block">지역</Label>
                <select
                  className="w-full px-3 py-2 text-sm border rounded-md"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            {/* Mobile: 2 columns, Desktop: 3 columns */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {filteredInfluencers.map(influencer => (
                <Card key={influencer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/advertiser/influencer/${influencer.id}`}>
                    <CardContent className="p-4 md:p-6">
                      {/* Profile Section */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={influencer.profile_picture_url || '/api/placeholder/60/60'}
                              alt={influencer.name}
                              className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover"
                            />
                            {influencer.is_verified && (
                              <CheckCircle className="absolute -bottom-1 -right-1 h-4 w-4 text-blue-500 bg-white rounded-full" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm md:text-base truncate">
                              {influencer.name}
                            </h3>
                            <p className="text-xs text-gray-500">서울</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            toggleLike(influencer.id)
                          }}
                          className="p-1"
                        >
                          <Heart 
                            className={`h-5 w-5 ${
                              likedInfluencers.has(influencer.id) 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-gray-400'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Stats */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">팔로워</p>
                          <p className="text-lg md:text-xl font-bold">
                            {formatNumber(influencer.followers_count)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">참여율</span>
                          <span className="text-xs font-medium">{influencer.engagement_rate}%</span>
                        </div>

                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(influencer.category)}`}>
                            {influencer.category}
                          </span>
                          {influencer.is_verified && (
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                              활동중
                            </span>
                          )}
                        </div>
                      </div>

                      {/* View Details Button */}
                      <div className="mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          자세히 보기
                        </Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {filteredInfluencers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">검색 결과가 없습니다</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}