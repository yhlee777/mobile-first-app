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
  Sparkles
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
}

const mockInfluencersData: Record<string, Influencer> = {
  '1': {
    id: '1',
    name: '방방뷔',
    instagram_handle: 'bangbangvui',
    bio: '일상 속 특별한 순간을 담는 인플루언서',
    category: '일상',
    location: '서울',
    followers_count: 20000,
    engagement_rate: 4.2,
    total_reach: 84000,
    average_likes: 840,
    profile_picture_url: '/api/placeholder/150/150',
    is_verified: true,
    media_urls: []
  },
  '2': {
    id: '2',
    name: '아이유 (IU)',
    instagram_handle: 'dlwlrma',
    bio: '가수 배우 IU 공식 인스타그램',
    category: '셀럽',
    location: '서울',
    followers_count: 32000000,
    engagement_rate: 8.5,
    total_reach: 272000000,
    average_likes: 2720000,
    profile_picture_url: '/api/placeholder/150/150',
    is_verified: false,
    media_urls: []
  },
  '3': {
    id: '3',
    name: '제시카 (Jessica)',
    instagram_handle: 'jessica.syj',
    bio: '패션 뷰티 크리에이터',
    category: '패션',
    location: '서울',
    followers_count: 11934011,
    engagement_rate: 5.2,
    total_reach: 62056857,
    average_likes: 620569,
    profile_picture_url: '/api/placeholder/150/150',
    is_verified: false,
    media_urls: []
  },
  '4': {
    id: '4',
    name: '포니 (PONY)',
    instagram_handle: 'ponysmakeup',
    bio: '메이크업 아티스트 포니',
    category: '뷰티',
    location: '서울',
    followers_count: 8746801,
    engagement_rate: 6.8,
    total_reach: 59478247,
    average_likes: 594782,
    profile_picture_url: '/api/placeholder/150/150',
    is_verified: false,
    media_urls: []
  }
}

export default function InfluencerDetailPage() {
  const params = useParams()
  const [isLiked, setIsLiked] = useState(false)
  const [influencer, setInfluencer] = useState<Influencer | null>(null)
  
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
        total_reach: 42000,
        average_likes: 420,
        profile_picture_url: '/api/placeholder/150/150',
        is_verified: false,
        media_urls: []
      })
    }
  }, [influencerId])

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      '패션': 'bg-purple-100 text-purple-700',
      '뷰티': 'bg-pink-100 text-pink-700',
      '여행': 'bg-blue-100 text-blue-700',
      '음식': 'bg-orange-100 text-orange-700',
      '피트니스': 'bg-green-100 text-green-700',
      '일상': 'bg-gray-100 text-gray-700',
      '라이프스타일': 'bg-yellow-100 text-yellow-700',
      '셀럽': 'bg-red-100 text-red-700'
    }
    return colorMap[category] || 'bg-gray-100 text-gray-700'
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/advertiser">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">인플루언서 프로필</h1>
          </div>
          <button 
            onClick={() => setIsLiked(!isLiked)} 
            type="button"
            className="p-2"
          >
            {isLiked ? (
              <Heart className="h-6 w-6 fill-red-500 text-red-500" />
            ) : (
              <Heart className="h-6 w-6 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <Card className="m-4">
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <Instagram className="h-10 w-10 text-green-600" />
                </div>
                {influencer.is_verified && (
                  <CheckCircle className="absolute -bottom-1 -right-1 h-6 w-6 text-blue-500 bg-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{influencer.name}</h2>
                <p className="text-green-600 font-medium">@{influencer.instagram_handle}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary" className={categoryColor}>
                    {influencer.category}
                  </Badge>
                  {influencer.location && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {influencer.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(influencer.followers_count)}
                </p>
                <p className="text-sm text-gray-500">팔로워</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {influencer.engagement_rate}%
                </p>
                <p className="text-sm text-gray-500">참여율</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">소개</h3>
              <p className="text-gray-600">{influencer.bio}</p>
            </div>

            <div>
              <button 
                type="button"
                onClick={() => window.open(instagramUrl, '_blank')}
                className="inline-flex items-center gap-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
              >
                <Instagram className="h-4 w-4" />
                Instagram 프로필 보기
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="m-4">
        <CardHeader>
          <CardTitle>성과 지표</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="h-4 w-4" />
                <span className="text-sm">예상 도달</span>
              </div>
              <p className="text-xl font-bold">{formatNumber(influencer.total_reach || 0)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Heart className="h-4 w-4" />
                <span className="text-sm">평균 좋아요</span>
              </div>
              <p className="text-xl font-bold">{formatNumber(influencer.average_likes || 0)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">평균 댓글</span>
              </div>
              <p className="text-xl font-bold">{formatNumber(Math.floor((influencer.average_likes || 0) * 0.05))}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">콘텐츠 품질</span>
              </div>
              <p className="text-xl font-bold">우수</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="m-4">
        <CardHeader>
          <CardTitle>포트폴리오</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="h-6 w-6 text-gray-400" />
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="h-6 w-6 text-gray-400" />
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="h-6 w-6 text-gray-400" />
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="h-6 w-6 text-gray-400" />
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="h-6 w-6 text-gray-400" />
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="container mx-auto">
          <Button 
            className="w-full" 
            size="lg"
            variant={isLiked ? "default" : "outline"}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={isLiked ? "h-5 w-5 mr-2 fill-current" : "h-5 w-5 mr-2"} />
            {isLiked ? '찜한 인플루언서' : '찜하기'}
          </Button>
        </div>
      </div>
    </div>
  )
}