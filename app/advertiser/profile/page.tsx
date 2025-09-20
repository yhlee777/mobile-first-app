'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  Camera,
  LogOut,
  Edit,
  Save,
  X,
  Loader2,
  Megaphone
} from 'lucide-react'

interface BrandProfile {
  id: string
  name: string
  logo_url?: string
  description?: string
  website?: string
  contact_email?: string
  contact_phone?: string
  location?: string
  business_type?: string
}

export default function AdvertiserProfilePage() {
  const [profile, setProfile] = useState<BrandProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<BrandProfile | null>(null)
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
        .from('brands')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      setProfile(data)
      setEditedProfile(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editedProfile) return

    try {
      const { error } = await supabase
        .from('brands')
        .update({
          name: editedProfile.name,
          description: editedProfile.description,
          website: editedProfile.website,
          contact_email: editedProfile.contact_email,
          contact_phone: editedProfile.contact_phone,
          location: editedProfile.location,
          business_type: editedProfile.business_type
        })
        .eq('id', editedProfile.id)

      if (error) throw error

      setProfile(editedProfile)
      setEditing(false)
      alert('프로필이 업데이트되었습니다')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('프로필 업데이트 중 오류가 발생했습니다')
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

  if (!profile || !editedProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20">
        <p>프로필을 찾을 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">내 프로필</h1>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(false)
                      setEditedProfile(profile)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-[#51a66f] hover:bg-[#449960]"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    저장
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
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
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 프로필 내용 */}
      <main className="px-4 py-6">
        {/* 프로필 카드 */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            {/* 프로필 이미지 & 기본 정보 */}
            <div className="flex items-center gap-4 mb-6">
              {profile.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#51a66f]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <Building className="h-10 w-10 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                {editing ? (
                  <Input
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                    className="text-xl font-bold mb-2"
                    placeholder="회사/브랜드명"
                  />
                ) : (
                  <h2 className="text-xl font-bold mb-1">{profile.name}</h2>
                )}
                {profile.business_type && (
                  <span className="text-sm text-gray-600">{profile.business_type}</span>
                )}
              </div>
            </div>

            {/* 내 캠페인 관리 버튼 */}
            <Button 
              className="w-full bg-[#51a66f] hover:bg-[#449960] mb-6"
              onClick={() => router.push('/advertiser/campaigns')}
            >
              <Megaphone className="h-4 w-4 mr-2" />
              내 캠페인 관리
            </Button>

            {/* 소개 */}
            <div className="mb-6">
              <Label>소개</Label>
              {editing ? (
                <Textarea
                  value={editedProfile.description || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, description: e.target.value})}
                  className="mt-1"
                  rows={3}
                  placeholder="브랜드 소개를 입력하세요"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-700">
                  {profile.description || '소개글이 없습니다'}
                </p>
              )}
            </div>

            {/* 상세 정보 */}
            <div className="space-y-4">
              <div>
                <Label>위치</Label>
                {editing ? (
                  <Input
                    value={editedProfile.location || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                    className="mt-1"
                    placeholder="서울특별시"
                  />
                ) : (
                  <div className="mt-1 flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    {profile.location || '미설정'}
                  </div>
                )}
              </div>

              <div>
                <Label>웹사이트</Label>
                {editing ? (
                  <Input
                    value={editedProfile.website || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, website: e.target.value})}
                    className="mt-1"
                    placeholder="https://"
                  />
                ) : (
                  <div className="mt-1 flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-1 text-gray-400" />
                    {profile.website ? (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[#51a66f] hover:underline">
                        {profile.website}
                      </a>
                    ) : (
                      '미설정'
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label>이메일</Label>
                {editing ? (
                  <Input
                    value={editedProfile.contact_email || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, contact_email: e.target.value})}
                    className="mt-1"
                    type="email"
                  />
                ) : (
                  <div className="mt-1 flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    {profile.contact_email || '미설정'}
                  </div>
                )}
              </div>

              <div>
                <Label>연락처</Label>
                {editing ? (
                  <Input
                    value={editedProfile.contact_phone || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, contact_phone: e.target.value})}
                    className="mt-1"
                    type="tel"
                  />
                ) : (
                  <div className="mt-1 flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-1 text-gray-400" />
                    {profile.contact_phone || '미설정'}
                  </div>
                )}
              </div>

              <div>
                <Label>업종</Label>
                {editing ? (
                  <Input
                    value={editedProfile.business_type || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, business_type: e.target.value})}
                    className="mt-1"
                    placeholder="예: F&B, 패션, 뷰티"
                  />
                ) : (
                  <div className="mt-1 text-sm">
                    {profile.business_type || '미설정'}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}