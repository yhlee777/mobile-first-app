'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, AlertCircle, Loader2, LogIn, Users, Building } from 'lucide-react'
import Link from 'next/link'

export default function UnifiedLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식이 아닙니다. (예: example@email.com)')
      return
    }
    
    if (!password) {
      setError('비밀번호를 입력해주세요.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔐 로그인 시도:', email)
      
      // 1. Supabase Auth로 로그인
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })
      
      if (authError) {
        console.error('❌ Auth error:', authError)
        
        // 오류 메시지를 더 친절하게 변경
        if (authError.message.includes('Invalid login credentials') || 
            authError.message.includes('invalid_grant')) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해주세요.')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('이메일 인증이 필요합니다. 이메일을 확인해주세요.')
        } else if (authError.message.includes('Too many requests')) {
          setError('너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.')
        } else {
          setError('로그인에 실패했습니다. 이메일과 비밀번호를 다시 확인해주세요.')
        }
        setLoading(false)
        return
      }
      
      if (!authData.user) {
        setError('로그인에 실패했습니다. 이메일과 비밀번호를 다시 확인해주세요.')
        setLoading(false)
        return
      }

      console.log('✅ 로그인 성공! User ID:', authData.user.id)
      console.log('📧 User Email:', authData.user.email)
      
      // 2. users 테이블에서 사용자 타입 확인
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', authData.user.id)
        .single()
      
      console.log('👤 User Data from users table:', userData)
      console.log('👤 User Error:', userError)
      
      // 3. user_type이 없거나 에러가 있으면 influencers 테이블 확인
      let isInfluencer = false
      let hasInfluencerProfile = false
      
      if (!userData?.user_type || userError) {
        console.log('⚠️ user_type이 없음, influencers 테이블 확인...')
        
        // influencers 테이블에서 확인
        const { data: influencerCheck, error: influencerError } = await supabase
          .from('influencers')
          .select('id')
          .eq('user_id', authData.user.id)
          .single()
        
        console.log('🎯 Influencer check:', influencerCheck)
        
        if (influencerCheck && !influencerError) {
          isInfluencer = true
          hasInfluencerProfile = true
          console.log('✅ influencers 테이블에서 발견!')
          
          // users 테이블 업데이트
          await supabase
            .from('users')
            .upsert({
              id: authData.user.id,
              email: authData.user.email,
              user_type: 'influencer'
            })
          console.log('📝 users 테이블 업데이트 완료')
        }
      } else {
        // user_type이 있는 경우
        isInfluencer = userData.user_type === 'influencer'
        console.log('📋 User Type:', userData.user_type)
        
        // 인플루언서라면 프로필 확인
        if (isInfluencer) {
          const { data: profileCheck } = await supabase
            .from('influencers')
            .select('id')
            .eq('user_id', authData.user.id)
            .single()
          
          hasInfluencerProfile = !!profileCheck
        }
      }
      
      // 4. 라우팅 결정
      console.log('🚀 라우팅 결정 - isInfluencer:', isInfluencer, 'hasProfile:', hasInfluencerProfile)
      
      if (isInfluencer) {
        if (hasInfluencerProfile) {
          console.log('➡️ 인플루언서 대시보드로 이동')
          window.location.href = '/influencer/dashboard'
        } else {
          console.log('➡️ 인플루언서 온보딩으로 이동')
          window.location.href = '/influencer/onboarding'
        }
      } else if (userData?.user_type === 'advertiser') {
        console.log('➡️ 광고주 페이지로 이동')
        window.location.href = '/advertiser'
      } else {
        // 기본값: 일반 대시보드
        console.log('➡️ 기본 대시보드로 이동')
        window.location.href = '/dashboard'
      }
      
    } catch (error: any) {
      console.error('🔥 Login error:', error)
      setError('로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <LogIn className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">로그인</CardTitle>
          <CardDescription className="text-center">
            이메일과 비밀번호를 입력하여 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">계정이 없으신가요?</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link href="/influencer/signup">
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-green-50 hover:border-green-300"
                >
                  <Users className="h-4 w-4 mr-2" />
                  인플루언서 가입
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-green-50 hover:border-green-300"
                >
                  <Building className="h-4 w-4 mr-2" />
                  광고주 가입
                </Button>
              </Link>
            </div>
          </div>

          {/* 디버그 정보 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2">🔧 개발자 정보:</p>
              <p className="text-xs text-gray-500">콘솔에서 라우팅 과정을 확인하세요</p>
              <p className="text-xs text-gray-500 mt-1">F12 → Console 확인</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}