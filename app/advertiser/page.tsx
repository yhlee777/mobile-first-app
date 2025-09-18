'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
  CheckCircle
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
const minFollowerOptions = [
  { value: 'all', label: '전체' },
  { value: '10000', label: '1만+' },
  { value: '50000', label: '5만+' },
  { value: '100000', label: '10만+' },
  { value: '500000', label: '50만+' }
]
const sortOptions = [
  { value: 'followers_desc', label: '팔로워 많은순' },
  { value: 'followers_asc', label: '팔로워 적은순' },
  { value: 'engagement_desc', label: '참여율 높은순' },
  { value: 'engagement_asc', label: '참여율 낮은순' }
]

export default function AdvertiserPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [locationFilter, setLocationFilter] = useState('전체')
  const [minFollowers, setMinFollowers] = useState('all')
  const [sortBy, setSortBy] = useState('followers_desc')
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

  const sortInfluencers = (influencers: Influencer[]) => {
    const sorted = [...influencers]
    
    switch (sortBy) {
      case 'followers_desc':
        return sorted.sort((a, b) => b.followers_count - a.followers_count)
      case 'followers_asc':
        return sorted.sort((a, b) => a.followers_count - b.followers_count)
      case 'engagement_desc':
        return sorted.sort((a, b) => b.engagement_rate - a.engagement_rate)
      case 'engagement_asc':
        return sorted.sort((a, b) => a.engagement_rate - b.engagement_rate)
      default:
        return sorted
    }
  }

  const filteredInfluencers = sortInfluencers(
    influencers.filter(inf => {
      const matchesSearch = inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inf.instagram_handle.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === '전체' || inf.category === categoryFilter
      const matchesLocation = locationFilter === '전체' || inf.location === locationFilter
      const matchesMinFollowers = minFollowers === 'all' || inf.followers_count >= parseInt(minFollowers)
      
      return matchesSearch && matchesCategory && matchesLocation && matchesMinFollowers
    })
  )

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
    const colors: Record<string, string> = {
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

  const handleCardClick = (id: string) => {
    router.push(`/advertiser/influencer/${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      {showFilters && (
        <div className="bg-white border-b px-4 py-3">
          <div className="container mx-auto space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs mb-1 block">지역</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-full h-10 text-sm border-gray-300">
                    <SelectValue placeholder="지역 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {locations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">최소팔로워</Label>
                <Select value={minFollowers} onValueChange={setMinFollowers}>
                  <SelectTrigger className="w-full h-10 text-sm border-gray-300">
                    <SelectValue placeholder="팔로워 수" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {minFollowerOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">정렬</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full h-10 text-sm border-gray-300">
                    <SelectValue placeholder="정렬 기준" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setLocationFilter('전체')
                  setMinFollowers('all')
                  setSortBy('followers_desc')
                }}
              >
                초기화
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                적용
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {filteredInfluencers.map(influencer => (
                <Card 
                  key={influencer.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleCardClick(influencer.id)}
                >
                  <CardContent className="p-4 md:p-6">
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
                          e.stopPropagation()
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
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCardClick(influencer.id)
                        }}
                      >
                        자세히 보기
                      </Button>
                    </div>
                  </CardContent>
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