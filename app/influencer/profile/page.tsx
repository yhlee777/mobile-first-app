// app/influencer/profile/page.tsx

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
  CheckCircle
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<InfluencerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

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
        .single()

      if (error) {
        console.error('Error loading profile:', error)
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#51a66f]" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>프로필을 찾을 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">내 프로필</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/influencer/profile/edit')}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 프로필 내용 */}
      <main className="px-4 py-6">
        {/* 프로필 이미지 & 기본 정보 */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
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
                <p className="text-2xl font-bold mt-1">
                  {profile.followers_count?.toLocaleString() || '0'}
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">참여율</span>
                </div>
                <p className="text-2xl font-bold mt-1">
                  {profile.engagement_rate || '0'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 빠른 메뉴 */}
        <div className="mt-4 space-y-3">
          <Button
            className="w-full bg-[#51a66f] hover:bg-[#449960]"
            onClick={() => router.push('/influencer/campaigns')}
          >
            캠페인 찾아보기
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/influencer/profile/edit')}
          >
            프로필 편집하기
          </Button>
        </div>
      </main>
    </div>
  )
}