'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Influencer {
  id: string
  instagram_handle: string
  name: string
  bio?: string
  category: string
  followers_count: number
  engagement_rate: number
  profile_image?: string
  location?: string
  is_verified?: boolean
  is_active?: boolean
  hashtags?: string[]
}

const categoryColors: Record<string, string> = {
  '패션': 'bg-pink-100 text-pink-700 border-pink-200',
  '뷰티': 'bg-purple-100 text-purple-700 border-purple-200',
  '음식': 'bg-orange-100 text-orange-700 border-orange-200',
  '여행': 'bg-blue-100 text-blue-700 border-blue-200',
  '피트니스': 'bg-green-100 text-green-700 border-green-200',
  '테크': 'bg-slate-100 text-slate-700 border-slate-200',
  '라이프스타일': 'bg-amber-100 text-amber-700 border-amber-200',
  '육아': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  '기타': 'bg-gray-100 text-gray-700 border-gray-200'
}

interface InfluencerCardProps {
  influencer: Influencer
  viewType?: 'advertiser' | 'influencer' | 'public'
  onClick?: () => void
  onFavorite?: () => void  // 추가
  isFavorited?: boolean     // 추가
}

export function InfluencerCard({ 
  influencer, 
  viewType = 'public',
  onClick,
  onFavorite,              // 추가
  isFavorited = false      // 추가
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
        router.push(`/advertiser/influencer/${influencer.id}`)
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
              className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </button>
        )}

        {/* 카테고리 배지 - 좌측 하단 */}
        <Badge 
          className={`absolute bottom-3 left-3 z-10 text-xs px-2 py-1 ${categoryColors[influencer.category] || categoryColors['기타']}`}
        >
          {influencer.category || '미정'}
        </Badge>
      </div>
      
      {/* 정보 영역 */}
     {/* 정보 영역 */}
      <CardContent className="p-3 space-y-2">
        {/* 제목 및 인증 마크 - 한 줄에 표시 */}
        <div>
          <div className="flex items-center gap-0.5">
            <h3 className="font-semibold text-base truncate">
              {influencer.name || influencer.instagram_handle}
            </h3>
            {influencer.is_verified && (
              <CheckCircle className="h-3.5 w-3.5 text-[#51a66f] flex-shrink-0 ml-0.5" />
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {influencer.location || '서울'}
          </p>
        </div>
        
        {/* 통계 정보 */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-600 flex-shrink-0">
            팔로워 <span className="font-semibold text-gray-900">{formatFollowers(influencer.followers_count)}</span>
          </span>
          <span className="text-gray-600 flex-shrink-0">
            참여율 <span className="font-semibold text-gray-900">{influencer.engagement_rate}%</span>
          </span>
        </div>

        {/* 해시태그 - 한 줄로 제한 */}
        {influencer.hashtags && influencer.hashtags.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1 overflow-hidden text-[11px]">
            {influencer.hashtags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="text-blue-600 flex-shrink-0 truncate max-w-[70px]"
              >
                #{tag}
              </span>
            ))}
            {influencer.hashtags.length > 2 && (
              <span className="text-blue-400 flex-shrink-0">
                +{influencer.hashtags.length - 2}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}