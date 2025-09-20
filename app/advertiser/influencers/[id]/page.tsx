'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Users, 
  TrendingUp, 
  Eye, 
  Instagram,
  MapPin,
  Camera,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Share2,
  MoreVertical,
  Star,
  Activity,
  Calendar,
  X,
  Loader2,
  Hash
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface Influencer {
  id: string
  instagram_handle: string
  name: string
  bio: string
  category: string
  location?: string
  followers_count: number
  engagement_rate: number
  profile_image?: string
  is_verified?: boolean
  portfolio_urls?: string[]
  created_at?: string
  updated_at?: string
  hashtags?: string[]
}

interface InstagramPost {
  id: string
  media_url: string
  caption?: string
  like_count: number
  comments_count: number
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
}

interface InstagramMetrics {
  username: string
  name: string
  bio: string
  profile_picture_url: string
  followers_count: number
  media_count: number
  follows_count: number
  is_verified: boolean
}

export default function InfluencerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [influencer, setInfluencer] = useState<Influencer | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [instagramData, setInstagramData] = useState<{
    metrics?: InstagramMetrics
    posts?: InstagramPost[]
  }>({})
  const [loadingInstagram, setLoadingInstagram] = useState(false)

  useEffect(() => {
    fetchInfluencer()
    checkIfLiked()
  }, [params.id])

  const fetchInfluencer = async () => {
    try {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setInfluencer(data)

      // Instagram 데이터 가져오기
      if (data?.instagram_handle) {
        fetchInstagramData(data.instagram_handle, data.id)
      }
    } catch (error) {
      console.error('Error fetching influencer:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInstagramData = async (handle: string, influencerId: string) => {
    setLoadingInstagram(true)
    try {
      const response = await fetch(`/api/ig/metrics?handle=${handle}&influencerId=${influencerId}`)
      if (response.ok) {
        const data = await response.json()
        setInstagramData(data)
      }
    } catch (error) {
      console.error('Error fetching Instagram data:', error)
    } finally {
      setLoadingInstagram(false)
    }
  }

  const checkIfLiked = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('influencer_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('influencer_id', params.id)
        .single()

      setIsLiked(!!data)
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }

  const handleLikeToggle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      if (isLiked) {
        await supabase
          .from('influencer_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('influencer_id', params.id)
      } else {
        await supabase
          .from('influencer_likes')
          .insert({
            user_id: user.id,
            influencer_id: params.id
          })
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error('Error toggling like:', error)
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

  const categoryColor = {
    '패션': 'bg-pink-100 text-pink-700',
    '뷰티': 'bg-purple-100 text-purple-700',
    '음식': 'bg-orange-100 text-orange-700',
    '여행': 'bg-blue-100 text-blue-700',
    '피트니스': 'bg-green-100 text-green-700',
    '테크': 'bg-gray-100 text-gray-700',
    '라이프스타일': 'bg-amber-100 text-amber-700',
    '육아': 'bg-yellow-100 text-yellow-700',
    '기타': 'bg-gray-100 text-gray-700'
  }[influencer?.category || '기타'] || 'bg-gray-100 text-gray-700'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-gray-500">프로필을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!influencer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">인플루언서를 찾을 수 없습니다</p>
          <Button onClick={() => router.push('/advertiser')}>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  // 평균 좋아요 계산 (팔로워 * 참여율)
  const averageLikes = Math.round((influencer.followers_count * influencer.engagement_rate) / 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">뒤로가기</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant={isLiked ? "default" : "outline"}
                size="icon"
                onClick={handleLikeToggle}
                className={isLiked ? "bg-red-500 hover:bg-red-600 border-red-500" : ""}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-white text-white" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 - 모바일에서 하단 패딩 추가 */}
      <div className="pb-20 sm:pb-0">
        {/* 프로필 섹션 */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              {/* 프로필 이미지 */}
              <div className="relative">
                {influencer.profile_image ? (
                  <img
                    src={influencer.profile_image}
                    alt={influencer.name}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-green-100"
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <Users className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {influencer.name}
                    </h1>
                    {influencer.is_verified && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={categoryColor}>
                      {influencer.category}
                    </Badge>
                    {influencer.location && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {influencer.location}
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-4">@{influencer.instagram_handle}</p>
                
                {influencer.bio && (
                  <p className="text-gray-700 max-w-2xl mb-4">{influencer.bio}</p>
                )}

                {/* 해시태그 섹션 */}
                {influencer.hashtags && influencer.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {influencer.hashtags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-50 text-blue-600 border-blue-200"
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => window.open(`https://instagram.com/${influencer.instagram_handle}`, '_blank')}
                >
                  <Instagram className="h-5 w-5 mr-2" />
                  Instagram 프로필 보기
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(influencer.followers_count)}
                </p>
                <p className="text-sm text-blue-700">팔로워</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">
                  {influencer.engagement_rate}%
                </p>
                <p className="text-sm text-green-700">참여율</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">
                  {formatNumber(averageLikes)}
                </p>
                <p className="text-sm text-purple-700">평균 좋아요</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-900">
                  {influencer.category}
                </p>
                <p className="text-sm text-amber-700">전문 분야</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instagram 피드 미리보기 */}
        {instagramData.posts && instagramData.posts.length > 0 && (
          <div className="container mx-auto px-4 py-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="h-5 w-5" />
                  최근 게시물
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {instagramData.posts.slice(0, 9).map((post) => (
                    <div
                      key={post.id}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer"
                      onClick={() => window.open(`https://instagram.com/p/${post.id}`, '_blank')}
                    >
                      <img
                        src={post.media_url}
                        alt={post.caption || 'Instagram post'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {formatNumber(post.like_count)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {formatNumber(post.comments_count)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 포트폴리오 갤러리 */}
        {influencer.portfolio_urls && influencer.portfolio_urls.length > 0 && (
          <div className="container mx-auto px-4 py-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  포트폴리오
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {influencer.portfolio_urls.map((url, index) => (
                    <div
                      key={index}
                      className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(url)}
                    >
                      <img
                        src={url}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 추가 정보 섹션 */}
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>활동 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {influencer.created_at && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">가입일</span>
                    <span className="text-sm font-medium">
                      {new Date(influencer.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                )}
                {influencer.updated_at && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">마지막 업데이트</span>
                    <span className="text-sm font-medium">
                      {new Date(influencer.updated_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">인증 상태</span>
                  <span className="text-sm font-medium">
                    {influencer.is_verified ? (
                      <span className="flex items-center gap-1 text-blue-600">
                        <CheckCircle className="h-4 w-4" />
                        인증 완료
                      </span>
                    ) : (
                      <span className="text-gray-400">미인증</span>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 이미지 모달 */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <img
            src={selectedImage}
            alt="Portfolio"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* 하단 고정 버튼 (모바일) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t sm:hidden">
        <Button
          className="w-full bg-[#51a66f] hover:bg-[#449960]"
          size="lg"
          onClick={() => {
            // 협업 제안 또는 연락하기 기능
            router.push(`/advertiser/contact/${influencer.id}`)
          }}
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          협업 제안하기
        </Button>
      </div>
    </div>
  )
}