'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/navigation/bottom-nav'
import { 
  Calendar,
  ChevronRight,
  Sparkles,
  Instagram,
  Users,
  Activity,
  Star,
  Target,
  ArrowRight,
  Bell,
  LogOut
} from 'lucide-react'

interface Stats {
  activeApplications: number
  acceptedCampaigns: number
  followers: number
  engagementRate: number
  profileImage?: string
  name?: string
  instagramHandle?: string
}

interface Campaign {
  id: string
  campaigns: {
    title: string
    budget_min: number
    budget_max: number
    start_date: string
    brands: {
      name: string
    }
  }
  status: string
  created_at: string
}

interface RecommendedCampaign {
  id: string
  title: string
  budget_min: number
  budget_max: number
  category: string
  brands: {
    name: string
  }
}

export default function InfluencerDashboard() {
  const [stats, setStats] = useState<Stats>({
    activeApplications: 0,
    acceptedCampaigns: 0,
    followers: 0,
    engagementRate: 0
  })
  const [applications, setApplications] = useState<Campaign[]>([])
  const [recommendedCampaigns, setRecommendedCampaigns] = useState<RecommendedCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [notificationCount, setNotificationCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  // formatBudget 함수를 여기에 정의
  const formatBudget = (min: number, max: number) => {
    const format = (n: number) => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(0)}백만`
      if (n >= 10000) return `${(n / 10000).toFixed(0)}만`
      return n.toLocaleString()
    }
    return `${format(min)}~${format(max)}원`
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      accepted: 'bg-green-50 text-green-700 border-green-200',
      rejected: 'bg-red-50 text-red-700 border-red-200'
    }
    const labels = {
      pending: '검토중',
      accepted: '승인됨',
      rejected: '거절됨'
    }
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles] || ''}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  useEffect(() => {
    loadDashboard()
    loadRecommendedCampaigns()
    loadNotificationCount()
  }, [])

  const loadNotificationCount = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    
    setNotificationCount(count || 0)
  }

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: influencer } = await supabase
        .from('influencers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!influencer) {
        router.push('/signup?tab=influencer')
        return
      }

      const { data: apps, error } = await supabase
        .from('campaign_applications')
        .select(`
          *,
          campaigns (
            title,
            budget_min,
            budget_max,
            start_date,
            brands (name)
          )
        `)
        .eq('influencer_id', influencer.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!error && apps) {
        setApplications(apps)
        
        const active = apps.filter(a => a.status === 'pending').length
        const accepted = apps.filter(a => a.status === 'accepted').length
        
        setStats({
          activeApplications: active,
          acceptedCampaigns: accepted,
          followers: influencer.followers_count || 0,
          engagementRate: influencer.engagement_rate || 0,
          profileImage: influencer.profile_image,
          name: influencer.name,
          instagramHandle: influencer.instagram_handle
        })
      }
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendedCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          budget_min,
          budget_max,
          category,
          brand_id,
          brands (name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) {
        console.error('Error:', error)
        return
      }

      if (data) {
        const campaigns: RecommendedCampaign[] = data.map(item => ({
          id: item.id,
          title: item.title,
          budget_min: item.budget_min,
          budget_max: item.budget_max,
          category: item.category,
          brands: {
            name: (item.brands as any)?.name || '브랜드명 없음'
          }
        }))
        
        setRecommendedCampaigns(campaigns)
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20 pb-20">
      {/* 헤더 프로필 섹션 */}
      <div className="bg-gradient-to-r from-[#51a66f] to-emerald-600 text-white px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 알림 버튼 추가 */}
          <div className="flex justify-end gap-2 mb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/notifications')}
              className="relative bg-white/20 backdrop-blur hover:bg-white/30 text-white border-0 p-2"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 z-10">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </div>
              )}
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/')
              }}
              className="bg-white/20 backdrop-blur hover:bg-white/30 text-white border-0 p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            {stats.profileImage ? (
              <img 
                src={stats.profileImage} 
                alt={stats.name}
                className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <Instagram className="h-10 w-10" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{stats.name || '인플루언서'}</h1>
              <p className="text-white/80 text-sm flex items-center gap-1">
                <Instagram className="h-3 w-3" />
                @{stats.instagramHandle || 'username'}
              </p>
            </div>
            <Button 
              variant="secondary"
              size="sm"
              onClick={() => router.push('/influencer/profile')}
              className="bg-white/20 backdrop-blur hover:bg-white/30 text-white border-0"
            >
              프로필 수정
            </Button>
          </div>

          {/* 인스타그램 통계 */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/70 mb-1">팔로워</p>
                    <p className="text-2xl font-bold">
                      {stats.followers > 10000 
                        ? `${(stats.followers / 10000).toFixed(1)}만`
                        : stats.followers.toLocaleString()}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-white/50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/70 mb-1">참여율</p>
                    <p className="text-2xl font-bold">{stats.engagementRate}%</p>
                    {stats.engagementRate > 5 && (
                      <p className="text-xs text-green-300">높음</p>
                    )}
                  </div>
                  <Activity className="h-8 w-8 text-white/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* 활동 통계 카드 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card 
            className="bg-white/90 backdrop-blur hover:shadow-md transition-all cursor-pointer"
            onClick={() => router.push('/influencer/applications?tab=pending')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-[#51a66f]" />
                <Badge variant="secondary" className="bg-green-50 text-[#51a66f] border-0">
                  활성
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{stats.activeApplications}</p>
              <p className="text-xs text-gray-600">지원 중인 캠페인</p>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-white/90 backdrop-blur hover:shadow-md transition-all cursor-pointer"
            onClick={() => router.push('/influencer/applications?tab=accepted')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Star className="h-5 w-5 text-amber-500" />
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-0">
                  성공
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{stats.acceptedCampaigns}</p>
              <p className="text-xs text-gray-600">승인된 캠페인</p>
            </CardContent>
          </Card>
        </div>

        {/* 추천 캠페인 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#51a66f]" />
              추천 캠페인
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/influencer/campaigns')}
              className="text-[#51a66f]"
            >
              전체보기
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {recommendedCampaigns.map((campaign) => (
              <Card 
                key={campaign.id}
                className="bg-white/80 backdrop-blur hover:shadow-md transition-all cursor-pointer border-l-4 border-l-[#51a66f]"
                onClick={() => router.push(`/influencer/campaigns/${campaign.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{campaign.title}</h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {campaign.brands.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {campaign.category && (
                          <Badge variant="secondary" className="text-xs">
                            {campaign.category}
                          </Badge>
                        )}
                        <span className="text-xs font-semibold text-[#51a66f]">
                          {formatBudget(campaign.budget_min, campaign.budget_max)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 최근 지원 현황 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">최근 지원 현황</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/influencer/applications')}
              className="text-[#51a66f]"
            >
              전체보기
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {applications.length > 0 ? (
              applications.map((app) => (
                <Card 
                  key={app.id}
                  className="bg-white/80 backdrop-blur hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/influencer/applications/${app.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{app.campaigns.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {app.campaigns.brands.name}
                        </p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(app.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="font-semibold text-gray-700">
                        {formatBudget(app.campaigns.budget_min, app.campaigns.budget_max)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">아직 지원한 캠페인이 없어요</p>
                  <Button 
                    onClick={() => router.push('/influencer/campaigns')}
                    className="bg-[#51a66f] hover:bg-[#449960]"
                  >
                    캠페인 둘러보기
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 바 */}
      <BottomNav />
    </div>
  )
}