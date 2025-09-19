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
    location?: string
  }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
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
            logo_url,
            location
          )
        `)
        .eq('status', 'active')
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

  const handleCampaignClick = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}`)
  }

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.brands?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#51a66f]" />
          <p className="text-gray-500">캠페인을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold">공고 목록</h1>
          </div>
          
          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="캠페인 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      </header>

      {/* 캠페인 목록 */}
      <main className="px-4 py-4 space-y-3">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <Card 
              key={campaign.id}
              className="overflow-hidden"
            >
              <CardContent className="p-4">
                {/* 상단 정보 - 더보기 버튼 포함 */}
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">
                        {campaign.title}
                      </h3>
                      {campaign.status === 'active' && (
                        <Badge className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 flex-shrink-0">
                          모집중
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {campaign.brands?.name}
                    </p>
                  </div>
                  
                  {/* 더보기 버튼 - 명확하게 표시 */}
                  <div className="flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault()
                        console.log('더보기 클릭')
                        // 더보기 메뉴 표시
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

                {/* 하단 버튼 2개 */}
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
                      // 지원하기 기능
                      alert('지원하기 기능 준비중')
                    }}
                  >
                    지원하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? '검색 결과가 없습니다' : '진행 중인 캠페인이 없습니다'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}