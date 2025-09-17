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
import { Search, Filter, Heart, MessageCircle, Users, TrendingUp, MapPin, ChevronDown, LogOut, Sparkles, X } from 'lucide-react'
import { SelectCustom } from '@/components/ui/select-custom'

interface Influencer {
  id: string
  instagram_handle: string
  full_name: string
  bio: string
  category: string
  location: string
  followers_count: number
  engagement_rate: number
  profile_picture_url: string
  is_verified?: boolean
  influencer_stats?: {
    avg_likes: number
    avg_comments: number
  }[]
}

const categories = ['전체', '패션', '뷰티', '음식', '여행', '피트니스', '테크', '라이프스타일', '게임']
const locations = ['전체', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '경기', '강원', '충청', '전라', '경상', '제주']
const followerRanges = [
  { label: '전체', value: '0' },
  { label: '1만+', value: '10000' },
  { label: '5만+', value: '50000' },
  { label: '10만+', value: '100000' },
  { label: '50만+', value: '500000' },
  { label: '100만+', value: '1000000' },
  { label: '500만+', value: '5000000' },
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

  useEffect(() => {
    fetchInfluencers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [influencers, searchTerm, categoryFilter, locationFilter, followersMin, sortBy])

  const fetchInfluencers = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('influencers')
        .select(`
          *,
          influencer_stats (
            avg_likes,
            avg_comments
          )
        `)
        .eq('is_public', true)
        .order('followers_count', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
      } else {
        if (data && data.length > 0) {
          const processedData = data.map((inf: any) => ({
            ...inf,
            is_verified: inf.is_verified || (inf.followers_count || 0) > 5000000
          }))
          setInfluencers(processedData)
        } else {
          setInfluencers([])
        }
      }
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message || 'Failed to fetch influencers')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...influencers]

    if (searchTerm) {
      filtered = filtered.filter(inf => 
        inf.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inf.instagram_handle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inf.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== '전체') {
      filtered = filtered.filter(inf => inf.category === categoryFilter)
    }

    if (locationFilter !== '전체') {
      filtered = filtered.filter(inf => inf.location === locationFilter)
    }

    if (followersMin && followersMin !== '0') {
      filtered = filtered.filter(inf => (inf.followers_count || 0) >= parseInt(followersMin))
    }

    // 정렬
    filtered.sort((a, b) => {
      if (sortBy === 'followers') {
        return (b.followers_count || 0) - (a.followers_count || 0)
      }
      return (b.engagement_rate || 0) - (a.engagement_rate || 0)
    })

    setFilteredInfluencers(filtered)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '패션': 'bg-purple-100 text-purple-700',
      '뷰티': 'bg-pink-100 text-pink-700',
      '음식': 'bg-orange-100 text-orange-700',
      '여행': 'bg-blue-100 text-blue-700',
      '피트니스': 'bg-green-100 text-green-700',
      '테크': 'bg-gray-100 text-gray-700',
      '라이프스타일': 'bg-yellow-100 text-yellow-700',
      '게임': 'bg-indigo-100 text-indigo-700'
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">인플루언서 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <p className="text-red-500 mb-4">데이터를 불러오는 중 오류가 발생했습니다</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchInfluencers}>다시 시도</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b backdrop-blur-sm bg-white/90">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">인플루언서</h1>
            <span className="text-sm text-gray-500">광고주</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              총 {filteredInfluencers.length}명
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="sticky top-16 z-20 bg-white border-b">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="인플루언서 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-10 px-4"
            >
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
          </div>

       {/* Improved Filter Design */}
{showFilters && (
  <div className="mt-4 overflow-hidden">
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-2">
        <p className="text-xs font-medium text-gray-600">필터 옵션</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1.5 block">카테고리</Label>
            <SelectCustom
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value)}
              options={categories.map(cat => ({ label: cat, value: cat }))}
            />
          </div>
          
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1.5 block">지역</Label>
            <SelectCustom
              value={locationFilter}
              onChange={(value) => setLocationFilter(value)}
              options={locations.map(loc => ({ label: loc, value: loc }))}
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1.5 block">최소 팔로워</Label>
            <SelectCustom
              value={followersMin}
              onChange={(value) => setFollowersMin(value)}
              options={followerRanges}
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1.5 block">정렬</Label>
            <SelectCustom
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              options={[
                { label: '팔로워 순', value: 'followers' },
                { label: '참여율 순', value: 'engagement' }
              ]}
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCategoryFilter('전체')
              setLocationFilter('전체')
              setFollowersMin('0')
              setSortBy('followers')
            }}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            필터 초기화
          </Button>
        </div>
      </div>
    </div>
  </div>
)}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-7xl px-4 py-6">
        {filteredInfluencers.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">인플루언서를 찾을 수 없습니다</p>
              <p className="text-sm text-gray-400 mt-2">
                {influencers.length === 0 
                  ? '등록된 인플루언서가 없습니다' 
                  : '다른 검색어나 필터를 시도해보세요'}
              </p>
              {influencers.length === 0 && (
                <Button 
                  onClick={fetchInfluencers} 
                  className="mt-4"
                  size="sm"
                >
                  새로고침
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredInfluencers.map((influencer) => (
              <Card 
                key={influencer.id} 
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedInfluencer(influencer)}
              >
                <CardContent className="p-0">
                  {/* Profile Header */}
                  <div className="relative p-6 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={influencer.profile_picture_url || `https://ui-avatars.com/api/?name=${influencer.full_name}&background=10b981&color=fff`}
                          alt={influencer.full_name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                        />
                        {influencer.is_verified && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                            <Sparkles className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                          {influencer.full_name}
                        </h3>
                        <p className="text-sm text-gray-500">@{influencer.instagram_handle}</p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {influencer.bio || '프로필 설명이 없습니다'}
                        </p>
                      </div>

                      <Heart className="w-5 h-5 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0" />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="px-6 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">팔로워</p>
                        <p className="font-bold text-gray-900">
                          {formatNumber(influencer.followers_count || 0)}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">참여율</p>
                        <p className="font-bold text-green-600">
                          {(influencer.engagement_rate || 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    {influencer.influencer_stats?.[0] && (
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Heart className="w-3 h-3" />
                          <span>{formatNumber(influencer.influencer_stats[0].avg_likes || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MessageCircle className="w-3 h-3" />
                          <span>{formatNumber(influencer.influencer_stats[0].avg_comments || 0)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="px-6 pb-4 flex flex-wrap gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(influencer.category)}`}>
                      {influencer.category}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {influencer.location}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="p-4 bg-gray-50 border-t">
                    <Button 
                      className="w-full"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/influencer/${influencer.id}`)
                      }}
                    >
                      자세히 보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {selectedInfluencer && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedInfluencer(null)}
        >
          <div 
            className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">인플루언서 정보</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedInfluencer(null)}
                className="rounded-full p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6">
              {/* Profile */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img
                    src={selectedInfluencer.profile_picture_url || `https://ui-avatars.com/api/?name=${selectedInfluencer.full_name}&background=10b981&color=fff`}
                    alt={selectedInfluencer.full_name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-lg"
                  />
                  {selectedInfluencer.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedInfluencer.full_name}</h2>
                  <p className="text-gray-500">@{selectedInfluencer.instagram_handle}</p>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-600 mb-6">{selectedInfluencer.bio || '프로필 설명이 없습니다'}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">팔로워</p>
                        <p className="text-xl font-bold">{formatNumber(selectedInfluencer.followers_count || 0)}</p>
                      </div>
                      <Users className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">참여율</p>
                        <p className="text-xl font-bold">{(selectedInfluencer.engagement_rate || 0).toFixed(2)}%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Avg Stats */}
              {selectedInfluencer.influencer_stats?.[0] && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-pink-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-pink-600">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm">평균 좋아요</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatNumber(selectedInfluencer.influencer_stats[0].avg_likes || 0)}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-600">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">평균 댓글</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatNumber(selectedInfluencer.influencer_stats[0].avg_comments || 0)}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`px-3 py-1.5 text-sm rounded-full ${getCategoryColor(selectedInfluencer.category)}`}>
                  {selectedInfluencer.category}
                </span>
                <span className="px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedInfluencer.location}
                </span>
                {selectedInfluencer.is_verified && (
                  <span className="px-3 py-1.5 text-sm rounded-full bg-blue-100 text-blue-600">
                    인증됨
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1"
                  onClick={() => router.push(`/influencer/${selectedInfluencer.id}`)}
                >
                  프로필 보기 →
                </Button>
                <Button variant="outline" className="px-4">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}