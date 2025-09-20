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
import BottomNav from '@/components/navigation/bottom-nav'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  Users,
  Building,
  ChevronRight,
  Sparkles,
  Clock,
  Star,
  Zap,
  Target
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

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [sortBy, setSortBy] = useState('최신순')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
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

      if (!error && data) {
        setCampaigns(data)
      }
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
    return `${format(min)}~${format(max)}원`
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === '전체' || campaign.category === categoryFilter
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch(sortBy) {
      case '인기순':
        return (b.campaign_applications?.length || 0) - (a.campaign_applications?.length || 0)
      case '예산높은순':
        return b.budget_max - a.budget_max
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const hotCampaigns = [...campaigns]
    .sort((a, b) => (b.campaign_applications?.length || 0) - (a.campaign_applications?.length || 0))
    .slice(0, 3)

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">캠페인 찾기</h1>
              <p className="text-xs text-gray-500">나에게 맞는 캠페인을 찾아보세요</p>
            </div>
            <Badge className="bg-[#51a66f] text-white">
              {campaigns.length}개 모집중
            </Badge>
          </div>
        </div>
      </header>

      {/* 통계 카드 */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-[#51a66f] to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">오늘 등록</p>
                  <p className="text-2xl font-bold">
                    {campaigns.filter(c => {
                      const created = new Date(c.created_at)
                      const today = new Date()
                      return created.toDateString() === today.toDateString()
                    }).length}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">평균 지원자</p>
                  <p className="text-2xl font-bold">
                    {campaigns.length > 0 
                      ? Math.round(campaigns.reduce((acc, c) => acc + (c.campaign_applications?.length || 0), 0) / campaigns.length)
                      : 0}명
                  </p>
                </div>
                <Users className="h-6 w-6 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* HOT 캠페인 슬라이더 */}
      {hotCampaigns.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full">
              <Zap className="h-3 w-3 text-red-500" />
              <span className="text-xs font-semibold text-red-700">HOT</span>
            </div>
            <span className="text-sm font-semibold">지금 가장 인기있는 캠페인</span>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {hotCampaigns.map((campaign, index) => (
              <Card 
                key={campaign.id}
                className="min-w-[250px] bg-gradient-to-br from-white to-red-50 border-red-200 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => router.push(`/influencer/campaigns/${campaign.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 text-red-600" />
                      <span className="text-xs font-bold text-red-700">#{index + 1}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {campaign.campaign_applications?.length || 0}명 지원
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-sm mb-1 line-clamp-1">{campaign.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{campaign.brands?.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#51a66f]">
                      {formatBudget(campaign.budget_min, campaign.budget_max)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 검색 및 필터 */}
      <div className="px-4 pb-3 bg-white/90 backdrop-blur-sm sticky top-[65px] z-30 border-b">
        <div className="flex gap-2 mb-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="캠페인 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-50"
            />
          </div>
          <Button variant="outline" size="icon" className="border-[#51a66f] text-[#51a66f]">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="flex-1 bg-gray-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1 bg-gray-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="최신순">최신순</SelectItem>
              <SelectItem value="인기순">인기순</SelectItem>
              <SelectItem value="예산높은순">예산 높은순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 캠페인 리스트 */}
      <main className="px-4 py-4">
        <div className="space-y-3">
          {filteredCampaigns.map(campaign => {
            const isNew = new Date(campaign.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            const daysLeft = campaign.end_date ? calculateDaysLeft(campaign.end_date) : null
            
            return (
              <Card 
                key={campaign.id}
                className="bg-white/90 backdrop-blur hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                onClick={() => router.push(`/influencer/campaigns/${campaign.id}`)}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#51a66f] to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isNew && (
                          <Badge className="bg-green-100 text-green-700 text-xs">NEW</Badge>
                        )}
                        {daysLeft && daysLeft <= 3 && (
                          <Badge className="bg-red-100 text-red-700 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {daysLeft}일 남음
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm group-hover:text-[#51a66f] transition-colors">
                        {campaign.title}
                      </h3>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                        <Building className="h-3 w-3" />
                        {campaign.brands?.name}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {campaign.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {campaign.category && (
                        <Badge variant="outline" className="text-xs">
                          {campaign.category}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {campaign.campaign_applications?.length || 0}명 지원
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-[#51a66f]">
                        {formatBudget(campaign.budget_min, campaign.budget_max)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#51a66f] transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        {filteredCampaigns.length === 0 && (
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">검색 결과가 없습니다</p>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}