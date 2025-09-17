'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { formatNumber } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Profile {
  id: string
  instagram_handle: string
  full_name: string
  bio: string
  category: string
  location: string
  followers_count: number
  engagement_rate: number
  profile_picture_url: string
  is_public: boolean
}

const categories = ['패션', '뷰티', '음식', '여행', '피트니스', '테크', '라이프스타일', '게임']
const locations = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '경기', '강원', '충청', '전라', '경상', '제주']

export default function InfluencerPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    category: '',
    location: '',
    instagram_handle: '',
    is_public: true
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    const supabase = createClient() as any
    const response = await supabase.auth.getUser()
    const user = response.data.user
    
    if (user) {
      setUserId(user.id)
      
      const result = await supabase
        .from('influencers')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (result.data) {
        setProfile(result.data)
        setFormData({
          full_name: result.data.full_name || '',
          bio: result.data.bio || '',
          category: result.data.category || '',
          location: result.data.location || '',
          instagram_handle: result.data.instagram_handle || '',
          is_public: result.data.is_public
        })
      }
    }
    setLoading(false)
  }

  const handleSaveProfile = async () => {
    const supabase = createClient() as any
    
    await supabase
      .from('influencers')
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    
    await fetchUserProfile()
    setEditing(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  const renderEditForm = () => (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">이름</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="instagram_handle">인스타그램 계정</Label>
          <Input
            id="instagram_handle"
            placeholder="username"
            value={formData.instagram_handle}
            onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">소개</Label>
        <textarea
          id="bio"
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          rows={3}
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
        />
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">카테고리</Label>
          <Select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="">선택하세요</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">지역</Label>
          <Select
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          >
            <option value="">선택하세요</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </Select>
        </div>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <Label htmlFor="is_public">프로필 공개</Label>
        <input
          type="checkbox"
          id="is_public"
          checked={formData.is_public}
          onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
          className="w-4 h-4"
        />
      </div>
    </div>
  )

  const renderProfile = () => (
    <div className="space-y-4">
      <div className="flex items-start space-x-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-xl">
            {profile?.full_name || '이름을 입력하세요'}
          </h3>
          
          {profile?.instagram_handle && (
            <p className="text-green-600 mt-1">
              @{profile.instagram_handle}
            </p>
          )}
          
          {profile?.bio && (
            <p className="text-gray-600 mt-2">{profile.bio}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
            {profile?.category && (
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {profile.category}
              </span>
            )}
            {profile?.location && (
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {profile.location}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {(profile?.followers_count || profile?.engagement_rate) && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {profile.followers_count ? formatNumber(profile.followers_count) : '-'}
            </p>
            <p className="text-sm text-gray-500">팔로워</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {profile.engagement_rate ? profile.engagement_rate.toFixed(1) + '%' : '-'}
            </p>
            <p className="text-sm text-gray-500">인게이지먼트</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-green-600">
              itda
            </Link>
            <span className="text-gray-500">|</span>
            <span className="text-sm font-medium">인플루언서 대시보드</span>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>내 프로필</CardTitle>
              <Button
                variant={editing ? "default" : "outline"}
                size="sm"
                onClick={() => editing ? handleSaveProfile() : setEditing(true)}
              >
                {editing ? '저장' : '편집'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editing ? renderEditForm() : renderProfile()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">프로필 완성도</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>기본 정보</span>
                <span className="text-green-600 font-medium">
                  {profile?.full_name && profile?.instagram_handle ? '완료' : '미완료'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>카테고리 설정</span>
                <span className={profile?.category ? 'text-green-600 font-medium' : 'text-gray-400'}>
                  {profile?.category ? '완료' : '미완료'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>지역 설정</span>
                <span className={profile?.location ? 'text-green-600 font-medium' : 'text-gray-400'}>
                  {profile?.location ? '완료' : '미완료'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>소개 작성</span>
                <span className={profile?.bio ? 'text-green-600 font-medium' : 'text-gray-400'}>
                  {profile?.bio ? '완료' : '미완료'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
