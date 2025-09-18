'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Loader2,
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier || !password) {
      setError('아이디와 비밀번호를 입력해주세요')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      let loginEmail = identifier
      
      // @ 없고 이메일 형식이 아니면 인스타그램 ID로 간주
      if (!identifier.includes('@') && !identifier.includes('.')) {
        loginEmail = `${identifier}@instagram.temp`
      }
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        const { data: influencerData, error: influencerError } = await supabase
          .from('influencers')
          .select('id, user_id')
          .eq('user_id', authData.user.id)
          .single()

        if (influencerData && !influencerError) {
          router.push('/dashboard')
          return
        }

        const { data: advertiserData, error: advertiserError } = await supabase
          .from('advertisers')
          .select('id, user_id')
          .eq('user_id', authData.user.id)
          .single()

        if (advertiserData && !advertiserError) {
          router.push('/advertiser')
          return
        }

        console.log('사용자 타입을 확인할 수 없습니다. 기본 페이지로 이동합니다.')
        router.push('/advertiser')
      }
      
    } catch (error: any) {
      console.error('로그인 오류:', error)
      
      if (error.message?.includes('Invalid login credentials')) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다')
      } else if (error.message?.includes('Email not confirmed')) {
        setError('이메일 인증을 완료해주세요')
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8" style={{ zoom: 'reset' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-2 pb-4">
            <CardTitle className="text-2xl font-bold brand-primary-text">로그인</CardTitle>
            <CardDescription className="text-gray-600">
              계정에 로그인하여 파트너를 만나보세요
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <Label htmlFor="identifier">이메일 또는 인스타그램 ID</Label>
                <div className="mt-1">
                  <Input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="이메일 또는 @없이 인스타그램 ID"
                    className="h-11 sm:h-12 text-base"
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">비밀번호</Label>
                <div className="mt-1">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="h-11 sm:h-12 text-base"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 brand-primary-text focus:ring-2 border-gray-300 rounded"
                    style={{ accentColor: '#51a66f' }}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    로그인 상태 유지
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium brand-primary-text hover:opacity-80">
                    비밀번호 찾기
                  </a>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full brand-primary brand-primary-hover text-white h-11 sm:h-12 text-base" 
                disabled={loading}
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">계정이 없으신가요?</span>
              </div>
            </div>

            <Link href="/signup" passHref>
              <Button 
                variant="outline" 
                className="w-full h-11 sm:h-12 text-base border-2 hover:bg-green-50 hover:border-green-600 hover:text-green-600 transition-colors"
              >
                회원가입
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}