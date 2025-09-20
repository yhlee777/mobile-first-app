'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/navigation/bottom-nav'
import { 
  ArrowLeft,
  Calendar,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

interface Application {
  id: string
  status: string
  created_at: string
  campaigns: {
    id: string
    title: string
    budget_min: number
    budget_max: number
    start_date: string
    end_date: string
    brands: {
      name: string
      logo_url?: string
    }
  }
}

// 실제 컴포넌트를 분리
function ApplicationsContent() {
  const searchParams = useSearchParams()
  const [applications, setApplications] = useState<Application[]>([])
  
  // URL 파라미터에서 초기 탭 설정
  const initialTab = searchParams.get('tab') as 'pending' | 'accepted' | 'rejected' || 'pending'
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>(initialTab)
  
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: influencer } = await supabase
        .from('influencers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!influencer) {
        router.push('/signup?tab=influencer')
        return
      }

      const { data, error } = await supabase
        .from('campaign_applications')
        .select(`
          *,
          campaigns (
            id,
            title,
            budget_min,
            budget_max,
            start_date,
            end_date,
            brands (
              name,
              logo_url
            )
          )
        `)
        .eq('influencer_id', influencer.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setApplications(data)
      }
    } catch (error) {
      console.error('Error loading applications:', error)
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
    return `${format(min)}~${format(max)}원`
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: '검토중',
      accepted: '승인됨',
      rejected: '거절됨'
    }
    return labels[status as keyof typeof labels] || status
  }

  const filteredApplications = applications.filter(app => app.status === activeTab)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20">
        <Loader2 className="h-8 w-8 animate-spin text-[#51a66f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/influencer/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-semibold">내 지원 현황</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 탭 */}
      <div className="px-4 py-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="pending" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              검토중 ({applications.filter(a => a.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              승인됨 ({applications.filter(a => a.status === 'accepted').length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              거절됨 ({applications.filter(a => a.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredApplications.length > 0 ? (
              <div className="space-y-3">
                {filteredApplications.map((app) => (
                  <Card 
                    key={app.id}
                    className="bg-white/80 backdrop-blur hover:shadow-md transition-all cursor-pointer"
                    onClick={() => router.push(`/influencer/campaigns/${app.campaigns.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{app.campaigns.title}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {app.campaigns.brands.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(app.status)}
                          <Badge variant="outline" className="text-xs">
                            {getStatusLabel(app.status)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          지원일: {new Date(app.created_at).toLocaleDateString('ko-KR')}
                        </span>
                        <span className="font-semibold text-[#51a66f]">
                          {formatBudget(app.campaigns.budget_min, app.campaigns.budget_max)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">
                    {activeTab === 'pending' && '검토 중인 캠페인이 없습니다'}
                    {activeTab === 'accepted' && '승인된 캠페인이 없습니다'}
                    {activeTab === 'rejected' && '거절된 캠페인이 없습니다'}
                  </p>
                  <Button
                    className="mt-4 bg-[#51a66f] hover:bg-[#449960]"
                    onClick={() => router.push('/influencer/campaigns')}
                  >
                    새 캠페인 찾아보기
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  )
}

// 메인 컴포넌트를 Suspense로 감싸기
export default function ApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20">
        <Loader2 className="h-8 w-8 animate-spin text-[#51a66f]" />
      </div>
    }>
      <ApplicationsContent />
    </Suspense>
  )
}