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
  const supabase = createClient()
  
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

  // Instagram 계정 동기화
  const syncInstagramProfile = async () => {
    if (!instagramHandle || !validateInstagramHandle(instagramHandle)) {
      setError('올바른 Instagram 아이디를 입력해주세요')
      return
    }

    setSyncing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ig/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: instagramHandle })
      })
      
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setSuccessMessage('Instagram 프로필이 확인되었습니다!')
      }
    } catch (error) {
      console.error('Sync error:', error)
      setError('Instagram 계정을 확인할 수 없습니다. 아이디를 다시 확인해주세요.')
    } finally {
      setSyncing(false)
    }
  }

  // 인플루언서 회원가입
  const handleInfluencerSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!instagramValid) {
      setError('올바른 Instagram 아이디를 입력해주세요')
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

    setLoading(true)
    setError(null)
    
    try {
      const cleanHandle = instagramHandle.replace('@', '')
      const tempEmail = `${cleanHandle}@instagram.temp`
      
      // 1. Auth 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: influencerPassword,
      })
      
      if (authError) throw authError
      if (!authData.user) throw new Error('회원가입에 실패했습니다')
      
      // 2. users 테이블에 추가
      await supabase.from('users').insert({
        id: authData.user.id,
        user_type: 'influencer',
        name: cleanHandle
      })
      
      // 3. influencers 테이블에 추가
      await supabase.from('influencers').insert({
        user_id: authData.user.id,
        instagram_handle: cleanHandle,
        name: cleanHandle
      })
      
      // 4. 자동 로그인
      await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: influencerPassword
      })
      
      // 5. 성공 메시지 후 홈으로 이동
      setSuccessMessage('회원가입이 완료되었습니다! 홈으로 이동합니다...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
      
    } catch (error: any) {
      setError(error.message || '회원가입 중 오류가 발생했습니다')
      setLoading(false)
    }
  }

  // 광고주 회원가입
  const handleAdvertiserSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailValid) {
      setError('올바른 이메일 주소를 입력해주세요')
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

    setLoading(true)
    setError(null)
    
    try {
      // 1. Auth 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: advertiserPassword,
      })
      
      if (authError) throw authError
      if (!authData.user) throw new Error('회원가입에 실패했습니다')
      
      // 2. users 테이블에 추가
      await supabase.from('users').insert({
        id: authData.user.id,
        user_type: 'advertiser',
        name: companyName
      })
      
      // 3. brands 테이블에 추가
      await supabase.from('brands').insert({
        user_id: authData.user.id,
        name: companyName,
        contact_email: email
      })
      
      // 4. 자동 로그인
      await supabase.auth.signInWithPassword({
        email: email,
        password: advertiserPassword
      })
      
      // 5. 성공 메시지 후 홈으로 이동
      setSuccessMessage('회원가입이 완료되었습니다! 홈으로 이동합니다...')
      setTimeout(() => {
        router.push('/advertiser')
      }, 1500)
      
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
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* 인플루언서 탭 */}
              <TabsContent value="influencer">
                <form onSubmit={handleInfluencerSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">
                      Instagram 아이디 *
                      {syncing && (
                        <span className="ml-2 text-xs text-gray-500">
                          <RefreshCw className="inline h-3 w-3 animate-spin" /> 확인 중...
                        </span>
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id="instagram"
                        placeholder="@username"
                        value={instagramHandle}
                        onChange={(e) => setInstagramHandle(e.target.value)}
                        disabled={loading || syncing}
                        className={
                          instagramValid === false ? 'border-red-500' : 
                          instagramValid === true ? 'border-green-500' : ''
                        }
                      />
                      {instagramValid !== null && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
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
                        Instagram 아이디는 영문, 숫자, _, . 만 사용 가능합니다 (3-30자)
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={syncInstagramProfile}
                      disabled={!instagramValid || syncing || loading}
                      className="w-full"
                    >
                      {syncing ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          확인 중...
                        </>
                      ) : (
                        <>
                          <Instagram className="h-3 w-3 mr-2" />
                          Instagram 계정 확인
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="influencer-password">비밀번호 *</Label>
                    <div className="relative">
                      <Input
                        id="influencer-password"
                        type={showInfluencerPassword ? "text" : "password"}
                        placeholder="최소 6자 이상"
                        value={influencerPassword}
                        onChange={(e) => setInfluencerPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowInfluencerPassword(!showInfluencerPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
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
                          {[1, 2, 3, 4, 5, 6].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full ${
                                level <= passwordStrength.score
                                  ? passwordStrength.color
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          비밀번호 강도: {passwordStrength.message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="influencer-password-confirm">비밀번호 확인 *</Label>
                    <div className="relative">
                      <Input
                        id="influencer-password-confirm"
                        type={showInfluencerPasswordConfirm ? "text" : "password"}
                        placeholder="비밀번호를 다시 입력해주세요"
                        value={influencerPasswordConfirm}
                        onChange={(e) => setInfluencerPasswordConfirm(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowInfluencerPasswordConfirm(!showInfluencerPasswordConfirm)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
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
                        이용약관에 동의합니다 (필수)
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
                        개인정보처리방침에 동의합니다 (필수)
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
                    ) : (
                      <>
                        <Instagram className="h-4 w-4 mr-2" />
                        인플루언서로 시작하기
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* 광고주 탭 */}
              <TabsContent value="advertiser">
                <form onSubmit={handleAdvertiserSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일 *</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className={
                          emailValid === false ? 'border-red-500' : 
                          emailValid === true ? 'border-green-500' : ''
                        }
                      />
                      {emailValid !== null && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          {emailValid ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {emailValid === false && (
                      <p className="text-xs text-red-500">올바른 이메일 형식이 아닙니다</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">회사/브랜드명 *</Label>
                    <Input
                      id="company"
                      placeholder="회사 또는 브랜드명"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="advertiser-password">비밀번호 *</Label>
                    <div className="relative">
                      <Input
                        id="advertiser-password"
                        type={showAdvertiserPassword ? "text" : "password"}
                        placeholder="최소 6자 이상"
                        value={advertiserPassword}
                        onChange={(e) => setAdvertiserPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdvertiserPassword(!showAdvertiserPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
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
                          {[1, 2, 3, 4, 5, 6].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full ${
                                level <= passwordStrength.score
                                  ? passwordStrength.color
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          비밀번호 강도: {passwordStrength.message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="advertiser-password-confirm">비밀번호 확인 *</Label>
                    <div className="relative">
                      <Input
                        id="advertiser-password-confirm"
                        type={showAdvertiserPasswordConfirm ? "text" : "password"}
                        placeholder="비밀번호를 다시 입력해주세요"
                        value={advertiserPasswordConfirm}
                        onChange={(e) => setAdvertiserPasswordConfirm(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdvertiserPasswordConfirm(!showAdvertiserPasswordConfirm)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
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
                        이용약관에 동의합니다 (필수)
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
                        개인정보처리방침에 동의합니다 (필수)
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
                로그인
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// 메인 컴포넌트
export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}