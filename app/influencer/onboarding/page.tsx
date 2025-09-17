'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Instagram, AlertCircle, Loader2, User, Sparkles } from 'lucide-react'

export default function InfluencerOnboarding() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  
  const [instagramHandle, setInstagramHandle] = useState('')
  const [category, setCategory] = useState('')
  const [bio, setBio] = useState('')
  const [followersCount, setFollowersCount] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/influencer/login')
      return
    }
    
    // 이미 프로필이 있는지 확인
    const { data } = await supabase
      .from('influencers')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (data) {
      // 이미 프로필이 있으면 대시보드로
      router.push('/influencer/dashboard')
      return
    }
    
    setUserId(user.id)
    setUserName(user.user_metadata?.name || '')
  }

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!instagramHandle) {
      setError('인스타그램 계정을 입력해주세요.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // influencers 테이블에 프로필 생성
      const { data: influencerData, error: influencerError } = await supabase
        .from('influencers')
        .insert([
          {
            user_id: userId,
            name: userName || 'Unknown',
            instagram_handle: instagramHandle.replace('@', ''),
            category: category || 'other',
            bio: bio || '',
            followers_count: parseInt(followersCount) || 0,
            engagement_rate: 0,
            total_reach: parseInt(followersCount) || 0,
            is_active: true
          }
        ])
        .select()
        .single()
      
      if (influencerError) {
        console.error('Influencer profile error:', influencerError)
        throw new Error('프로필 생성에 실패했습니다.')
      }
      
      console.log('Profile created:', influencerData)
      
      // 성공 시 대시보드로 이동
      router.push('/influencer/dashboard')
      
    } catch (error: any) {
      console.error('Onboarding error:', error)
      setError(error.message || '프로필 설정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    // 나중에 설정하기
    router.push('/influencer/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">프로필 완성하기</CardTitle>
          <CardDescription className="text-center">
            인플루언서 프로필을 완성하여 브랜드와 연결하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleComplete} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">
                인스타그램 계정 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="instagram"
                  type="text"
                  placeholder="@username"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fashion">패션</SelectItem>
                  <SelectItem value="beauty">뷰티</SelectItem>
                  <SelectItem value="food">푸드</SelectItem>
                  <SelectItem value="travel">여행</SelectItem>
                  <SelectItem value="lifestyle">라이프스타일</SelectItem>
                  <SelectItem value="fitness">피트니스</SelectItem>
                  <SelectItem value="tech">테크</SelectItem>
                  <SelectItem value="parenting">육아</SelectItem>
                  <SelectItem value="pet">반려동물</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="followers">팔로워 수</Label>
              <Input
                id="followers"
                type="number"
                placeholder="10000"
                value={followersCount}
                onChange={(e) => setFollowersCount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">소개</Label>
              <Textarea
                id="bio"
                placeholder="브랜드에게 어필할 수 있는 소개를 작성해주세요"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleSkip}
              >
                나중에 하기
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  '프로필 완성하기'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}