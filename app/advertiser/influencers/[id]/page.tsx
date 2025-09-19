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
  Loader2
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
}

export default function InfluencerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [isLiked, setIsLiked] = useState(false)
  const [influencer, setInfluencer] = useState<Influencer | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showShare, setShowShare] = useState(false)
  
  const influencerId = params?.id as string

  useEffect(() => {
    if (influencerId) {
      loadInfluencerData()
      checkIfLiked()
    }
  }, [influencerId])

  const loadInfluencerData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', influencerId)
        .single()

      if (error) {
        console.error('Error loading influencer:', error)
        // 에러 시 목록으로 돌아가기
        router.push('/advertiser')
        return
      }

      if (data) {
        setInfluencer({
          id: data.id,
          instagram_handle: data.instagram_handle || '',
          name: data.name || data.instagram_handle || '이름 미설정',
          bio: data.bio || '',
          category: data.category || '미분류',
          location: data.location || '미설정',
          followers_count: data.followers_count || 0,
          engagement_rate: data.engagement_rate || 0,
          profile_image: data.profile_image || '',
          is_verified: data.is_verified || false,
          portfolio_urls: data.portfolio_urls || [],
          created_at: data.created_at,
          updated_at: data.updated_at
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkIfLiked = async () => {
    try {
      const savedLikes = localStorage.getItem('likedInfluencers')
      if (savedLikes) {
        const likes = JSON.parse(savedLikes)
        setIsLiked(likes.includes(influencerId))
      }
    } catch (error) {
      console.error('Error checking likes:', error)
    }
  }

  const handleLikeToggle = () => {
    try {
      const savedLikes = localStorage.getItem('likedInfluencers')
      let likes = savedLikes ? JSON.parse(savedLikes) : []
      
      if (isLiked) {
        likes = likes.filter((id: string) => id !== influencerId)
      } else {
        likes.push(influencerId)
      }
      
      localStorage.setItem('likedInfluencers', JSON.stringify(likes))
      setIsLiked(!isLiked)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${influencer?.name} - 인플루언서 프로필`,
          text: influencer?.bio || '',
          url: url
        })
      } catch (err) {
        console.log('Share failed:', err)
      }
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(url)
      alert('링크가 복사되었습니다!')
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
                {influencer.is_verified && (
                  <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mb-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {influencer.name}
                  </h1>
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

                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => window.open(`https://instagram.com/${influencer.instagram_handle}`, '_blank')}
                >
                  Instagram 프로필 보기
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 카드 - 모바일 */}
        <div className="sm:hidden px-4 py-6">
          <h3 className="font-semibold text-gray-900 mb-4">성과 지표</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            <div className="flex-shrink-0 w-40 bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(influencer.followers_count)}
              </p>
              <p className="text-sm text-gray-600">팔로워</p>
            </div>
            
            <div className="flex-shrink-0 w-40 bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200">
              <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {influencer.engagement_rate}%
              </p>
              <p className="text-sm text-gray-600">참여율</p>
            </div>
            
            <div className="flex-shrink-0 w-40 bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-2xl border border-pink-200">
              <Heart className="h-8 w-8 text-pink-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(averageLikes)}
              </p>
              <p className="text-sm text-gray-600">평균 좋아요</p>
            </div>
          </div>
        </div>

        {/* 통계 카드 - 데스크톱 */}
        <div className="hidden sm:block container mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(influencer.followers_count)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">팔로워</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {influencer.engagement_rate}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">참여율</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(averageLikes)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">평균 좋아요</p>
                  </div>
                  <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 포트폴리오 섹션 */}
        {influencer.portfolio_urls && influencer.portfolio_urls.length > 0 && (
          <div className="container mx-auto px-4 py-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>포트폴리오</span>
                  <Badge variant="outline">{influencer.portfolio_urls.length}개</Badge>
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
                      <Badge className="bg-blue-100 text-blue-700">인증됨</Badge>
                    ) : (
                      <Badge variant="outline">미인증</Badge>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 문의하기 섹션 - 데스크톱 */}
        <div className="hidden sm:block container mx-auto px-4 pb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">이 인플루언서와 협업하고 싶으신가요?</h3>
              <p className="text-gray-600 mb-4">지금 바로 문의해보세요</p>
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => alert('문의 기능은 준비 중입니다')}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                문의하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 문의하기 버튼 - 모바일 하단 고정 */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-30">
        <Button 
          size="lg" 
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={() => alert('문의 기능은 준비 중입니다')}
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          문의하기
        </Button>
      </div>

      {/* 이미지 모달 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={selectedImage}
            alt="Portfolio"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  )
}