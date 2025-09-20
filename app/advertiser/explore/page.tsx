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

export default function AdvertiserExplorePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('latest')

  const categories = [
    '패션', '뷰티', '음식', '여행', 
    '테크', '라이프스타일', '피트니스', '게임'
  ]

  useEffect(() => {
    fetchCampaigns()
  }, [])

  useEffect(() => {
    filterAndSortCampaigns()
  }, [campaigns, searchQuery, selectedCategory, sortBy])

  const fetchCampaigns = async () => {
    try {
      const { data: campaignsData, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          brands (name, logo_url),
          campaign_applications (id)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error

      setCampaigns(campaignsData || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortCampaigns = () => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           campaign.brands?.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })

    // 정렬
    if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'budget_high') {
      filtered.sort((a, b) => b.budget_max - a.budget_max)
    } else if (sortBy === 'budget_low') {
      filtered.sort((a, b) => a.budget_min - b.budget_min)
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.campaign_applications?.length || 0) - (a.campaign_applications?.length || 0))
    }

    setFilteredCampaigns(filtered)
  }

  const formatBudget = (min: number, max: number) => {
    const formatNum = (num: number) => {
      if (num >= 10000) return `${(num / 10000).toFixed(0)}만원`
      return `${num.toLocaleString()}원`
    }
    return `${formatNum(min)} ~ ${formatNum(max)}`
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
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="캠페인 또는 브랜드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="popular">인기순</SelectItem>
              <SelectItem value="budget_high">예산 높은순</SelectItem>
              <SelectItem value="budget_low">예산 낮은순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 캠페인 목록 */}
      <main className="px-4 py-4">
        {filteredCampaigns.length === 0 ? (
          <Card className="bg-white/50">
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">검색 결과가 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredCampaigns.map(campaign => {
              const isNew = new Date(campaign.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              
              return (
                <Card 
                  key={campaign.id} 
                  className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/advertiser/explore/${campaign.id}`)}
                >
                  <CardContent className="p-4">
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
                    </div>
                    
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                      {campaign.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('ko-KR') : '상시'}
                        </span>
                        {campaign.category && (
                          <Badge variant="outline" className="text-xs">
                            {campaign.category}
                          </Badge>
                        )}
                      </div>
                      <span className="font-semibold text-[#51a66f]">
                        {formatBudget(campaign.budget_min, campaign.budget_max)}
                      </span>
                    </div>

                    {campaign.campaign_applications && campaign.campaign_applications.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <span className="text-xs text-gray-500">
                          <Users className="h-3 w-3 inline mr-1" />
                          {campaign.campaign_applications.length}명 지원중
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}