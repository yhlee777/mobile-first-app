'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Users, 
  ArrowLeft, 
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
    if (!confirm(`"${title}" 캠페인을 삭제하시겠습니까?`)) {
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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-700',
      'active': 'bg-green-100 text-green-700',
      'closed': 'bg-red-100 text-red-700',
      'completed': 'bg-blue-100 text-blue-700'
    }
    return colors[status] || colors.draft
  }

  const formatBudget = (min: number, max: number) => {
    const format = (n: number) => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(0)}백만`
      if (n >= 10000) return `${(n / 10000).toFixed(0)}만`
      return n.toLocaleString()
    }
    return `${format(min)}원 ~ ${format(max)}원`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/advertiser')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">캠페인 관리</h1>
                <p className="text-xs text-gray-500">진행중인 캠페인을 관리하세요</p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => router.push('/advertiser/campaigns/new')}
            >
              <Plus className="h-4 w-4 mr-1" />
              새 캠페인
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        {campaigns.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 mb-4">아직 생성된 캠페인이 없습니다</p>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => router.push('/advertiser/campaigns/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                첫 캠페인 만들기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => router.push(`/advertiser/campaigns/${campaign.id}`)}
                    >
                      <CardTitle className="text-lg">{campaign.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {campaign.description?.substring(0, 100)}...
                      </p>
                    </div>
                    <Badge className={getStatusBadge(campaign.status)}>
                      {campaign.status === 'active' && '진행중'}
                      {campaign.status === 'draft' && '임시저장'}
                      {campaign.status === 'closed' && '마감'}
                      {campaign.status === 'completed' && '완료'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>{formatBudget(campaign.budget_min, campaign.budget_max)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{campaign.start_date} ~ {campaign.end_date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{campaign.applications_count || 0}명 지원</span>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/advertiser/campaigns/${campaign.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      상세
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/advertiser/campaigns/${campaign.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                    
                    {campaign.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:bg-green-50"
                        onClick={() => updateCampaignStatus(campaign.id, 'active')}
                        disabled={updatingId === campaign.id}
                      >
                        <Power className="h-4 w-4 mr-1" />
                        시작
                      </Button>
                    )}
                    
                    {campaign.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 hover:bg-orange-50"
                        onClick={() => updateCampaignStatus(campaign.id, 'closed')}
                        disabled={updatingId === campaign.id}
                      >
                        <PowerOff className="h-4 w-4 mr-1" />
                        마감
                      </Button>
                    )}
                    
                    {campaign.status === 'closed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:bg-green-50"
                        onClick={() => updateCampaignStatus(campaign.id, 'active')}
                        disabled={updatingId === campaign.id}
                      >
                        <Power className="h-4 w-4 mr-1" />
                        재시작
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 ml-auto"
                      onClick={() => deleteCampaign(campaign.id, campaign.title)}
                      disabled={updatingId === campaign.id}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}