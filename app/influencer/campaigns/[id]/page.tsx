'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Building,
  DollarSign,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  MessageSquare
} from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description: string
  requirements?: string
  deliverables?: string
  budget_min: number
  budget_max: number
  category: string
  start_date: string
  end_date: string
  status: string
  brands: {
    id: string
    name: string
    logo_url?: string
    contact_email?: string
    description?: string
  }
}

interface Application {
  id: string
  status: string
  proposal: string
  created_at: string
}

export default function CampaignDetailPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [proposal, setProposal] = useState('')
  const [applying, setApplying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [influencerId, setInfluencerId] = useState<string | null>(null)
  
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      loadCampaign(params.id as string)
    }
  }, [params.id])

  const loadCampaign = async (campaignId: string) => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // users 테이블 확인/생성
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          user_type: 'influencer',
          name: user.email?.split('@')[0] || 'User',
          updated_at: new Date().toISOString()
        })

      // 인플루언서 정보 가져오기
      const { data: influencer } = await supabase
        .from('influencers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (influencer) {
        setInfluencerId(influencer.id)
        
        // 기존 지원 내역 확인
        const { data: existingApp } = await supabase
          .from('campaign_applications')
          .select('*')
          .eq('campaign_id', campaignId)
          .eq('influencer_id', influencer.id)
          .single()
        
        if (existingApp) {
          setApplication(existingApp)
          setProposal(existingApp.proposal || '')
        }
      }

      // 캠페인 정보 가져오기
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select(`
          *,
          brands (
            id,
            name,
            logo_url,
            contact_email,
            description
          )
        `)
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError
      setCampaign(campaignData)
      
    } catch (error) {
      console.error('Error loading campaign:', error)
      router.push('/influencer/campaigns')
    } finally {
      setLoading(false)
    }
  }

 const handleApply = async () => {
  if (!influencerId || !campaign || !proposal.trim()) {
    alert('제안 내용을 입력해주세요')
    return
  }

  setApplying(true)
  
  try {
    // 1. 캠페인 지원
    const { error } = await supabase
      .from('campaign_applications')
      .insert({
        campaign_id: campaign.id,
        influencer_id: influencerId,
        proposal: proposal,
        message: proposal, // message 필드도 추가
        status: 'pending'
      })

    if (error) throw error
    
    // 2. 광고주에게 알림 보내기
    // 광고주의 user_id 찾기
    const { data: brandData } = await supabase
      .from('brands')
      .select('user_id, name')
      .eq('id', campaign.brands.id)
      .single()

    if (brandData?.user_id) {
      // 인플루언서 정보 가져오기
      const { data: influencerData } = await supabase
        .from('influencers')
        .select('name, instagram_handle')
        .eq('id', influencerId)
        .single()

      // 알림 생성
      await supabase
        .from('notifications')
        .insert({
          user_id: brandData.user_id,
          type: 'new_application',
          title: '🎉 새로운 캠페인 지원자!',
          message: `${influencerData?.name || '인플루언서'}(@${influencerData?.instagram_handle})님이 "${campaign.title}" 캠페인에 지원했습니다.`,
          related_id: campaign.id,
          is_read: false
        })
    }
    
    // 3. 지원 내역 다시 로드
    const { data: newApp } = await supabase
      .from('campaign_applications')
      .select('*')
      .eq('campaign_id', campaign.id)
      .eq('influencer_id', influencerId)
      .single()
    
    if (newApp) {
      setApplication(newApp)
    }
    
    alert('지원이 완료되었습니다!')
  } catch (error: any) {
    console.error('Apply error:', error)
    alert(error.message || '지원 중 오류가 발생했습니다')
  } finally {
    setApplying(false)
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

  const getApplicationStatus = () => {
    if (!application) return null
    
    const statusConfig = {
      pending: {
        icon: <Clock className="h-4 w-4" />,
        label: '검토 중',
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
      },
      accepted: {
        icon: <CheckCircle className="h-4 w-4" />,
        label: '승인됨',
        color: 'bg-green-50 text-green-700 border-green-200'
      },
      rejected: {
        icon: <AlertCircle className="h-4 w-4" />,
        label: '거절됨',
        color: 'bg-red-50 text-red-700 border-red-200'
      }
    }
    
    const config = statusConfig[application.status as keyof typeof statusConfig]
    
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg border ${config.color}`}>
        {config.icon}
        <span className="font-semibold">{config.label}</span>
        <span className="text-sm">
          ({new Date(application.created_at).toLocaleDateString('ko-KR')})
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20">
        <Loader2 className="h-8 w-8 animate-spin text-[#51a66f]" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>캠페인을 찾을 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/influencer/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로
            </Button>
            <Badge variant="outline">
              {campaign.category || '카테고리 없음'}
            </Badge>
          </div>
        </div>
      </header>

      {/* 브랜드 정보 */}
      <div className="px-4 py-6">
        <Card className="bg-white/90 backdrop-blur-sm mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {campaign.brands.logo_url ? (
                <img
                  src={campaign.brands.logo_url}
                  alt={campaign.brands.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <Building className="h-6 w-6 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="font-semibold">{campaign.brands.name}</h3>
                {campaign.brands.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {campaign.brands.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 캠페인 정보 */}
        <Card className="bg-white/90 backdrop-blur-sm mb-4">
          <CardHeader>
            <CardTitle className="text-xl">{campaign.title}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                {campaign.status === 'active' ? '진행중' : '마감'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <Target className="h-4 w-4 text-[#51a66f]" />
                  캠페인 소개
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {campaign.description}
                </p>
              </div>
              
              {campaign.requirements && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-[#51a66f]" />
                    참여 조건
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {campaign.requirements}
                  </p>
                </div>
              )}

              {campaign.deliverables && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-[#51a66f]" />
                    제공 내용
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {campaign.deliverables}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 캠페인 상세 정보 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">예산</p>
                  <p className="text-sm font-semibold text-[#51a66f]">
                    {formatBudget(campaign.budget_min, campaign.budget_max)}
                  </p>
                </div>
                <DollarSign className="h-5 w-5 text-[#51a66f] opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">캠페인 기간</p>
                  <p className="text-sm font-semibold">
                    {campaign.start_date 
                      ? new Date(campaign.start_date).toLocaleDateString('ko-KR')
                      : '미정'}
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-[#51a66f] opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 지원 상태 또는 지원 폼 */}
        {application ? (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">지원 현황</CardTitle>
            </CardHeader>
            <CardContent>
              {getApplicationStatus()}
              {application.proposal && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold mb-1">내 제안서</p>
                  <p className="text-sm text-gray-700">{application.proposal}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">캠페인 지원하기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="proposal" className="text-sm font-semibold mb-2 block">
                    자기소개 및 제안서
                  </Label>
                  <Textarea
                    id="proposal"
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="캠페인에 참여하고 싶은 이유와 본인의 강점을 작성해주세요."
                    rows={6}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    최소 50자 이상 작성해주세요 ({proposal.length}자)
                  </p>
                </div>
                
                <Button
                  onClick={handleApply}
                  disabled={applying || proposal.length < 50 || campaign.status !== 'active'}
                  className="w-full bg-[#51a66f] hover:bg-[#51a66f]/90"
                >
                  {applying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      지원 중...
                    </>
                  ) : (
                    '지원하기'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}