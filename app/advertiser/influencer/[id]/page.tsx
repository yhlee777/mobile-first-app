'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
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
  X
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
  profile_picture_url?: string
  is_verified?: boolean
  media_urls?: string[]
  total_reach?: number
  average_likes?: number
  portfolio_urls?: string[]
}

const mockInfluencersData: Record<string, Influencer> = {
  '1': {
    id: '1',
    name: '방방뷔',
    instagram_handle: 'bangbangvui',
    bio: '일상 속 특별한 순간을 담는 인플루언서입니다. 패션, 뷰티, 라이프스타일 콘텐츠를 통해 여러분의 일상에 영감을 드리고자 합니다.',
    category: '일상',
    location: '서울',
    followers_count: 20000,
    engagement_rate: 4.2,
    average_likes: 840,
    profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    is_verified: true,
    portfolio_urls: [
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop'
    ]
  },
  '2': {
    id: '2',
    name: '아이유 (IU)',
    instagram_handle: 'dlwlrma',
    bio: '가수 배우 IU 공식 인스타그램. 음악, 드라마, 일상을 공유합니다.',
    category: '셀럽',
    location: '서울',
    followers_count: 32000000,
    engagement_rate: 8.5,
    average_likes: 2720000,
    profile_picture_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
    is_verified: true,
    portfolio_urls: [
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop'
    ]
  },
  '3': {
    id: '3',
    name: '제시카 (Jessica)',
    instagram_handle: 'jessica.syj',
    bio: '패션 뷰티 크리에이터. 일상 속 특별함을 찾아 공유합니다.',
    category: '패션',
    location: '서울',
    followers_count: 11934011,
    engagement_rate: 5.2,
    average_likes: 620569,
    profile_picture_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
    is_verified: true,
    portfolio_urls: []  // 빈 배열로 테스트
  },
  '4': {
    id: '4',
    name: '포니 (PONY)',
    instagram_handle: 'ponysmakeup',
    bio: '메이크업 아티스트 포니. 뷰티 튜토리얼과 메이크업 팁을 공유합니다.',
    category: '뷰티',
    location: '서울',
    followers_count: 8746801,
    engagement_rate: 6.8,
    average_likes: 594782,
    profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    is_verified: true,
    portfolio_urls: [
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop'
    ]
  }
}

export default function InfluencerDetailPage() {
  const params = useParams()
  const [isLiked, setIsLiked] = useState(false)
  const [influencer, setInfluencer] = useState<Influencer | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showShare, setShowShare] = useState(false)
  
  const influencerId = params?.id as string

  useEffect(() => {
    if (influencerId && mockInfluencersData[influencerId]) {
      setInfluencer(mockInfluencersData[influencerId])
    } else {
      setInfluencer({
        id: influencerId,
        name: '인플루언서',
        instagram_handle: 'influencer',
        bio: '인플루언서 소개',
        category: '카테고리',
        location: '서울',
        followers_count: 10000,
        engagement_rate: 3.5,
        average_likes: 420,
        profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
        is_verified: false,
        portfolio_urls: []
      })
    }
  }, [influencerId])

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      '패션': 'bg-purple-100 text-purple-700 border-purple-200',
      '뷰티': 'bg-pink-100 text-pink-700 border-pink-200',
      '여행': 'bg-blue-100 text-blue-700 border-blue-200',
      '음식': 'bg-orange-100 text-orange-700 border-orange-200',
      '피트니스': 'bg-green-100 text-green-700 border-green-200',
      '일상': 'bg-gray-100 text-gray-700 border-gray-200',
      '라이프스타일': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      '셀럽': 'bg-red-100 text-red-700 border-red-200'
    }
    return colorMap[category] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${influencer?.name} - 인플루언서 프로필`,
          text: `${influencer?.bio}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('공유 취소 또는 오류:', error)
      }
    } else {
      setShowShare(true)
      setTimeout(() => setShowShare(false), 2000)
    }
  }

  if (!influencer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const instagramUrl = 'https://instagram.com/' + influencer.instagram_handle
  const categoryColor = getCategoryColor(influencer.category)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 상단 네비게이션 */}
      <div className="bg-white border-b sticky top-0 z-30 backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/advertiser">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-base sm:text-lg font-semibold truncate max-w-[150px] sm:max-w-none">
              {influencer.name}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`h-5 w-5 transition-all ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {showShare && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg z-50 shadow-lg">
          링크가 복사되었습니다
        </div>
      )}

      {/* 프로필 헤더 섹션 */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* 프로필 이미지 */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-green-100 shadow-xl">
                <img 
                  src={influencer.profile_picture_url} 
                  alt={influencer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {influencer.is_verified && (
                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1.5 border-4 border-white">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* 프로필 정보 */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {influencer.name}
                </h2>
                <Badge className={`${categoryColor} border font-semibold px-3 py-0.5`}>
                  {influencer.category}
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Instagram className="h-4 w-4" />
                  <span>@{influencer.instagram_handle}</span>
                </div>
                {influencer.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{influencer.location}</span>
                  </div>
                )}
              </div>

              {/* 모바일용 스탯 미리보기 */}
              <div className="flex sm:hidden justify-center gap-8 py-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(influencer.followers_count)}
                  </p>
                  <p className="text-xs text-gray-500">팔로워</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {influencer.engagement_rate}%
                  </p>
                  <p className="text-xs text-gray-500">참여율</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(influencer.average_likes || 0)}
                  </p>
                  <p className="text-xs text-gray-500">평균 좋아요</p>
                </div>
              </div>
            </div>
          </div>

          {/* 소개 */}
          <div className="mt-4">
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {influencer.bio}
            </p>
          </div>

          {/* 인스타그램 버튼 */}
          <div className="mt-6">
            <Button 
              variant="outline"
              className="w-full sm:w-auto flex items-center justify-center gap-2 border-2"
              onClick={() => window.open(instagramUrl, '_blank')}
            >
              <Instagram className="h-5 w-5" />
              Instagram 프로필 보기
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 상세 통계 카드 - 데스크톱용 (도달범위 제거) */}
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
                    {formatNumber(influencer.average_likes || 0)}
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

      {/* 상세 통계 - 모바일용 스크롤 가능한 카드 (도달범위 제거) */}
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
              {formatNumber(influencer.average_likes || 0)}
            </p>
            <p className="text-sm text-gray-600">평균 좋아요</p>
          </div>
        </div>
      </div>

      {/* 포트폴리오 갤러리 - 포트폴리오가 있을 때만 표시 */}
      {influencer.portfolio_urls && influencer.portfolio_urls.length > 0 && (
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Camera className="h-5 w-5" />
                포트폴리오
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {influencer.portfolio_urls.map((url, index) => (
                  <div 
                    key={index}
                    className="aspect-square rounded-lg sm:rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-md hover:shadow-xl"
                    onClick={() => setSelectedImage(url)}
                  >
                    <img 
                      src={url} 
                      alt={`포트폴리오 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 하단 여백 */}
      <div className="h-20"></div>

      {/* 이미지 모달 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="포트폴리오 확대"
            className="max-w-full max-h-full object-contain"
          />
          <button 
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  )
}