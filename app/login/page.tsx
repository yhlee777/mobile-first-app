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
  Mail,
  Users,
  Building,
  Loader2,
  Lock
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // Supabase 로그인
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        // 사용자 타입 확인 - influencers 테이블에서 먼저 확인
        const { data: influencerData, error: influencerError } = await supabase
          .from('influencers')
          .select('id, user_id')
          .eq('user_id', authData.user.id)
          .single()

        if (influencerData && !influencerError) {
          // 인플루언서라면 대시보드로
          router.push('/dashboard')
          return
        }

        // advertisers 테이블에서 확인
        const { data: advertiserData, error: advertiserError } = await supabase
          .from('advertisers')
          .select('id, user_id')
          .eq('user_id', authData.user.id)
          .single()

        if (advertiserData && !advertiserError) {
          // 광고주라면 광고주 페이지로
          router.push('/advertiser')
          return
        }

        // 둘 다 아니라면 기본으로 광고주 페이지로 (또는 온보딩 페이지로)
        console.log('사용자 타입을 확인할 수 없습니다. 기본 페이지로 이동합니다.')
        router.push('/advertiser')
      }
      
    } catch (error: any) {
      console.error('로그인 오류:', error)
      
      if (error.message?.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다')
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
        {/* 뒤로가기 버튼 */}
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
                <Label htmlFor="email">이메일</Label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력하세요"
                    className="pl-10 h-11 sm:h-12 text-base"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">비밀번호</Label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="pl-10 h-11 sm:h-12 text-base"
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
                    className="w-full hover:bg-gray-50 brand-primary-border brand-primary-text h-10 text-sm"
                    disabled={loading}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    인플루언서 가입
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-gray-50 brand-primary-border brand-primary-text h-10 text-sm"
                    disabled={loading}
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
                <p className="text-xs text-gray-500">테스트 계정을 생성하여 테스트해보세요</p>
                <p className="text-xs text-gray-500 mt-1">로그인 후 DB에서 사용자 유형을 확인하여 적절한 페이지로 이동합니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}