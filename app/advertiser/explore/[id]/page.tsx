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
  campaign_applications?: {
    id: string
    influencer_id: string
    status: string
  }[]
}

export default function AdvertiserExploreCampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchCampaign()
  }, [params.id])

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          brands (
            id, name, logo_url, description, 
            contact_email, contact_phone, website
          ),
          campaign_applications (id, influencer_id, status)
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error
      setCampaign(data)
    } catch (error) {
      console.error('Error fetching campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatBudget = (min: number, max: number) => {
    const formatNum = (num: number) => {
      if (num >= 10000) return `${(num / 10000).toFixed(0)}만원`
      return `${num.toLocaleString()}원`
    }
    return `${formatNum(min)} ~ ${formatNum(max)}`
  }

  const calculateDaysLeft = () => {
    if (!campaign?.end_date) return null
    const today = new Date()
    const endDate = new Date(campaign.end_date)
    const timeDiff = endDate.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    return daysDiff > 0 ? daysDiff : 0
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              {copied && <span className="ml-2 text-xs">복사됨!</span>}
            </Button>
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
                    {campaign.status === 'active' ? '모집중' : '마감'}
                  </Badge>
                  {daysLeft !== null && daysLeft > 0 && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {daysLeft}일 남음
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">캠페인 소개</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {campaign.description}
                </p>
              </div>

              {campaign.requirements && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">참여 조건</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {campaign.requirements}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 캠페인 세부 정보 */}
        <Card className="bg-white/90 backdrop-blur-sm mb-4">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">캠페인 정보</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  예산
                </span>
                <span className="font-semibold text-[#51a66f]">
                  {formatBudget(campaign.budget_min, campaign.budget_max)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  기간
                </span>
                <span className="text-sm">
                  {campaign.start_date && campaign.end_date ? 
                    `${new Date(campaign.start_date).toLocaleDateString('ko-KR')} - ${new Date(campaign.end_date).toLocaleDateString('ko-KR')}` 
                    : '상시 모집'}
                </span>
              </div>

              {campaign.campaign_applications && campaign.campaign_applications.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    지원자
                  </span>
                  <span className="text-sm">
                    {campaign.campaign_applications.length}명 지원중
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 통계 정보 */}
        {campaign.campaign_applications && campaign.campaign_applications.length > 0 && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-800">캠페인 인사이트</span>
              </div>
              <p className="text-sm text-gray-600">
                현재 {campaign.campaign_applications.length}명의 인플루언서가 이 캠페인에 관심을 보이고 있습니다.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}