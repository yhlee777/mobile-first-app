'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Instagram, 
  Building, 
  Loader2,
  CheckCircle,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  X
} from 'lucide-react'

// 비밀번호 강도 체크 함수
function checkPasswordStrength(password: string): {
  score: number
  message: string
  color: string
} {
  let score = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password)
  }
  
  if (checks.length) score += 2
  if (checks.uppercase) score++
  if (checks.lowercase) score++
  if (checks.number) score++
  if (checks.special) score++
  
  if (score <= 2) return { score, message: '약함', color: 'bg-red-500' }
  if (score <= 4) return { score, message: '보통', color: 'bg-yellow-500' }
  if (score <= 5) return { score, message: '강함', color: 'bg-green-500' }
  return { score, message: '매우 강함', color: 'bg-green-600' }
}

// Instagram 아이디 유효성 검사
function validateInstagramHandle(handle: string): boolean {
  const regex = /^[a-zA-Z0-9_.]+$/
  return regex.test(handle) && handle.length >= 3 && handle.length <= 30
}

// 이메일 유효성 검사
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// SignupForm 컴포넌트 (searchParams 사용)
function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'influencer' | 'advertiser'>('influencer')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // 인플루언서 폼
  const [instagramHandle, setInstagramHandle] = useState('')
  const [influencerPassword, setInfluencerPassword] = useState('')
  const [influencerPasswordConfirm, setInfluencerPasswordConfirm] = useState('')
  const [showInfluencerPassword, setShowInfluencerPassword] = useState(false)
  const [showInfluencerPasswordConfirm, setShowInfluencerPasswordConfirm] = useState(false)
  
  // 광고주 폼
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [advertiserPassword, setAdvertiserPassword] = useState('')
  const [advertiserPasswordConfirm, setAdvertiserPasswordConfirm] = useState('')
  const [showAdvertiserPassword, setShowAdvertiserPassword] = useState(false)
  const [showAdvertiserPasswordConfirm, setShowAdvertiserPasswordConfirm] = useState(false)
  
  // 약관 동의
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  
  // 실시간 유효성 검사
  const [instagramValid, setInstagramValid] = useState<boolean | null>(null)
  const [emailValid, setEmailValid] = useState<boolean | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof checkPasswordStrength> | null>(null)

  // URL 파라미터로 탭 자동 설정
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'advertiser') {
      setActiveTab('advertiser')
    } else if (tab === 'influencer') {
      setActiveTab('influencer')
    }
  }, [searchParams])

  // Instagram 핸들 유효성 검사
  useEffect(() => {
    if (instagramHandle.length > 0) {
      setInstagramValid(validateInstagramHandle(instagramHandle))
    } else {
      setInstagramValid(null)
    }
  }, [instagramHandle])

  // 이메일 유효성 검사
  useEffect(() => {
    if (email.length > 0) {
      setEmailValid(validateEmail(email))
    } else {
      setEmailValid(null)
    }
  }, [email])

  // 비밀번호 강도 체크
  useEffect(() => {
    const password = activeTab === 'influencer' ? influencerPassword : advertiserPassword
    if (password.length > 0) {
      setPasswordStrength(checkPasswordStrength(password))
    } else {
      setPasswordStrength(null)
    }
  }, [influencerPassword, advertiserPassword, activeTab])

  // Instagram 데이터 동기화 함수
  const syncInstagramData = async (handle: string, influencerId: string) => {
    setSyncing(true)
    try {
      const response = await fetch('/api/ig/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          handle: handle,
          influencerId: influencerId
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Instagram data synced:', data.metrics)
        return data.metrics
      }
    } catch (error) {
      console.error('Instagram sync error:', error)
    } finally {
      setSyncing(false)
    }
    return null
  }

  // Instagram 데이터로 인플루언서 정보 업데이트
  const updateInfluencerWithInstagramData = async (influencerId: string, metrics: any): Promise<void> => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('influencers')
        .update({
          name: metrics.name || instagramHandle,
          followers_count: metrics.followers_count || 0,
          engagement_rate: metrics.engagement_rate || 0,
          is_verified: metrics.is_verified || false,
          bio: metrics.bio || '',
          profile_image: metrics.profile_picture_url || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', influencerId)
      
      if (error) {
        console.error('Failed to update influencer data:', error)
      } else {
        console.log('Instagram data updated successfully')
      }
    } catch (err) {
      console.error('Error updating influencer:', err)
    }
  };

  const handleInfluencerSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 유효성 검사
    if (!instagramHandle || !validateInstagramHandle(instagramHandle)) {
      setError('올바른 인스타그램 아이디를 입력해주세요 (영문, 숫자, _, . 만 가능)')
      return
    }
    
    if (influencerPassword !== influencerPasswordConfirm) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }
    
    if (influencerPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다')
      return
    }
    
    if (!termsAgreed || !privacyAgreed) {
      setError('필수 약관에 동의해주세요')
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const supabase = createClient()
      
      const cleanHandle = instagramHandle.replace('@', '').toLowerCase().trim()
      const tempEmail = `${cleanHandle}@instagram.temp`
      
      // 1. 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: influencerPassword,
        options: {
          data: {
            instagram_handle: cleanHandle,
            user_type: 'influencer'
          }
        }
      })
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('이미 등록된 인스타그램 아이디입니다')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }
      
      if (!authData.user) {
        throw new Error('회원가입에 실패했습니다')
      }

      // 2. users 테이블에 추가
      const { error: userError } = await supabase.from('users').insert([
        {
          user_id: authData.user.id,
          user_type: 'influencer',
          name: cleanHandle
        }
      ])
      
      if (userError) {
        console.error('User insert error:', userError)
      }
      
      // 3. influencers 테이블에 기본 정보 추가
      const { data: influencerData, error: influencerError } = await supabase
        .from('influencers')
        .insert([
          {
            user_id: authData.user.id,
            instagram_handle: cleanHandle,
            name: cleanHandle,
            bio: '',
            category: '',
            is_active: true,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()
      
      if (influencerError) {
        console.error('Influencer insert error:', influencerError)
        throw influencerError
      }
      
      // 4. 로그인
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: influencerPassword
      })
      
      if (signInError) {
        console.error('Sign in error:', signInError)
      }
      
      // 5. 성공 메시지
      setSuccessMessage('회원가입이 완료되었습니다! Instagram 데이터를 동기화하는 중...')
      
      // 6. Instagram 데이터 동기화 (백그라운드에서 실행)
      if (influencerData && influencerData.id) {
        console.log('Starting Instagram sync for:', cleanHandle);
        
        // 비동기로 실행하되 완료를 기다리지 않음
        void (async () => {
          const metrics = await syncInstagramData(cleanHandle, influencerData.id)
          if (metrics) {
            await updateInfluencerWithInstagramData(influencerData.id, metrics)
          }
        })()
      }
      
      // 7. 2초 후 대시보드로 이동
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
    } catch (error: any) {
      setError(error.message || '회원가입 중 오류가 발생했습니다')
      setLoading(false)
    }
  }

  const handleAdvertiserSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 유효성 검사
    if (!email || !validateEmail(email)) {
      setError('올바른 이메일 주소를 입력해주세요')
      return
    }
    
    if (!companyName || companyName.length < 2) {
      setError('회사명을 2자 이상 입력해주세요')
      return
    }
    
    if (advertiserPassword !== advertiserPasswordConfirm) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }
    
    if (advertiserPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다')
      return
    }
    
    if (!termsAgreed || !privacyAgreed) {
      setError('필수 약관에 동의해주세요')
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const supabase = createClient()
      
      // 1. 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: advertiserPassword,
        options: {
          data: {
            company_name: companyName,
            user_type: 'advertiser'
          }
        }
      })
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('이미 등록된 이메일입니다')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }
      
      if (!authData.user) {
        throw new Error('회원가입에 실패했습니다')
      }

      // 2. users 테이블에 추가
      const { error: userError } = await supabase.from('users').insert([
        {
          user_id: authData.user.id,
          user_type: 'advertiser',
          name: companyName
        }
      ])
      
      if (userError) {
        console.error('User insert error:', userError)
      }
      
      // 3. brands 테이블에 추가
      const { error: brandError } = await supabase.from('brands').insert([
        {
          user_id: authData.user.id,
          name: companyName,
          created_at: new Date().toISOString()
        }
      ])
      
      if (brandError) {
        console.error('Brand insert error:', brandError)
      }
      
      // 4. 로그인
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: email,
        password: advertiserPassword
      })
      
      // 5. 성공 메시지
      setSuccessMessage('회원가입이 완료되었습니다! 잠시 후 대시보드로 이동합니다...')
      
      // 6. 2초 후 대시보드로 이동
      setTimeout(() => {
        if (signInData?.user) {
          router.push('/advertiser')
        } else {
          router.push('/login')
        }
      }, 2000)
      
    } catch (error: any) {
      setError(error.message || '회원가입 중 오류가 발생했습니다')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
            처음으로
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
            <CardDescription>
              인플루언서와 광고주를 연결하는 플랫폼
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => {
              setActiveTab(v as 'influencer' | 'advertiser')
              setError(null)
              setSuccessMessage(null)
            }}>
              <TabsList className="grid w-full grid-cols-2 mb-6 h-auto p-1 bg-gray-100">
                <TabsTrigger value="influencer" className="flex items-center justify-center gap-1 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Instagram className="h-4 w-4" />
                  <span className="text-sm">인플루언서</span>
                </TabsTrigger>
                <TabsTrigger value="advertiser" className="flex items-center justify-center gap-1 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Building className="h-4 w-4" />
                  <span className="text-sm">광고주</span>
                </TabsTrigger>
              </TabsList>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {successMessage}
                </div>
              )}

              <TabsContent value="influencer">
                <form onSubmit={handleInfluencerSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram-handle">인스타그램 아이디</Label>
                    <div className="relative">
                      <Input 
                        id="instagram-handle"
                        type="text" 
                        placeholder="@없이 입력 (예: myinstagram)"
                        value={instagramHandle}
                        onChange={(e) => setInstagramHandle(e.target.value.replace('@', '').toLowerCase())}
                        className={`pr-10 ${
                          instagramValid === true ? 'border-green-500' : 
                          instagramValid === false ? 'border-red-500' : ''
                        }`}
                        disabled={loading}
                        required
                      />
                      {instagramValid !== null && (
                        <div className="absolute right-3 top-3">
                          {instagramValid ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {instagramValid === false && (
                      <p className="text-xs text-red-500">
                        3-30자의 영문, 숫자, _, . 만 사용 가능합니다
                      </p>
                    )}
                    {instagramValid === true && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Instagram 프로필이 자동으로 동기화됩니다
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="influencer-password">비밀번호</Label>
                    <div className="relative">
                      <Input 
                        id="influencer-password"
                        type={showInfluencerPassword ? "text" : "password"}
                        placeholder="6자 이상 입력"
                        value={influencerPassword}
                        onChange={(e) => setInfluencerPassword(e.target.value)}
                        className="pr-10"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowInfluencerPassword(!showInfluencerPassword)}
                        className="absolute right-3 top-3"
                      >
                        {showInfluencerPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordStrength && activeTab === 'influencer' && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full ${
                                i <= passwordStrength.score
                                  ? passwordStrength.color
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600">
                          비밀번호 강도: {passwordStrength.message}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="influencer-password-confirm">비밀번호 확인</Label>
                    <div className="relative">
                      <Input 
                        id="influencer-password-confirm"
                        type={showInfluencerPasswordConfirm ? "text" : "password"}
                        placeholder="비밀번호 재입력"
                        value={influencerPasswordConfirm}
                        onChange={(e) => setInfluencerPasswordConfirm(e.target.value)}
                        className={`pr-10 ${
                          influencerPasswordConfirm && 
                          (influencerPassword === influencerPasswordConfirm ? 'border-green-500' : 'border-red-500')
                        }`}
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowInfluencerPasswordConfirm(!showInfluencerPasswordConfirm)}
                        className="absolute right-3 top-3"
                      >
                        {showInfluencerPasswordConfirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {influencerPasswordConfirm && (
                      <p className={`text-xs ${
                        influencerPassword === influencerPasswordConfirm 
                          ? 'text-green-600' 
                          : 'text-red-500'
                      }`}>
                        {influencerPassword === influencerPasswordConfirm 
                          ? '✓ 비밀번호가 일치합니다' 
                          : '비밀번호가 일치하지 않습니다'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="mt-1"
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-600">
                        <Link href="/terms" className="text-green-600 hover:underline">이용약관</Link>에 동의합니다 (필수)
                      </span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={privacyAgreed}
                        onChange={(e) => setPrivacyAgreed(e.target.checked)}
                        className="mt-1"
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-600">
                        <Link href="/privacy" className="text-green-600 hover:underline">개인정보처리방침</Link>에 동의합니다 (필수)
                      </span>
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading || syncing || !termsAgreed || !privacyAgreed}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        가입 중...
                      </>
                    ) : syncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Instagram 동기화 중...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        인플루언서로 시작하기
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="advertiser">
                <form onSubmit={handleAdvertiserSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <div className="relative">
                      <Input 
                        id="email"
                        type="email" 
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pr-10 ${
                          emailValid === true ? 'border-green-500' : 
                          emailValid === false ? 'border-red-500' : ''
                        }`}
                        disabled={loading}
                        required
                      />
                      {emailValid !== null && (
                        <div className="absolute right-3 top-3">
                          {emailValid ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {emailValid === false && (
                      <p className="text-xs text-red-500">
                        올바른 이메일 형식을 입력해주세요
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-name">회사명</Label>
                    <Input 
                      id="company-name"
                      type="text" 
                      placeholder="회사명 입력"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="advertiser-password">비밀번호</Label>
                    <div className="relative">
                      <Input 
                        id="advertiser-password"
                        type={showAdvertiserPassword ? "text" : "password"}
                        placeholder="6자 이상 입력"
                        value={advertiserPassword}
                        onChange={(e) => setAdvertiserPassword(e.target.value)}
                        className="pr-10"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdvertiserPassword(!showAdvertiserPassword)}
                        className="absolute right-3 top-3"
                      >
                        {showAdvertiserPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordStrength && activeTab === 'advertiser' && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full ${
                                i <= passwordStrength.score
                                  ? passwordStrength.color
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600">
                          비밀번호 강도: {passwordStrength.message}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="advertiser-password-confirm">비밀번호 확인</Label>
                    <div className="relative">
                      <Input 
                        id="advertiser-password-confirm"
                        type={showAdvertiserPasswordConfirm ? "text" : "password"}
                        placeholder="비밀번호 재입력"
                        value={advertiserPasswordConfirm}
                        onChange={(e) => setAdvertiserPasswordConfirm(e.target.value)}
                        className={`pr-10 ${
                          advertiserPasswordConfirm && 
                          (advertiserPassword === advertiserPasswordConfirm ? 'border-green-500' : 'border-red-500')
                        }`}
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdvertiserPasswordConfirm(!showAdvertiserPasswordConfirm)}
                        className="absolute right-3 top-3"
                      >
                        {showAdvertiserPasswordConfirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {advertiserPasswordConfirm && (
                      <p className={`text-xs ${
                        advertiserPassword === advertiserPasswordConfirm 
                          ? 'text-green-600' 
                          : 'text-red-500'
                      }`}>
                        {advertiserPassword === advertiserPasswordConfirm 
                          ? '✓ 비밀번호가 일치합니다' 
                          : '비밀번호가 일치하지 않습니다'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="mt-1"
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-600">
                        <Link href="/terms" className="text-green-600 hover:underline">이용약관</Link>에 동의합니다 (필수)
                      </span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={privacyAgreed}
                        onChange={(e) => setPrivacyAgreed(e.target.checked)}
                        className="mt-1"
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-600">
                        <Link href="/privacy" className="text-green-600 hover:underline">개인정보처리방침</Link>에 동의합니다 (필수)
                      </span>
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading || !termsAgreed || !privacyAgreed}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        가입 중...
                      </>
                    ) : (
                      <>
                        <Building className="h-4 w-4 mr-2" />
                        광고주로 시작하기
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t">
              <p className="text-center text-sm text-gray-600 mb-3">
                이미 계정이 있으신가요?
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/login')}
              >
                로그인하기
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-xs text-gray-500">
          가입 시 서비스 이용에 동의하는 것으로 간주됩니다
        </div>
      </div>
    </div>
  )
}

// 메인 컴포넌트 - Suspense로 감싸기
export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto" />
          <p className="mt-2 text-gray-600">로딩중...</p>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}