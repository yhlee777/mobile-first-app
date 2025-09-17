'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPhoneAuth, setIsPhoneAuth] = useState(true)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [role, setRole] = useState<'advertiser' | 'influencer'>('advertiser')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'influencer') {
      setRole('influencer')
    }
  }, [searchParams])

  const handlePhoneSignup = async () => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+82${phone.startsWith('0') ? phone.slice(1) : phone}`,
        options: {
          data: { role }
        }
      })
      
      if (error) throw error
      setShowOtpInput(true)
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다')
    }
    setLoading(false)
  }

  const handleOtpVerification = async () => {
    setLoading(true)
    setError('')
    const supabase = createClient() as any // any 타입 캐스팅
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+82${phone.startsWith('0') ? phone.slice(1) : phone}`,
        token: otp,
        type: 'sms'
      })
      
      if (error) throw error
      
      if (data.user) {
        // profiles 테이블에 데이터 저장
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            phone: phone,
            role: role
          })

        // 이미 존재하는 경우 업데이트
        if (profileError?.code === '23505') {
          await supabase
            .from('profiles')
            .update({ 
              phone: phone, 
              role: role 
            })
            .eq('id', data.user.id)
        }

        if (role === 'influencer') {
          const { error: influencerError } = await supabase
            .from('influencers')
            .insert({
              user_id: data.user.id
            })

          // 이미 존재하는 경우 무시
          if (influencerError && influencerError.code !== '23505') {
            console.error('Influencer insert error:', influencerError)
          }
        }
      }
      
      router.push(role === 'advertiser' ? '/advertiser' : '/influencer')
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다')
    }
    setLoading(false)
  }

  const handleEmailSignup = async () => {
    setLoading(true)
    setError('')
    const supabase = createClient() as any // any 타입 캐스팅
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }
        }
      })
      
      if (error) throw error
      
      if (data.user) {
        // profiles 테이블에 데이터 저장
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            role: role
          })

        // 이미 존재하는 경우 업데이트
        if (profileError?.code === '23505') {
          await supabase
            .from('profiles')
            .update({ 
              email: email, 
              role: role 
            })
            .eq('id', data.user.id)
        }

        if (role === 'influencer') {
          const { error: influencerError } = await supabase
            .from('influencers')
            .insert({
              user_id: data.user.id
            })

          // 이미 존재하는 경우 무시
          if (influencerError && influencerError.code !== '23505') {
            console.error('Influencer insert error:', influencerError)
          }
        }
      }
      
      router.push(role === 'advertiser' ? '/advertiser' : '/influencer')
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-green-50 to-white">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-green-600 mb-8 group">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          홈으로 돌아가기
        </Link>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mb-2">
              <span className="text-3xl font-bold text-green-600">itda</span>
            </div>
            <CardTitle>회원가입</CardTitle>
            <CardDescription>
              새로운 계정을 만들어 서비스를 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">회원 유형</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('advertiser')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    role === 'advertiser' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <svg className="w-8 h-8 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="font-medium">광고주</div>
                  <div className="text-xs text-gray-500 mt-1">캠페인 진행</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('influencer')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    role === 'influencer' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <svg className="w-8 h-8 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <div className="font-medium">인플루언서</div>
                  <div className="text-xs text-gray-500 mt-1">콘텐츠 제작</div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="auth-type" className={!isPhoneAuth ? 'text-gray-400' : ''}>
                휴대폰 인증
              </Label>
              <Switch
                id="auth-type"
                checked={!isPhoneAuth}
                onChange={(e) => {
                  setIsPhoneAuth(!e.target.checked)
                  setShowOtpInput(false)
                  setError('')
                }}
              />
              <Label htmlFor="auth-type" className={isPhoneAuth ? 'text-gray-400' : ''}>
                이메일 인증
              </Label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {isPhoneAuth ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">휴대폰 번호</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={showOtpInput}
                  />
                </div>
                
                {showOtpInput && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">인증번호</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="6자리 인증번호"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  onClick={showOtpInput ? handleOtpVerification : handlePhoneSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      처리중...
                    </div>
                  ) : showOtpInput ? '가입 완료' : 'OTP 발송'}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="8자 이상"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleEmailSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      처리중...
                    </div>
                  ) : '회원가입'}
                </Button>
              </>
            )}

            <div className="text-center text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
                로그인
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}