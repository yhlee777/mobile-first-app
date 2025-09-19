'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  DollarSign, 
  Users,
  Search,
  MoreVertical,
  Loader2,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Eye
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
  applications_count?: number
}

export default function CampaignListPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!brand) return

      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_applications(count)
        `)
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        setCampaigns(data.map(c => ({
          ...c,
          applications_count: c.campaign_applications?.[0]?.count || 0
        })))
      }
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCampaignStatus = async (campaignId: string, newStatus: string) => {
    setUpdatingId(campaignId)
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)

      if (error) throw error

      await loadCampaigns()
      alert(`캠페인 상태가 변경되었습니다`)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('상태 변경 중 오류가 발생했습니다')
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteCampaign = async (campaignId: string, title: string) => {
    if (!confirm(`"${title}" 캠페인을 삭제하시겠습니까?\n이 작업은 취소할 수 없습니다.`)) {
      return
    }

    setUpdatingId(campaignId)
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)

      if (error) throw error

      await loadCampaigns()
      alert('캠페인이 삭제되었습니다')
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('캠페인 삭제 중 오류가 발생했습니다')
    } finally {
      setUpdatingId(null)
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

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-lg font-semibold">내 캠페인 관리</h1>
            <Button
              size="sm"
              className="bg-[#51a66f] hover:bg-[#449960]"
              onClick={() => router.push('/advertiser/campaigns/new')}
            >
              <Plus className="h-4 w-4 mr-1" />
              새 캠페인
            </Button>
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
          filteredCampaigns.map((campaign, index) => (
            <Card 
              key={campaign.id} 
              className="relative overflow-visible"
              style={{ zIndex: filteredCampaigns.length - index }}
            >
              <CardContent className="p-4">
                {/* 상단 정보 */}
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">
                        {campaign.title}
                      </h3>
                      <Badge 
                        className={
                          campaign.status === 'active' 
                            ? 'bg-green-100 text-green-700 text-[10px] px-2 py-0.5' 
                            : campaign.status === 'closed'
                            ? 'bg-red-100 text-red-700 text-[10px] px-2 py-0.5'
                            : 'bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5'
                        }
                      >
                        {campaign.status === 'active' && '진행중'}
                        {campaign.status === 'draft' && '임시저장'}
                        {campaign.status === 'closed' && '마감'}
                        {campaign.status === 'completed' && '완료'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{campaign.category}</span>
                      {campaign.applications_count !== undefined && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {campaign.applications_count}명 지원
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  
                  {/* 드롭다운 메뉴 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        disabled={updatingId === campaign.id}
                      >
                        {updatingId === campaign.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-48"
                    >
                      <DropdownMenuItem 
                        onClick={() => router.push(`/advertiser/campaigns/${campaign.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        상세 보기
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push(`/advertiser/campaigns/${campaign.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        캠페인 수정
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {/* 상태 변경 옵션 */}
                      {campaign.status === 'draft' && (
                        <DropdownMenuItem 
                          onClick={() => updateCampaignStatus(campaign.id, 'active')}
                          className="text-green-600"
                        >
                          <Power className="h-4 w-4 mr-2" />
                          캠페인 시작
                        </DropdownMenuItem>
                      )}
                      
                      {campaign.status === 'active' && (
                        <DropdownMenuItem 
                          onClick={() => updateCampaignStatus(campaign.id, 'closed')}
                          className="text-orange-600"
                        >
                          <PowerOff className="h-4 w-4 mr-2" />
                          캠페인 마감
                        </DropdownMenuItem>
                      )}
                      
                      {campaign.status === 'closed' && (
                        <DropdownMenuItem 
                          onClick={() => updateCampaignStatus(campaign.id, 'active')}
                          className="text-green-600"
                        >
                          <Power className="h-4 w-4 mr-2" />
                          캠페인 재시작
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={() => deleteCampaign(campaign.id, campaign.title)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        캠페인 삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* 설명 */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {campaign.description}
                </p>

                {/* 예산 및 기간 */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-gray-500">
                    {campaign.start_date} ~ {campaign.end_date}
                  </span>
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
                    onClick={() => router.push(`/advertiser/campaigns/${campaign.id}`)}
                  >
                    상세 보기
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 text-xs h-8 bg-[#51a66f] hover:bg-[#449960] text-white"
                    onClick={() => router.push(`/advertiser/campaigns/${campaign.id}/applications`)}
                  >
                    지원자 관리
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 mb-4">
                {searchTerm ? '검색 결과가 없습니다' : '아직 생성된 캠페인이 없습니다'}
              </p>
              {!searchTerm && (
                <Button
                  className="bg-[#51a66f] hover:bg-[#449960]"
                  onClick={() => router.push('/advertiser/campaigns/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  첫 캠페인 만들기
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}