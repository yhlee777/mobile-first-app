'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, MapPin, Users, TrendingUp } from 'lucide-react'
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
}

export function InfluencerCard({ 
  influencer, 
  viewType = 'public',
  onClick 
}: InfluencerCardProps) {
  const router = useRouter()
  
  const formatFollowers = (count: number): string => {
    if (!count) return '0'
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 10000) return `${Math.floor(count / 1000)}K`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
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
      {/* 이미지 영역 - 정사각형 또는 4:3 비율 선택 가능 */}
      <div className="aspect-square relative bg-gray-100"> {/* aspect-[4/3] 도 가능 */}
        <img
          src={influencer.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&background=51a66f&color=fff&size=200&rounded=true`}
          alt={influencer.name}
          className="w-full h-full object-cover"
        />
        
        {/* 카테고리 뱃지 - 좌측 하단 */}
        <Badge 
          className={`absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 ${categoryColors[influencer.category] || categoryColors['기타']}`}
        >
          {influencer.category || '미정'}
        </Badge>
        
        {/* 인증 마크 - 이름 옆으로 이동 (공간 절약) */}
      </div>
      
      {/* 정보 영역 - 매우 컴팩트 */}
      <CardContent className="p-2.5">
        {/* 이름과 인증마크 */}
        <div className="flex items-center gap-1 mb-1">
          <h3 className="font-semibold text-sm truncate flex-1">
            {influencer.name || '이름 미설정'}
          </h3>
          {influencer.is_verified && (
            <CheckCircle className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
          )}
        </div>
        
        {/* 핸들과 위치를 한 줄로 */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
          <span className="truncate">@{influencer.instagram_handle}</span>
          {influencer.location && (
            <span className="flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5" />
              {influencer.location}
            </span>
          )}
        </div>
        
        {/* 통계 - 매우 간단하게 */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-0.5">
            <Users className="h-3 w-3 text-gray-400" />
            <strong>{formatFollowers(influencer.followers_count)}</strong>
          </span>
          <span className="flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3 text-gray-400" />
            <strong>{influencer.engagement_rate || 0}%</strong>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}