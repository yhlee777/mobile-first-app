'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Instagram, 
  User, 
  Hash, 
  FileText, 
  Users, 
  ArrowRight, 
  Loader2, 
  CheckCircle,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react'

export default function InfluencerOnboarding() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fetchingInstagram, setFetchingInstagram] = useState(false)
  const [instagramData, setInstagramData] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    instagram_handle: '',
    category: '',
    bio: ''
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/influencer/login')
      return
    }

    const { data: existingInfluencer } = await supabase
      .from('influencers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingInfluencer) {
      router.push('/influencer/dashboard')
    }
  }

  const fetchInstagramData = async () => {
    if (!formData.instagram_handle) {
      setError('인스타그램 아이디를 입력해주세요')
      return
    }

    setFetchingInstagram(true)
    setError(null)
    
    try {
      const username = formData.instagram_handle.replace('@', '')
      const response = await fetch('/api/instagram/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setInstagramData(result.data)
        console.log('Instagram 데이터:', result.data)
      } else {
        if (result.is_token_error) {
          setError('Instagram API 토큰 문제가 있습니다. 관리자에게 문의해주세요.')
        } else if (result.is_user_error) {
          setError(result.error || '해당 Instagram 계정을 찾을 수 없습니다.')
        } else {
          setError(result.error || '인스타그램 정보를 가져올 수 없습니다.')
        }
      }
    } catch (error) {
      console.error('Instagram fetch error:', error)
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setFetchingInstagram(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 유효성 검사
    if (!instagramData) {
      setError('먼저 인스타그램 계정을 연동해주세요')
      return
    }
    
    if (!formData.name) {
      setError('이름을 입력해주세요')
      return
    }
    
    if (!formData.category) {
      setError('카테고리를 선택해주세요')
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다')
      }

      const influencerData = {
        user_id: user.id,
        name: formData.name,
        instagram_handle: formData.instagram_handle.replace('@', ''),
        category: formData.category,
        bio: formData.bio,
        is_active: true,
        instagram_id: instagramData.instagram_id,
        followers_count: instagramData.followers_count || 0,
        engagement_rate: instagramData.engagement_rate || 0,
        last_synced_at: instagramData.last_synced_at,
        profile_image: null,
        cover_image: null,
        portfolio_urls: []
      }

      const { error: influencerError } = await supabase
        .from('influencers')
        .insert(influencerData)

      if (influencerError) {
        console.error('Influencer creation error:', influencerError)
        throw influencerError
      }

      const { error: userError } = await supabase
        .from('users')
        .update({ 
          user_type: 'influencer'
        })
        .eq('id', user.id)

      if (userError) {
        console.error('User update error:', userError)
      }

      router.push('/influencer/dashboard')
    } catch (error: any) {
      console.error('Onboarding error:', error)
      setError(error.message || '프로필 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    setError(null)
    
    // 단계별 유효성 검사
    if (step === 1) {
      if (!formData.instagram_handle || !instagramData) {
        setError('인스타그램 계정을 연동해주세요')
        return
      }
    } else if (step === 2) {
      if (!formData.name) {
        setError('이름을 입력해주세요')
        return
      }
      if (!formData.category) {
        setError('카테고리를 선택해주세요')
        return
      }
    }
    
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setError(null)
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            인플루언서 프로필 만들기
          </CardTitle>
          <CardDescription>
            브랜드와 연결되기 위한 프로필을 완성해주세요
          </CardDescription>
          
          {/* 진행 상태 표시 */}
          <div className="flex items-center justify-center mt-6 space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex items-center ${i !== 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= i
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step > i ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    i
                  )}
                </div>
                {i !== 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      step > i ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className={step >= 1 ? 'text-green-600 font-semibold' : 'text-gray-400'}>
              Instagram 연동
            </span>
            <span className={step >= 2 ? 'text-green-600 font-semibold' : 'text-gray-400'}>
              기본 정보
            </span>
            <span className={step >= 3 ? 'text-green-600 font-semibold' : 'text-gray-400'}>
              확인
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full mb-4">
                  <Instagram className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Instagram 계정 연동</h3>
                <p className="text-sm text-gray-500 mt-1">
                  실제 팔로워 수와 참여율을 자동으로 불러옵니다
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram 아이디</Label>
                <div className="flex gap-2">
                  <Input
                    id="instagram"
                    placeholder="@username"
                    value={formData.instagram_handle}
                    onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                    disabled={fetchingInstagram}
                  />
                  <Button
                    onClick={fetchInstagramData}
                    disabled={fetchingInstagram || !formData.instagram_handle}
                    className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
                  >
                    {fetchingInstagram ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        연동 중
                      </>
                    ) : instagramData ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        다시 연동
                      </>
                    ) : (
                      <>
                        <Instagram className="h-4 w-4 mr-2" />
                        연동하기
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {instagramData && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          연동 성공!
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          @{instagramData.instagram_username}
                        </p>
                      </div>
                      <Badge className={`${instagramData.is_mock ? "bg-yellow-600" : "bg-green-600"} text-white`}>
                        {instagramData.is_mock ? "테스트 데이터" : "실제 데이터"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {instagramData.followers_count?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                          <Users className="h-3 w-3" />
                          팔로워
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {instagramData.media_count}
                        </p>
                        <p className="text-xs text-gray-500">게시물</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {instagramData.engagement_rate}%
                        </p>
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          참여율
                        </p>
                      </div>
                    </div>

                    {/* 실제 API 연동 상태 표시 */}
                    <div className={`mt-4 p-2 rounded text-xs ${
                      instagramData.is_mock 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {instagramData.is_mock ? (
                        <>
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          테스트 데이터입니다. 실제 API 연동시 실제 데이터가 표시됩니다.
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                          Instagram Graph API를 통해 실시간 데이터를 가져왔습니다.
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">기본 정보 입력</h3>
                <p className="text-sm text-gray-500 mt-1">
                  브랜드에게 보여질 프로필 정보를 입력해주세요
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">카테고리 *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fashion">패션</SelectItem>
                      <SelectItem value="beauty">뷰티</SelectItem>
                      <SelectItem value="food">푸드</SelectItem>
                      <SelectItem value="travel">여행</SelectItem>
                      <SelectItem value="lifestyle">라이프스타일</SelectItem>
                      <SelectItem value="fitness">피트니스</SelectItem>
                      <SelectItem value="tech">테크</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">소개 (선택)</Label>
                  <Textarea
                    id="bio"
                    placeholder="브랜드에게 어필할 수 있는 소개를 작성해주세요"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">프로필 확인</h3>
                <p className="text-sm text-gray-500 mt-1">
                  입력한 정보를 확인하고 프로필을 생성해주세요
                </p>
              </div>

              <Card className="bg-gray-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-sm font-medium text-gray-600">Instagram</span>
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-500" />
                      <span className="font-medium">@{formData.instagram_handle}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-sm font-medium text-gray-600">이름</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-sm font-medium text-gray-600">카테고리</span>
                    <Badge variant="secondary">{formData.category}</Badge>
                  </div>
                  
                  {formData.bio && (
                    <div className="py-3">
                      <span className="text-sm font-medium text-gray-600">소개</span>
                      <p className="mt-2 text-sm text-gray-700">{formData.bio}</p>
                    </div>
                  )}
                  
                  {instagramData && (
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">{instagramData.followers_count?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">팔로워</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{instagramData.media_count}</p>
                        <p className="text-xs text-gray-500">게시물</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{instagramData.engagement_rate}%</p>
                        <p className="text-xs text-gray-500">참여율</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={loading}
              >
                이전
              </Button>
            )}
            
            <div className={`flex gap-2 ${step === 1 ? 'ml-auto' : ''}`}>
              {step < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={
                    (step === 1 && (!instagramData || !formData.instagram_handle)) ||
                    loading
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  다음
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !instagramData || !formData.name || !formData.category}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      프로필 생성
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}