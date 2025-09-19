'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { 
  Search,
  Loader2,
  MoreVertical,
  DollarSign
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
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
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
          brands (
            name,
            logo_url
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error loading campaigns:', error)
        return
      }
      
      setCampaigns(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBudget = (min?: number, max?: number): string => {
    if (!min && !max) return '협의'
    
    const minStr = min ? `${Math.floor(min / 10000)}만원` : ''
    const maxStr = max ? `${Math.floor(max / 10000)}만원` : ''
    
    if (min && max) return `${minStr}~${maxStr}`
    if (min) return `${minStr}~`
    if (max) return `~${maxStr}`
    return '협의'
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 flex-shrink-0">모집중</Badge>
      case 'closed':
        return <Badge className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 flex-shrink-0">마감</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 flex-shrink-0">준비중</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 flex-shrink-0">완료</Badge>
      default:
        return null
    }
  }

  const handleCampaignClick = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}`)
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.brands?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#51a66f]" />
          <p className="text-gray-500">캠페인을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold">전체 캠페인</h1>
          </div>
          
          {/* 검색바 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="캠페인 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 bg-white/80 rounded-full"
            />
          </div>

          {/* 필터 버튼들 */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === 'all' 
                  ? 'bg-[#51a66f] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === 'active' 
                  ? 'bg-[#51a66f] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              모집중
            </button>
            <button
              onClick={() => setStatusFilter('closed')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === 'closed' 
                  ? 'bg-[#51a66f] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              마감
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === 'draft' 
                  ? 'bg-[#51a66f] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              준비중
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === 'completed' 
                  ? 'bg-[#51a66f] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              완료
            </button>
          </div>
        </div>
      </header>

      {/* 캠페인 수 표시 */}
      <div className="px-4 py-2 text-xs text-gray-600">
        총 {filteredCampaigns.length}개의 캠페인
      </div>

      {/* 캠페인 목록 */}
      <main className="px-4 pb-4 space-y-3">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <Card 
              key={campaign.id}
              className="overflow-hidden bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
            >
              <CardContent className="p-4">
                {/* 상단 정보 */}
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">
                        {campaign.title}
                      </h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {campaign.brands?.name}
                    </p>
                  </div>
                  
                  {/* 더보기 버튼 */}
                  <div className="flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault()
                        console.log('더보기 클릭')
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 설명 */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {campaign.description}
                </p>

                {/* 예산 및 카테고리 */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <Badge variant="secondary" className="text-[10px]">
                    {campaign.category}
                  </Badge>
                  <span className="font-medium text-gray-700 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatBudget(campaign.budget_min, campaign.budget_max)}
                  </span>
                </div>

                {/* 하단 버튼 */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs h-8"
                    onClick={() => handleCampaignClick(campaign.id)}
                  >
                    상세 보기
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 text-xs h-8 bg-[#51a66f] hover:bg-[#449960] text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      alert('지원하기 기능 준비중')
                    }}
                    disabled={campaign.status !== 'active'}
                  >
                    {campaign.status === 'active' ? '지원하기' : '마감'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="py-8">
                <p className="text-gray-500 text-lg mb-2">
                  {searchTerm ? '검색 결과가 없습니다' : '캠페인이 없습니다'}
                </p>
                <p className="text-gray-400 text-sm">
                  {searchTerm ? '다른 검색어를 시도해보세요' : '새로운 캠페인을 기다려주세요'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}