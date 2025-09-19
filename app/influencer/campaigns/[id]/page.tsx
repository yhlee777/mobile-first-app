'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Building,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description: string
  requirements: string
  budget_min: number
  budget_max: number
  category: string
  start_date: string
  end_date: string
  status: string
  brands: {
    name: string
    company_name: string
    description: string
    logo_url: string
  }
}

interface Application {
  id: string
  status: string
  message: string
  created_at: string
}

export default function CampaignDetailPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [influencerId, setInfluencerId] = useState<string | null>(null)
  
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      loadCampaignAndApplication(params.id as string)
    }
  }, [params.id])

  const loadCampaignAndApplication = async (campaignId: string) => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('influencers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setInfluencerId(profile.id)
      }

      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select(`
          *,
          brands (name, company_name, description, logo_url)
        `)
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError
      setCampaign(campaignData)

      if (profile) {
        const { data: applicationData } = await supabase
          .from('campaign_applications')
          .select('*')
          .eq('campaign_id', campaignId)
          .eq('influencer_id', profile.id)
          .single()

        if (applicationData) {
          setApplication(applicationData)
        }
      }
      
    } catch (error) {
      console.error('Error loading campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitApplication = async () => {
    if (!influencerId || !campaign) return

    setApplying(true)
    try {
      const { error } = await supabase
        .from('campaign_applications')
        .insert({
          campaign_id: campaign.id,
          influencer_id: influencerId,
          message: applicationMessage,
          status: 'pending'
        })

      if (error) throw error

      alert('지원이 완료되었습니다!')
      await loadCampaignAndApplication(campaign.id)
      setShowApplicationForm(false)
      setApplicationMessage('')
    } catch (error: any) {
      if (error.code === '23505') {
        alert('이미 지원한 캠페인입니다')
      } else {
        console.error('Error applying:', error)
        alert('지원 중 오류가 발생했습니다')
      }
    } finally {
      setApplying(false)
    }
  }

  const getStatusBadge = () => {
    if (!application) return null

    const config: Record<string, { color: string, icon: any, text: string }> = {
      'pending': { 
        color: 'bg-yellow-100 text-yellow-700', 
        icon: Clock,
        text: '검토중'
      },
      'accepted': { 
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle,
        text: '승인됨'
      },
      'rejected': { 
        color: 'bg-red-100 text-red-700',
        icon: XCircle,
        text: '거절됨'
      }
    }
    
    const cfg = config[application.status] || config.pending
    return (
      <Badge className={`${cfg.color} flex items-center gap-1`}>
        <cfg.icon className="h-3 w-3" />
        {cfg.text}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!campaign) {
    return <div>캠페인을 찾을 수 없습니다</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pb-20">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/influencer/campaigns')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold line-clamp-1">{campaign.title}</h1>
              <p className="text-xs text-gray-500">캠페인 상세</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              브랜드 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold">{campaign.brands?.name}</h3>
              {campaign.brands?.company_name && (
                <p className="text-sm text-gray-500">{campaign.brands.company_name}</p>
              )}
              {campaign.brands?.description && (
                <p className="text-sm text-gray-600">{campaign.brands.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>캠페인 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">설명</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{campaign.description}</p>
            </div>
            
            {campaign.requirements && (
              <div>
                <h3 className="font-semibold mb-2">요구사항</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{campaign.requirements}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">예산</p>
                  <p className="text-sm font-semibold">
                    {campaign.budget_min?.toLocaleString()} ~ {campaign.budget_max?.toLocaleString()}원
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">기간</p>
                  <p className="text-sm font-semibold">
                    {campaign.start_date || '미정'} ~ {campaign.end_date || '미정'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {application ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>내 지원 현황</span>
                {getStatusBadge()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">지원 메시지</p>
                <p className="text-sm mt-1">{application.message || '(메시지 없음)'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">지원일</p>
                <p className="text-sm mt-1">
                  {new Date(application.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : showApplicationForm ? (
          <Card>
            <CardHeader>
              <CardTitle>캠페인 지원하기</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="message">브랜드에게 전달할 메시지</Label>
                <Textarea
                  id="message"
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="자기소개, 캠페인 참여 의지, 콘텐츠 계획 등을 자유롭게 작성해주세요"
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  브랜드 제시 예산: {campaign.budget_min?.toLocaleString()} ~ {campaign.budget_max?.toLocaleString()}원
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={submitApplication}
                  disabled={applying}
                >
                  {applying ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  지원하기
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApplicationForm(false)
                    setApplicationMessage('')
                  }}
                  disabled={applying}
                >
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
              onClick={() => setShowApplicationForm(true)}
            >
              <Send className="h-5 w-5 mr-2" />
              캠페인 지원하기
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}