'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Search,
  Calendar, 
  DollarSign,
  Filter,
  Eye,
  Building,
  Users,
  Loader2,
  TrendingUp,
  Flame,
  Sparkles,
  Clock,
  Star,
  Heart,
  ChevronRight
} from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  category: string
  start_date: string
  end_date: string
  status: string
  created_at: string
  brands: {
    name: string
    logo_url?: string
  }
  campaign_applications?: any[]
}

const categories = ['전체', '패션', '뷰티', '음식', '여행', '피트니스', '테크', '라이프스타일', '육아', '기타']

export default function AdvertiserExplorePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [sortBy, setSortBy] = useState('최신순')
  const [savedCampaigns, setSavedCampaigns] = useState<string[]>([])
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadAllCampaigns()
  }, [])

  const loadAllCampaigns = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          brands (name, logo_url),
          campaign_applications (id)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error

      setCampaigns(data || [])
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBudget = (min: number, max: number) => {
    const format = (n: number) => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(0)}백만`
      if (n >= 10000) return `${(n / 10000).toFixed(0)}만`
      return n.toLocaleString()
    }
    return `${format(min)} ~ ${format(max)}원`
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.brands?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === '전체' || 
                          campaign.category === categoryFilter ||
                          (!campaign.category && categoryFilter === '기타')
    
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch(sortBy) {
      case '인기순':
        return (b.campaign_applications?.length || 0) - (a.campaign_applications?.length || 0)
      case '예산높은순':
        return b.budget_max - a.budget_max
      case '예산낮은순':
        return a.budget_min - b.budget_min
      default: // 최신순
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const toggleSaveCampaign = (campaignId: string) => {
    setSavedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    )
  }

  const trendingCampaigns = [...campaigns]
    .sort((a, b) => (b.campaign_applications?.length || 0) - (a.campaign_applications?.length || 0))
    .slice(0, 3)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20">
        <Loader2 className="h-8 w-8 animate-spin text-[#51a66f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">캠페인 둘러보기</h1>
              <p className="text-xs text-gray-500">다른 브랜드들의 캠페인 트렌드를 확인하세요</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/advertiser/campaigns')}
              className="border-[#51a66f] text-[#51a66f]"
            >
              내 캠페인
            </Button>
          </div>
        </div>
      </header>

      {/* 트렌딩 캠페인 (인기) */}
      {trendingCampaigns.length > 0 && (
        <div className="px-4 pt-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold">지금 핫한 캠페인</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {trendingCampaigns.map((campaign, index) => (
              <Card 
                key={campaign.id}
                className="min-w-[200px] bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 cursor-pointer hover:shadow-md transition-all"
                onClick={() => router.push(`/advertiser/explore/${campaign.id}`)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="bg-orange-500 text-white text-xs">
                      TOP {index + 1}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {campaign.campaign_applications?.length || 0}명 지원
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm line-clamp-1">{campaign.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{campaign.brands?.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 검색 및 필터 */}
      <div className="px-4 pb-3 bg-white/90 backdrop-blur-sm border-b sticky top-[57px] z-30">
        <div className="flex gap-2 mb-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="캠페인 또는 브랜드 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="최신순">최신순</SelectItem>
              <SelectItem value="인기순">인기순</SelectItem>
              <SelectItem value="예산높은순">예산 높은순</SelectItem>
              <SelectItem value="예산낮은순">예산 낮은순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 캠페인 리스트 */}
      <main className="px-4 py-4">
        {filteredCampaigns.length > 0 ? (
          <div className="space-y-3">
            {filteredCampaigns.map(campaign => {
              const isSaved = savedCampaigns.includes(campaign.id)
              const isNew = new Date(campaign.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              
              return (
                <Card 
                  key={campaign.id} 
                  className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => router.push(`/advertiser/explore/${campaign.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isNew && (
                              <Badge className="bg-green-500 text-white text-xs">NEW</Badge>
                            )}
                            <h3 className="font-semibold text-sm">{campaign.title}</h3>
                          </div>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {campaign.brands?.name}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSaveCampaign(campaign.id)
                          }}
                          className="p-1"
                        >
                          <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        </Button>
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                        {campaign.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('ko-KR') : '미정'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {campaign.campaign_applications?.length || 0}명 지원
                          </span>
                        </div>
                        <span className="font-semibold text-[#51a66f] flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatBudget(campaign.budget_min, campaign.budget_max)}
                        </span>
                      </div>
                    </div>
                    
                    {campaign.category && (
                      <div className="px-4 py-2 bg-gray-50 border-t">
                        <Badge variant="secondary" className="text-xs">
                          {campaign.category}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                {searchTerm ? '검색 결과가 없습니다' : '진행 중인 캠페인이 없습니다'}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}