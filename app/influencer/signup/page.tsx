'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function InfluencerSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 비밀번호 검증
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      // 1. Auth 회원가입
      console.log('Starting signup with email:', email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            user_type: 'influencer'
          }
        }
      })
      
      if (authError) {
        console.error('Auth error:', authError)
        if (authError.message.includes('already registered')) {
          setError('이미 등록된 이메일입니다.')
        } else {
          setError(authError.message)
        }
        return
      }
      
      if (!authData.user) {
        throw new Error('회원가입에 실패했습니다.')
      }

      console.log('Auth successful, user ID:', authData.user.id)
      
      // 2. users 테이블에 기본 정보 삽입
      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            user_type: 'influencer',
            email: email
          }
        ])
      
      if (userError && !userError.message.includes('duplicate')) {
        console.error('User table error:', userError)
      }
      
      console.log('Signup completed successfully')
      
      // 3. 자동 로그인 시도
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })
      
      if (signInData?.user) {
        // 로그인 성공 - 온보딩으로 이동
        router.push('/influencer/onboarding')
      } else {
        // 로그인 실패 - 로그인 페이지로 이동
        console.log('Auto sign-in failed:', signInError)
        router.push('/login')
      }
      
    } catch (error: any) {
      console.error('Signup error:', error)
      setError(error.message || '회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">인플루언서 회원가입</CardTitle>
          <CardDescription className="text-center">
            기본 정보를 입력해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-600" />
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-600" />
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
              <p className="text-xs text-gray-500">
                * 실제 이메일 주소를 입력해주세요
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-600" />
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
              <p className="text-xs text-gray-500">* 최소 6자 이상</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-600" />
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="••••••••"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
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
              disabled={loading || !email || !password || !name}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  가입 중...
                </>
              ) : (
                '회원가입'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                로그인
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              <Link href="/auth/signup" className="hover:text-gray-700">
                광고주로 가입하기
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}