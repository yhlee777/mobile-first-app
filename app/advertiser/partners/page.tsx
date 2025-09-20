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
  TrendingUp,
  CheckCircle,
  Search,
  SlidersHorizontal,
  Heart,
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
  { label: '전체', value: 'all' },
  { label: '나노 (1천-1만)', value: 'nano' },
  { label: '마이크로 (1만-5만)', value: 'micro' },
  { label: '미드 (5만-10만)', value: 'mid' },
  { label: '매크로 (10만-50만)', value: 'macro' },
  { label: '메가 (50만+)', value: 'mega' }
]

export default function AdvertiserPartnersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [partners, setPartners] = useState<Influencer[]>([])
  const [filteredPartners, setFilteredPartners] = useState<Influencer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [followerFilter, setFollowerFilter] = useState('all')
  const [preferredCategories, setPreferredCategories] = useState<string[]>([])
  const [savedPartners, setSavedPartners] = useState<string[]>([])

  useEffect(() => {
    loadAdvertiserPreferences()
    loadPartners()
  }, [])

  useEffect(() => {
    filterPartners()
  }, [partners, searchQuery, followerFilter])

  const loadAdvertiserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 광고주의 이전 캠페인 카테고리 가져오기
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('category')
        .eq('brand_id', user.id)
        .not('category', 'is', null)

      if (campaigns) {
        // Set 대신 Array.from 사용
        const uniqueCategories = Array.from(new Set(campaigns.map(c => c.category)))
        setPreferredCategories(uniqueCategories)
      }

      // 저장된 파트너 목록
      const { data: saved } = await supabase
        .from('saved_partners')
        .select('partner_id')
        .eq('user_id', user.id)

      if (saved) {
        setSavedPartners(saved.map(s => s.partner_id))
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }

  const loadPartners = async () => {
    try {
      setLoading(true)
      
      // 카테고리 기반 추천 인플루언서 로드
      let query = supabase
        .from('influencers')
        .select('*')
        .eq('is_active', true)

      // 선호 카테고리가 있으면 해당 카테고리 우선
      if (preferredCategories.length > 0) {
        query = query.in('category', preferredCategories)
      }

      const { data, error } = await query
        .order('engagement_rate', { ascending: false })
        .limit(50)

      if (error) throw error
      setPartners(data || [])
    } catch (error) {
      console.error('Error loading partners:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPartners = () => {
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

  const toggleSavePartner = async (partnerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (savedPartners.includes(partnerId)) {
        await supabase
          .from('saved_partners')
          .delete()
          .eq('user_id', user.id)
          .eq('partner_id', partnerId)
        
        setSavedPartners(prev => prev.filter(id => id !== partnerId))
      } else {
        await supabase
          .from('saved_partners')
          .insert({
            user_id: user.id,
            partner_id: partnerId
          })
        
        setSavedPartners(prev => [...prev, partnerId])
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    }
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
            <h1 className="text-lg font-bold">추천 파트너</h1>
          </div>
          <p className="text-xs text-gray-600">
            캠페인에 적합한 인플루언서를 찾아보세요
          </p>
        </div>
      </header>

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
            <SelectTrigger className="w-32">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {followerTiers.map(tier => (
                <SelectItem key={tier.value} value={tier.value}>
                  {tier.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 추천 카테고리 표시 */}
        {preferredCategories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-gray-500">추천:</span>
            {preferredCategories.map(cat => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 파트너 리스트 */}
      <div className="p-4 space-y-3">
        {filteredPartners.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">추천 파트너가 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          filteredPartners.map(partner => (
            <Card 
              key={partner.id}
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => router.push(`/advertiser/influencers/${partner.id}`)}
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
                      <Badge variant="outline" className="text-xs">
                        {partner.category}
                      </Badge>
                      <span className="text-gray-600">
                        팔로워 <span className="font-semibold">{formatFollowers(partner.followers_count)}</span>
                      </span>
                      <span className="text-gray-600">
                        참여율 <span className="font-semibold">{partner.engagement_rate}%</span>
                      </span>
                    </div>
                    {partner.bio && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {partner.bio}
                      </p>
                    )}
                  </div>

                  {/* 액션 버튼 - 하트만 남김 */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSavePartner(partner.id)
                    }}
                  >
                    <Heart 
                      className={`h-4 w-4 ${savedPartners.includes(partner.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
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