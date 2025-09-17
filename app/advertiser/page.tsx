'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { formatNumber } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
}

const categories = ['전체', '패션', '뷰티', '음식', '여행', '피트니스', '테크', '라이프스타일', '게임']
const locations = ['전체', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '경기', '강원', '충청', '전라', '경상', '제주']

export default function AdvertiserPage() {
  const router = useRouter()
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [locationFilter, setLocationFilter] = useState('전체')
  const [followersMin, setFollowersMin] = useState('')
  const [followersMax, setFollowersMax] = useState('')
  const [engagementMin, setEngagementMin] = useState('')
  const [engagementMax, setEngagementMax] = useState('')
  const [sortBy, setSortBy] = useState('followers')
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchInfluencers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [influencers, searchTerm, categoryFilter, locationFilter, followersMin, followersMax, engagementMin, engagementMax, sortBy])

  const fetchInfluencers = async () => {
    const supabase = createClient() as any
    const { data, error } = await supabase
      .from('influencers')
      .select('*')
      .eq('is_public', true)

    if (!error && data) {
      setInfluencers(data)
    }
    setLoading(false)
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

    if (followersMin) {
      filtered = filtered.filter(inf => (inf.followers_count || 0) >= parseInt(followersMin))
    }

    if (followersMax) {
      filtered = filtered.filter(inf => (inf.followers_count || 0) <= parseInt(followersMax))
    }

    if (engagementMin) {
      filtered = filtered.filter(inf => (inf.engagement_rate || 0) >= parseFloat(engagementMin))
    }

    if (engagementMax) {
      filtered = filtered.filter(inf => (inf.engagement_rate || 0) <= parseFloat(engagementMax))
    }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-green-600">itda</Link>
            <span className="text-gray-500">|</span>
            <span className="text-sm font-medium">광고주 대시보드</span>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            로그아웃
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              placeholder="인플루언서 검색 (이름, 핸들, 소개)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* Filter Toggle Button (Mobile) */}
        <div className="mb-4 lg:hidden">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            필터 {showFilters ? '숨기기' : '보기'}
          </Button>
        </div>

        {/* Filters */}
        <Card className={`mb-6 ${!showFilters && 'hidden lg:block'}`}>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              필터 및 정렬
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>카테고리</Label>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>지역</Label>
                <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>정렬</Label>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="followers">팔로워 많은순</option>
                  <option value="engagement">인게이지먼트 높은순</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>팔로워 수</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="최소"
                    value={followersMin}
                    onChange={(e) => setFollowersMin(e.target.value)}
                  />
                  <span className="text-gray-500">~</span>
                  <Input
                    type="number"
                    placeholder="최대"
                    value={followersMax}
                    onChange={(e) => setFollowersMax(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>인게이지먼트율 (%)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="최소"
                    value={engagementMin}
                    onChange={(e) => setEngagementMin(e.target.value)}
                  />
                  <span className="text-gray-500">~</span>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="최대"
                    value={engagementMax}
                    onChange={(e) => setEngagementMax(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          총 {filteredInfluencers.length}명의 인플루언서를 찾았습니다
        </div>

        {/* Influencer Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3">로딩 중...</span>
            </div>
          </div>
        ) : filteredInfluencers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500">검색 결과가 없습니다</p>
              <p className="text-sm text-gray-400 mt-2">다른 필터 조건으로 검색해보세요</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredInfluencers.map(influencer => (
              <Link key={influencer.id} href={`/advertiser/influencer/${influencer.id}`}>
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {influencer.profile_picture_url ? (
                        <img
                          src={influencer.profile_picture_url}
                          alt={influencer.full_name || ''}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {influencer.full_name || influencer.instagram_handle || '이름 없음'}
                        </h3>
                        {influencer.instagram_handle && (
                          <p className="text-sm text-gray-500">@{influencer.instagram_handle}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {influencer.category && (
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                              {influencer.category}
                            </span>
                          )}
                          {influencer.location && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {influencer.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {influencer.bio && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {influencer.bio}
                      </p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-500">팔로워</p>
                        <p className="font-semibold text-green-600">
                          {influencer.followers_count ? formatNumber(influencer.followers_count) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">인게이지먼트</p>
                        <p className="font-semibold text-green-600">
                          {influencer.engagement_rate ? `${influencer.engagement_rate.toFixed(1)}%` : '-'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}