'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Instagram, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function InfluencerSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [instagramHandle, setInstagramHandle] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }
    
    // 인스타그램 핸들 정리 (@ 제거)
    const cleanHandle = instagramHandle.replace('@', '').trim()
    if (!cleanHandle) {
      setError('인스타그램 아이디를 입력해주세요.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      // 임시 이메일 생성 (인스타그램 핸들 기반)
      const tempEmail = `${cleanHandle}@instagram.temp`
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: password,
        options: {
          data: {
            instagram_handle: cleanHandle,
            user_type: 'influencer'
          }
        }
      })
      
      if (authError) {
        console.error('Auth error:', authError)
        if (authError.message.includes('already registered')) {
          setError('이미 등록된 인스타그램 계정입니다.')
        } else {
          setError(authError.message)
        }
        return
      }
      
      if (!authData.user) {
        throw new Error('회원가입에 실패했습니다.')
      }

      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            user_type: 'influencer',
            email: tempEmail,
            instagram_handle: cleanHandle
          }
        ])
      
      if (userError && !userError.message.includes('duplicate')) {
        console.error('User table error:', userError)
      }
      
      // influencers 테이블에 기본 데이터 생성
      const { error: influencerError } = await supabase
        .from('influencers')
        .insert([
          {
            user_id: authData.user.id,
            instagram_handle: cleanHandle,
            name: cleanHandle, // 초기값으로 인스타 핸들 사용
            is_active: false // 프로필 완성 전까지 비활성
          }
        ])
      
      if (influencerError && !influencerError.message.includes('duplicate')) {
        console.error('Influencer table error:', influencerError)
      }
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: password
      })
      
      if (signInData?.user) {
        router.push('/dashboard')
      } else {
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
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
              <Instagram className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">인플루언서 회원가입</CardTitle>
          <CardDescription className="text-center">
            인스타그램 계정으로 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">인스타그램 아이디</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">@</span>
                <Input
                  id="instagram"
                  type="text"
                  placeholder="instagram_id"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                * @ 없이 아이디만 입력해주세요
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">* 최소 6자 이상</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={loading || !instagramHandle || !password}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
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
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
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