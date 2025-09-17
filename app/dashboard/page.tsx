import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Filter, Users, Heart, TrendingUp, Instagram, LogOut, User, BarChart3, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 사용자 정보 가져오기
  const { data: userData } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', user.id)
    .single()

  // 브랜드 정보 가져오기
  const { data: brandData } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // 인플루언서 목록 가져오기
  const { data: influencers } = await supabase
    .from('influencers')
    .select(`
      *,
      categories (name),
      influencer_stats (*)
    `)
    .limit(20)
    .order('followers_count', { ascending: false })

  // 통계 데이터
  const totalInfluencers = influencers?.length || 0
  const avgFollowers = influencers?.reduce((sum, inf) => sum + (inf.followers_count || 0), 0) / totalInfluencers || 0
  const avgEngagement = influencers?.reduce((sum, inf) => sum + (inf.influencer_stats?.[0]?.engagement_rate || 0), 0) / totalInfluencers || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">광고주 대시보드</h1>
              <p className="text-sm text-gray-600">{brandData?.company_name || brandData?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  프로필
                </Button>
              </Link>
              <form action="/api/auth/signout" method="post">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 통계 카드 */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 인플루언서</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInfluencers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">등록된 인플루언서</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">평균 팔로워</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(avgFollowers)}</div>
              <p className="text-xs text-muted-foreground">인플루언서 평균</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">평균 참여율</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgEngagement.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">평균 인게이지먼트</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">캠페인 예산</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩0</div>
              <p className="text-xs text-muted-foreground">이번 달 집행</p>
            </CardContent>
          </Card>
        </div>

        {/* 검색 바 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">인플루언서 찾기</h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="인플루언서 이름, 카테고리로 검색..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              필터
            </Button>
          </div>
        </div>

        {/* 인플루언서 목록 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">추천 인플루언서</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {influencers?.map((influencer) => {
              const stats = influencer.influencer_stats?.[0] || {}
              return (
                <Link key={influencer.id} href={`/influencer/${influencer.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={influencer.profile_image} alt={influencer.name} />
                          <AvatarFallback>{influencer.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{influencer.name}</CardTitle>
                          <p className="text-sm text-gray-500 truncate">@{influencer.instagram_handle}</p>
                        </div>
                        {influencer.is_verified && (
                          <Badge variant="secondary" className="shrink-0">인증됨</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {influencer.bio || '소개가 없습니다.'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{formatNumber(influencer.followers_count)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-gray-400" />
                          <span>{formatNumber(stats.avg_likes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                          <span>{stats.engagement_rate?.toFixed(1) || 0}%</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        {influencer.categories && (
                          <Badge variant="outline">{influencer.categories.name}</Badge>
                        )}
                        {influencer.location && (
                          <Badge variant="outline">{influencer.location}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

function formatNumber(num: number | null | undefined): string {
  if (!num) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}