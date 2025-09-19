'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Users, 
  Edit, 
  Trash2, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  MessageSquare,
  X
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
  created_at: string
}

interface Application {
  id: string
  message: string
  status: string
  created_at: string
  influencers: {
    id: string
    name: string
    instagram_handle: string
    profile_image: string
    followers_count: number
    engagement_rate: number
    category: string
  }
}

export default function CampaignDetailPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  
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
      
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError
      setCampaign(campaignData)

      const { data: applicationData, error: appError } = await supabase
        .from('campaign_applications')
        .select(`
          *,
          influencers (
            id,
            name,
            instagram_handle,
            profile_image,
            followers_count,
            engagement_rate,
            category
          )
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (appError) throw appError
      setApplications(applicationData || [])
      
    } catch (error) {
      console.error('Error loading campaign:', error)
      router.push('/advertiser/campaigns')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
  setUpdating(true)
  try {
    // 1. 지원 상태 업데이트
    const { error: updateError } = await supabase
      .from('campaign_applications')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (updateError) throw updateError

    // 2. 알림 생성
    if (selectedApplication && campaign) {
      const { data: influencerData } = await supabase
        .from('influencers')
        .select('user_id')
        .eq('id', selectedApplication.influencers.id)
        .single()

      if (influencerData?.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: influencerData.user_id,
            type: newStatus === 'accepted' ? 'application_approved' : 'application_rejected',
            title: newStatus === 'accepted' 
              ? '🎉 캠페인 지원이 승인되었습니다!' 
              : '😢 캠페인 지원 결과',
            message: newStatus === 'accepted'
              ? `"${campaign.title}" 캠페인 지원이 승인되었습니다. 광고주의 DM을 기다려주세요!`
              : `"${campaign.title}" 캠페인 지원이 거절되었습니다. 다른 캠페인에 도전해보세요!`,
            related_id: campaign.id,
            is_read: false
          })
      }
    }

    // 3. 캠페인 새로고침
    await loadCampaign(params.id as string)
    
    // 4. UI 피드백
    if (newStatus === 'accepted' && selectedApplication) {
      alert('✅ 승인이 완료되었습니다!')
      
      // 선택된 지원자 정보 업데이트 (모달 유지)
      setSelectedApplication({
        ...selectedApplication,
        status: 'accepted'
      })
      
      // 인스타그램으로 이동 여부 확인
      const instagramHandle = selectedApplication.influencers.instagram_handle
      const confirmDM = confirm(
        `인플루언서 @${instagramHandle}의 인스타그램으로 이동하시겠습니까?\n\nDM으로 상세 내용을 논의해주세요.`
      )
      
      if (confirmDM) {
        window.open(`https://www.instagram.com/${instagramHandle}`, '_blank')
      }
      
      // 모달은 열어둔 상태 유지 (setShowDetail(false) 제거)
      
    } else if (newStatus === 'rejected') {
      alert('❌ 지원을 거절했습니다.')
      
      // 거절의 경우도 모달 유지하고 상태만 업데이트
      setSelectedApplication({
        ...selectedApplication,
        status: 'rejected'
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
    alert('상태 변경 중 오류가 발생했습니다')
  } finally {
    setUpdating(false)
  }
}
  const deleteCampaign = async () => {
    if (!confirm('정말 이 캠페인을 삭제하시겠습니까?')) return
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      alert('캠페인이 삭제되었습니다')
      router.push('/advertiser/campaigns')
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('캠페인 삭제 중 오류가 발생했습니다')
    }
  }

  const getStatusBadge = (status: string) => {
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
    
    const cfg = config[status] || config.pending
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
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/advertiser/campaigns')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">{campaign.title}</h1>
                <p className="text-xs text-gray-500">캠페인 상세</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/advertiser/campaigns/${params.id}/edit`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={deleteCampaign}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>캠페인 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">설명</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{campaign.description}</p>
            </div>
            
            {campaign.requirements && (
              <div>
                <h3 className="font-semibold mb-2">요구사항</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{campaign.requirements}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  예산: {campaign.budget_min?.toLocaleString()}원 ~ {campaign.budget_max?.toLocaleString()}원
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  기간: {campaign.start_date || '미정'} ~ {campaign.end_date || '미정'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>지원자 목록</span>
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {applications.length}명
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <p className="text-center text-gray-500 py-8">아직 지원자가 없습니다</p>
            ) : (
              <div className="divide-y">
                {applications.map(app => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 cursor-pointer rounded-lg"
                    onClick={() => {
                      setSelectedApplication(app)
                      setShowDetail(true)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {app.influencers.profile_image ? (
                        <img
                          src={app.influencers.profile_image}
                          alt={app.influencers.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{app.influencers.name}</h4>
                          {getStatusBadge(app.status)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <span>@{app.influencers.instagram_handle}</span>
                          <span>팔로워 {app.influencers.followers_count?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 지원자 상세 모달 */}
      {showDetail && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">지원자 상세</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDetail(false)
                  setSelectedApplication(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              {/* 인플루언서 정보 */}
              <div className="flex items-center gap-3">
                {selectedApplication.influencers.profile_image ? (
                  <img
                    src={selectedApplication.influencers.profile_image}
                    alt={selectedApplication.influencers.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedApplication.influencers.name}</h3>
                  <p className="text-gray-500">@{selectedApplication.influencers.instagram_handle}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      window.open(
                        `https://www.instagram.com/${selectedApplication.influencers.instagram_handle}`,
                        '_blank'
                      )
                    }}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    인스타그램 프로필
                  </Button>
                </div>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-3 gap-3 py-3 border-y">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedApplication.influencers.followers_count?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">팔로워</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedApplication.influencers.engagement_rate}%</p>
                  <p className="text-xs text-gray-500">참여율</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedApplication.influencers.category || '-'}</p>
                  <p className="text-xs text-gray-500">카테고리</p>
                </div>
              </div>

              {/* 지원 메시지 */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  지원 메시지
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedApplication.message || '메시지가 없습니다'}
                  </p>
                </div>
              </div>

              {/* 지원일 */}
              <div className="text-sm text-gray-500">
                지원일: {new Date(selectedApplication.created_at).toLocaleDateString('ko-KR')}
              </div>

              {/* 액션 버튼 */}
              {selectedApplication.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'accepted')}
                    disabled={updating}
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    승인하기
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                    disabled={updating}
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    거절하기
                  </Button>
                </div>
              )}

              {selectedApplication.status === 'accepted' && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-700 font-medium text-center">✓ 승인된 인플루언서입니다</p>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                      window.open(
                        `https://www.instagram.com/${selectedApplication.influencers.instagram_handle}`,
                        '_blank'
                      )
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    인스타그램 DM 보내기
                  </Button>
                </div>
              )}

              {selectedApplication.status === 'rejected' && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-red-700 font-medium text-center">거절된 지원입니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}