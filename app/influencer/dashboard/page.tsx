// app/influencer/dashboard/page.tsx

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
  Bell,
  TrendingUp,
  Users,
  DollarSign,
  Loader2,
  Calendar,
  ChevronRight
} from 'lucide-react'

export default function InfluencerDashboard() {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalEngagement: 0,
    activeCollaborations: 0,
    pendingOffers: 0
  })
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 통계 데이터 로드
      // ... 실제 로직

      // 최근 캠페인 로드
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select(`
          *,
          brands (name)
        `)
        .eq('status', 'active')
        .limit(5)
        .order('created_at', { ascending: false })

      if (campaignData) {
        setCampaigns(campaignData)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20">
        <Loader2 className="h-8 w-8 animate-spin text-[#51a66f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#51a66f]">Itda</h1>
            <Button variant="ghost" size="sm" onClick={() => router.push('/notifications')}>
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 검색바 */}
      <div className="px-4 py-3 bg-white/90 backdrop-blur-sm border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="캠페인 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-full bg-white/80"
          />
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">총 조회수</p>
                  <p className="text-xl font-bold">{stats.totalViews.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-[#51a66f]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">참여율</p>
                  <p className="text-xl font-bold">{stats.totalEngagement}%</p>
                </div>
                <Users className="h-5 w-5 text-[#51a66f]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">진행중</p>
                  <p className="text-xl font-bold">{stats.activeCollaborations}</p>
                </div>
                <Calendar className="h-5 w-5 text-[#51a66f]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">대기중</p>
                  <p className="text-xl font-bold">{stats.pendingOffers}</p>
                </div>
                <DollarSign className="h-5 w-5 text-[#51a66f]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 추천 캠페인 */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">추천 캠페인</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/campaigns')}
          >
            전체보기
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="space-y-3">
          {campaigns.map((campaign: any) => (
            <Card 
              key={campaign.id} 
              className="bg-white/90 backdrop-blur-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/campaigns/${campaign.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{campaign.title}</h3>
                    <p className="text-sm text-gray-500">{campaign.brands?.name}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">모집중</Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {campaign.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{campaign.category}</span>
                  <span className="font-medium">
                    {campaign.budget_min && campaign.budget_max 
                      ? `${Math.floor(campaign.budget_min/10000)}~${Math.floor(campaign.budget_max/10000)}만원`
                      : '협의'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}