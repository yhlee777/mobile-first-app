'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Search,
  Filter,
  Briefcase,
  CheckCircle,
  Loader2
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
    logo_url: string
  }
  campaign_applications: {
    id: string
    status: string
  }[]
}

interface InfluencerProfile {
  id: string
  category: string
}

const categories = ['전체', '패션', '뷰티', '음식', '여행', '피트니스', '테크', '라이프스타일', '육아', '기타']

export default function InfluencerCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [myProfile, setMyProfile] = useState<InfluencerProfile | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadCampaignsAndProfile()
  }, [])

  const loadCampaignsAndProfile = async () => {
    try {
      setLoading(true)
      
      // 현재 인플루언서 프로필 가져오기
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('influencers')
        .select('id, category')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setMyProfile(profileData)
        setCategoryFilter(profileData.category || '전체')
      }

      // 캠페인 목록 가져오기 (내 지원 정보 포함)
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          brands (name, logo_url),
          campaign_applications!left (
            id,
            status
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error

      // 내가 지원한 캠페인 표시
      const campaignsWithApplications = data?.map(campaign => ({
        ...campaign,
        campaign_applications: campaign.campaign_applications?.filter(
          (app: any) => profileData && app.influencer_id === profileData.id
        ) || []
      }))

      setCampaigns(campaignsWithApplications || [])
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
    return `${format(min)} ~ ${format(max)}원`
  }

  const getApplicationStatus = (campaign: Campaign) => {
    if (campaign.campaign_applications?.length > 0) {
      const app = campaign.campaign_applications[0]
      switch (app.status) {
        case 'pending':
          return <Badge className="bg-yellow-100 text-yellow-700">지원완료</Badge>
        case 'accepted':
          return <Badge className="bg-green-100 text-green-700">승인됨</Badge>
        case 'rejected':
          return <Badge className="bg-red-100 text-red-700">거절됨</Badge>
        default:
          return null
      }
    }
    return null
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === '전체' || 
                          !categoryFilter || 
                          campaign.category === categoryFilter ||
                          (!campaign.category && categoryFilter === '기타')
    
    return matchesSearch && matchesCategory
  })

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
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">캠페인 찾기</h1>
                <p className="text-xs text-gray-500">참여할 캠페인을 찾아보세요</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              내 카테고리: {myProfile?.category || '미설정'}
            </Badge>
          </div>
        </div>
      </header>

      {/* 검색 및 필터 */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="캠페인 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 h-9 text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 h-9"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <label className="text-xs font-medium">카테고리</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat} {cat === myProfile?.category && '(내 카테고리)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* 결과 카운트 */}
      <div className="px-4 py-2 bg-gray-50 border-b">
        <span className="text-xs text-gray-600">
          총 <span className="font-semibold text-gray-900">{filteredCampaigns.length}</span>개의 캠페인
        </span>
      </div>

      {/* 캠페인 목록 */}
      <main className="px-4 py-4">
        {filteredCampaigns.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {categoryFilter === myProfile?.category 
                  ? '현재 내 카테고리에 진행중인 캠페인이 없습니다' 
                  : '해당 카테고리에 진행중인 캠페인이 없습니다'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setCategoryFilter('전체')}
              >
                전체 캠페인 보기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredCampaigns.map(campaign => (
              <Card
                key={campaign.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/influencer/campaigns/${campaign.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{campaign.title}</CardTitle>
                      <p className="text-xs text-gray-500 mt-1">by {campaign.brands?.name}</p>
                    </div>
                    {getApplicationStatus(campaign)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {campaign.description}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-gray-500" />
                      <span>{formatBudget(campaign.budget_min, campaign.budget_max)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      <span>{campaign.start_date} ~ {campaign.end_date}</span>
                    </div>
                    {campaign.category && (
                      <Badge variant="outline" className="text-xs">
                        {campaign.category}
                      </Badge>
                    )}
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