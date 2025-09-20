'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { 
  Instagram, 
  Users, 
  Heart, 
  Edit, 
  LogOut,
  MapPin,
  Loader2,
  CheckCircle,
  ExternalLink
} from 'lucide-react'

interface InfluencerProfile {
  id: string
  user_id: string
  instagram_handle: string
  name: string
  bio?: string
  category?: string
  location?: string
  followers_count: number
  engagement_rate: number
  profile_image?: string
  is_verified?: boolean
}

export default function InfluencerProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<InfluencerProfile | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle() // single() 대신 maybeSingle() 사용

      if (error) {
        console.error('Error loading profile:', error)
        // 프로필이 없으면 생성 페이지로 이동하거나 기본값 설정
        if (error.code === 'PGRST116') {
          router.push('/influencer/profile/create')
        }
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20">
        <Loader2 className="h-8 w-8 animate-spin text-[#51a66f]" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20">
        <div className="text-center">
          <p className="text-gray-500 mb-4">프로필을 찾을 수 없습니다</p>
          <Button onClick={() => router.push('/influencer/profile/edit')}>
            프로필 만들기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20 pb-20">
      {/* 헤더 */}
      <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">내 프로필</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/influencer/profile/edit')}
              >
                <Edit className="h-4 w-4 mr-1" />
                편집
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* 프로필 정보 */}
        <Card className="mb-4 bg-white/90 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {profile.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#51a66f]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <Instagram className="h-10 w-10 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{profile.name}</h2>
                  {profile.is_verified && (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Instagram className="h-3 w-3" />
                  @{profile.instagram_handle}
                </p>
                {profile.location && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {profile.location}
                  </p>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="mt-4 text-sm text-gray-700">{profile.bio}</p>
            )}

            {/* 카테고리 */}
            {profile.category && (
              <div className="mt-4">
                <Badge className="bg-[#51a66f]/10 text-[#51a66f] border-[#51a66f]/20">
                  {profile.category}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 통계 */}
        <Card className="mt-4 bg-white/90 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">활동 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">팔로워</span>
                </div>
                <p className="text-2xl font-bold text-[#51a66f]">
                  {profile.followers_count.toLocaleString()}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">참여율</span>
                </div>
                <p className="text-2xl font-bold text-[#51a66f]">
                  {profile.engagement_rate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instagram 연동 버튼 - 디자인 개선 */}
        <button
          className="w-full mt-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => window.open(`https://instagram.com/${profile.instagram_handle}`, '_blank')}
        >
          <Instagram className="h-5 w-5" />
          <span>Instagram 프로필 보기</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      </main>
    </div>
  )
}