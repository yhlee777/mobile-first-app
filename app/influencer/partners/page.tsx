'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import { 
  Users2,
  Users,
  CheckCircle,
  Search,
  SlidersHorizontal,
  Instagram,
  Loader2
} from 'lucide-react'

interface Influencer {
  id: string
  instagram_handle: string
  name: string
  bio?: string
  category: string
  location?: string
  followers_count: number
  engagement_rate: number
  profile_image?: string
  is_verified?: boolean
}

const followerTiers = [
  { label: '전체', value: 'all', display: '전체' },
  { label: '나노', value: 'nano', display: '나노 (1천~1만)' },
  { label: '마이크로', value: 'micro', display: '마이크로 (1~5만)' },
  { label: '미드', value: 'mid', display: '미드 (5~10만)' },
  { label: '매크로', value: 'macro', display: '매크로 (10~50만)' },
  { label: '메가', value: 'mega', display: '메가 (50만+)' }
]

export default function InfluencerPartnersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [myProfile, setMyProfile] = useState<Influencer | null>(null)
  const [partners, setPartners] = useState<Influencer[]>([])
  const [filteredPartners, setFilteredPartners] = useState<Influencer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [followerFilter, setFollowerFilter] = useState('all')

  useEffect(() => {
    loadMyProfile()
  }, [])

  useEffect(() => {
    if (myProfile) {
      loadPartners()
    }
  }, [myProfile])

  useEffect(() => {
    filterPartners()
  }, [partners, searchQuery, followerFilter])

  const loadMyProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('influencers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setMyProfile(profile)
        // 내 팔로워 수에 맞는 기본 필터 설정
        setDefaultFilter(profile.followers_count)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const setDefaultFilter = (followerCount: number) => {
    if (followerCount < 10000) {
      setFollowerFilter('nano')
    } else if (followerCount < 50000) {
      setFollowerFilter('micro')
    } else if (followerCount < 100000) {
      setFollowerFilter('mid')
    } else if (followerCount < 500000) {
      setFollowerFilter('macro')
    } else {
      setFollowerFilter('mega')
    }
  }

  const loadPartners = async () => {
    if (!myProfile) return

    try {
      setLoading(true)
      
      // 같은 카테고리의 다른 인플루언서 로드
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('category', myProfile.category)
        .eq('is_active', true)
        .neq('id', myProfile.id) // 본인 제외
        .order('followers_count', { ascending: false })
        .limit(100)

      if (error) throw error
      setPartners(data || [])
    } catch (error) {
      console.error('Error loading partners:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPartners = () => {
    if (!myProfile) return

    let filtered = [...partners]

    // 검색 필터
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.instagram_handle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 팔로워 필터
    if (followerFilter !== 'all') {
      filtered = filtered.filter(p => {
        const count = p.followers_count
        switch(followerFilter) {
          case 'nano': return count >= 1000 && count < 10000
          case 'micro': return count >= 10000 && count < 50000
          case 'mid': return count >= 50000 && count < 100000
          case 'macro': return count >= 100000 && count < 500000
          case 'mega': return count >= 500000
          default: return true
        }
      })
    }

    setFilteredPartners(filtered)
  }

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 10000) return `${Math.floor(count / 1000)}K`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  // 현재 선택된 필터의 라벨 가져오기
  const getSelectedLabel = () => {
    const tier = followerTiers.find(t => t.value === followerFilter)
    return tier?.label || '전체'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#51a66f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Users2 className="h-5 w-5 text-[#51a66f]" />
            <h1 className="text-lg font-bold">파트너</h1>
          </div>
          <p className="text-xs text-gray-600">
            나와 비슷한 인플루언서들을 둘러보고 네트워킹하세요
          </p>
        </div>
      </header>

      {/* 내 프로필 요약 */}
      {myProfile && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={myProfile.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(myProfile.name)}`}
              alt={myProfile.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">{myProfile.name}</p>
              <p className="text-xs text-gray-600">
                {myProfile.category} · 팔로워 {formatFollowers(myProfile.followers_count)} · 참여율 {myProfile.engagement_rate}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 검색 및 필터 */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="이름 또는 @핸들 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={followerFilter} onValueChange={setFollowerFilter}>
            <SelectTrigger className="w-24">
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              <span className="text-xs">{getSelectedLabel()}</span>
            </SelectTrigger>
            <SelectContent>
              {followerTiers.map(tier => (
                <SelectItem key={tier.value} value={tier.value}>
                  <span className="text-xs">{tier.display}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 선택된 필터 정보 표시 */}
        {followerFilter !== 'all' && (
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs">
              {followerTiers.find(t => t.value === followerFilter)?.display}
            </Badge>
          </div>
        )}

        <p className="text-xs text-gray-500">
          {filteredPartners.length}명의 {myProfile?.category} 인플루언서
        </p>
      </div>

      {/* 파트너 리스트 */}
      <div className="p-4 space-y-3">
        {filteredPartners.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">조건에 맞는 인플루언서가 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          filteredPartners.map(partner => (
            <Card 
              key={partner.id}
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => router.push(`/influencer/${partner.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* 프로필 이미지 */}
                  <img
                    src={partner.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}`}
                    alt={partner.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {partner.name}
                      </h3>
                      {partner.is_verified && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      @{partner.instagram_handle}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-600">
                        팔로워 <span className="font-semibold">{formatFollowers(partner.followers_count)}</span>
                      </span>
                      <span className="text-gray-600">
                        참여율 <span className="font-semibold">{partner.engagement_rate}%</span>
                      </span>
                      {partner.location && (
                        <span className="text-gray-600">{partner.location}</span>
                      )}
                    </div>
                    {partner.bio && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {partner.bio}
                      </p>
                    )}
                  </div>

                  {/* 인스타그램 버튼만 남김 */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`https://instagram.com/${partner.instagram_handle}`, '_blank')
                    }}
                  >
                    <Instagram className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}