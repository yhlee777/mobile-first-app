'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MapPin, CheckCircle } from 'lucide-react'

interface Influencer {
  id: string
  instagram_handle: string
  name: string
  bio?: string
  category?: string
  location?: string
  followers_count: number
  engagement_rate: number
  profile_image?: string
  is_verified?: boolean
  hashtags?: string[]
}

interface InfluencerCardProps {
  influencer: Influencer
  viewType?: 'advertiser' | 'influencer' | 'public'
  onClick?: () => void
  onFavorite?: () => void
  isFavorited?: boolean
}

// 카테고리별 색상 정의
const getCategoryStyle = (category?: string) => {
  const styles: Record<string, string> = {
    '패션': 'bg-pink-100 text-pink-700 border-pink-200',
    '뷰티': 'bg-purple-100 text-purple-700 border-purple-200',
    '음식': 'bg-orange-100 text-orange-700 border-orange-200',
    '여행': 'bg-blue-100 text-blue-700 border-blue-200',
    '피트니스': 'bg-green-100 text-green-700 border-green-200',
    '테크': 'bg-gray-100 text-gray-700 border-gray-200',
    '라이프스타일': 'bg-amber-100 text-amber-700 border-amber-200',
    '육아': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    '기타': 'bg-slate-100 text-slate-700 border-slate-200'
  }
  return styles[category || '기타'] || styles['기타']
}

export function InfluencerCard({ 
  influencer, 
  viewType = 'public',
  onClick,
  onFavorite,
  isFavorited = false
}: InfluencerCardProps) {
  const router = useRouter()
  
  const formatFollowers = (count: number): string => {
    if (!count) return '0'
    if (count >= 10000000) return `${Math.floor(count / 10000)}만`
    if (count >= 10000) return `${(count / 10000).toFixed(0)}만`
    if (count >= 1000) return `${Math.floor(count / 1000)}천`
    return count.toString()
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      if (viewType === 'advertiser') {
        router.push(`/advertiser/influencers/${influencer.id}`)
      } else {
        router.push(`/influencer/${influencer.id}`)
      }
    }
  }

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
      onClick={handleClick}
    >
      {/* 이미지 영역 - 4:3 비율 */}
      <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
        <img
          src={influencer.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&background=51a66f&color=fff&size=400&rounded=false`}
          alt={influencer.name}
          className="w-full h-full object-cover"
        />
        
        {/* 하트 버튼 - 우측 상단 (onFavorite가 있을 때만 표시) */}
        {onFavorite && (
          <button 
            className="absolute top-3 right-3 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
            onClick={(e) => {
              e.stopPropagation()
              onFavorite()
            }}
            aria-label="찜하기"
          >
            <Heart 
              className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
        )}
        
        {/* 카테고리 배지 - 하단, 색상 적용 */}
        {influencer.category && (
          <div className="absolute bottom-3 left-3 right-3">
            <Badge 
              className={`${getCategoryStyle(influencer.category)} backdrop-blur-sm border`}
            >
              {influencer.category}
            </Badge>
          </div>
        )}
      </div>
      
      {/* 콘텐츠 영역 - 패딩 줄임 */}
      <CardContent className="p-3">
        {/* 프로필 정보 - 이름과 인증마크를 한 줄에 */}
        <div className="mb-2">
          <div className="flex items-center gap-1 mb-0.5">
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {influencer.name}
            </h3>
            {influencer.is_verified && (
              <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            @{influencer.instagram_handle}
          </p>
        </div>
        
        {/* 위치 정보 */}
        {influencer.location && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{influencer.location}</span>
          </div>
        )}
        
        {/* 통계 정보 - 한 줄에 컴팩트하게 */}
        <div className="py-2 border-t border-b text-xs">
          <span className="text-gray-600">팔로워 </span>
          <span className="font-semibold text-gray-900">
            {formatFollowers(influencer.followers_count)}
          </span>
          <span className="text-gray-600 ml-2">참여율 </span>
          <span className="font-semibold text-gray-900">
            {influencer.engagement_rate}%
          </span>
        </div>

        {/* 해시태그 - 맨 아래 한 줄로 표시 */}
        {influencer.hashtags && influencer.hashtags.length > 0 && (
          <div className="mt-2 overflow-hidden">
            <div className="flex gap-1 text-xs text-blue-600">
              {influencer.hashtags.slice(0, 2).map((tag, index) => (
                <span key={index} className="truncate">#{tag}</span>
              ))}
              {influencer.hashtags.length > 2 && (
                <span className="text-gray-400 flex-shrink-0">+{influencer.hashtags.length - 2}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}