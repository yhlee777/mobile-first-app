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
  Building,
  Users,
  MapPin,
  Hash,
  Loader2,
  Eye,
  Heart,
  Share2,
  ExternalLink,
  Clock,
  Target,
  TrendingUp,
  CheckCircle
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
  brands: {
    id: string
    name: string
    logo_url?: string
    description?: string
    contact_email?: string
    contact_phone?: string
    website?: string
  }
}

export default function CampaignExplorePage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [applicationCount, setApplicationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  
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
      
      // 캠페인 정보 가져오기
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select(`
          *,
          brands (
            id,
            name,
            logo_url,
            description,
            contact_email,
            contact_phone,
            website
          )
        `)
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError
      setCampaign(campaignData)

      // 지원자 수만 가져오기 (count만)
      const { count, error: countError } = await supabase
        .from('campaign_applications')
        .select('id', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)

      if (!countError && count !== null) {
        setApplicationCount(count)
      }
      
    } catch (error) {
      console.error('Error loading campaign:', error)
      router.push('/advertiser/explore')
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

  const toggleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign?.title,
        text: campaign?.description,
        url: window.location.href
      })
    }
  }

  const calculateDaysLeft = () => {
    if (!campaign?.end_date) return null
    const end = new Date(campaign.end_date)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
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

  const daysLeft = calculateDaysLeft()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/advertiser/explore')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              돌아가기
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSave}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* 브랜드 정보 카드 */}
        <Card className="bg-white/90 backdrop-blur-sm mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {campaign.brands.logo_url ? (
                <img
                  src={campaign.brands.logo_url}
                  alt={campaign.brands.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <Building className="h-6 w-6 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="font-semibold">{campaign.brands.name}</h3>
                {campaign.brands.website && (
                  <a 
                    href={campaign.brands.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#51a66f] hover:underline flex items-center gap-1 mt-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    웹사이트 방문
                  </a>
                )}
              </div>
            </div>
            
            {campaign.brands.description && (
              <p className="text-sm text-gray-600 mt-3">
                {campaign.brands.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 캠페인 메인 정보 */}
        <Card className="bg-white/90 backdrop-blur-sm mb-4">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{campaign.title}</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {campaign.category && (
                    <Badge variant="secondary">{campaign.category}</Badge>
                  )}
                  <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                    {campaign.status === 'active' ? '진행중' : '마감'}
                  </Badge>
                  {daysLeft !== null && daysLeft > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {daysLeft}일 남음
                    </Badge>
                  )}
                </div>
              </div>
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
            </div>
          </CardContent>
        </Card>

        {/* 통계 정보 */}
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
                  <p className="text-xs text-gray-500">지원자</p>
                  <p className="text-sm font-semibold">
                    {applicationCount}명
                  </p>
                </div>
                <Users className="h-5 w-5 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 일정 정보 */}
        <Card className="bg-white/90 backdrop-blur-sm mb-4">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-1">
              <Calendar className="h-4 w-4 text-[#51a66f]" />
              캠페인 일정
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">시작일</span>
                <span className="font-medium">
                  {campaign.start_date 
                    ? new Date(campaign.start_date).toLocaleDateString('ko-KR')
                    : '미정'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">종료일</span>
                <span className="font-medium">
                  {campaign.end_date 
                    ? new Date(campaign.end_date).toLocaleDateString('ko-KR')
                    : '미정'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 안내 메시지 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  참고용 열람
                </p>
                <p className="text-xs text-blue-700">
                  다른 브랜드의 캠페인 전략과 예산을 참고하여 
                  더 나은 캠페인을 기획해보세요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}