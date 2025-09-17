import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Instagram, Users, Heart, MessageSquare, TrendingUp, Calendar, MapPin, Mail, Phone, Globe } from 'lucide-react'
import Link from 'next/link'
import { InstagramMetrics } from '@/components/influencer/instagram-metrics'

interface PageProps {
  params: { id: string }
}

export default async function InfluencerDetailPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: session } = await supabase.auth.getSession()
  if (!session?.session) {
    notFound()
  }

  const { data: influencer, error } = await supabase
    .from('influencers')
    .select(`
      *,
      categories (id, name),
      influencer_stats (*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !influencer) {
    notFound()
  }

  const stats = influencer.influencer_stats?.[0] || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">인플루언서 프로필</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={influencer.profile_image} alt={influencer.name} />
                <AvatarFallback>{influencer.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-2xl font-bold">{influencer.name}</h2>
                  <p className="text-gray-600">@{influencer.instagram_handle}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {influencer.categories && (
                    <Badge variant="secondary">{influencer.categories.name}</Badge>
                  )}
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {formatNumber(influencer.followers_count)} 팔로워
                  </Badge>
                  {influencer.location && (
                    <Badge variant="outline">
                      <MapPin className="h-3 w-3 mr-1" />
                      {influencer.location}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-gray-700">{influencer.bio}</p>

                <div className="flex gap-3">
                  <a 
                    href={`https://instagram.com/${influencer.instagram_handle}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline">
                      <Instagram className="h-4 w-4 mr-2" />
                      인스타그램 방문
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                <div>
                  <p className="text-2xl font-bold">{formatNumber(stats.avg_likes)}</p>
                  <p className="text-xs text-gray-600">평균 좋아요</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{formatNumber(stats.avg_comments)}</p>
                  <p className="text-xs text-gray-600">평균 댓글</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.engagement_rate?.toFixed(2) || 0}%</p>
                  <p className="text-xs text-gray-600">참여율</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.posts_per_month || 0}</p>
                  <p className="text-xs text-gray-600">월 평균 게시물</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="instagram" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="instagram" className="flex-1">인스타그램 분석</TabsTrigger>
            <TabsTrigger value="contact" className="flex-1">연락처 정보</TabsTrigger>
          </TabsList>

          <TabsContent value="instagram">
            <InstagramMetrics influencerId={influencer.id} instagramHandle={influencer.instagram_handle} />
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>연락처 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {influencer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{influencer.email}</span>
                  </div>
                )}
                {influencer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{influencer.phone}</span>
                  </div>
                )}
                {influencer.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a href={influencer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {influencer.website}
                    </a>
                  </div>
                )}
                {!influencer.email && !influencer.phone && !influencer.website && (
                  <p className="text-center text-gray-500 py-8">연락처 정보가 등록되지 않았습니다.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function formatNumber(num: number | null | undefined): string {
  if (!num) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}