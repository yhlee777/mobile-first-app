'use client'

import { useState } from 'react'
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
      // 실제 로그인 로직
      console.log('로그인 시도:', email)
      
      // Mock: 2초 후 광고주 페이지로 리다이렉트
      setTimeout(() => {
        setLoading(false)
        router.push('/advertiser')
      }, 2000)
      
    } catch (error) {
      console.error('로그인 오류:', error)
      setError('로그인 중 오류가 발생했습니다')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* 뒤로가기 버튼 */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Button>
        </div>

        {/* 브랜드 로고 - 원형 제거하고 텍스트만 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold brand-primary-text mb-2">잇다</h2>
          <h3 className="text-2xl font-bold text-gray-900">로그인</h3>
          <p className="text-gray-600 mt-2">이메일과 비밀번호로 로그인하세요</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>계정 로그인</CardTitle>
            <CardDescription>
              기존 계정으로 서비스를 이용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">이메일</Label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="pl-10"
                    disabled={loading}
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
                    className="pl-10"
                    disabled={loading}
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
                className="w-full brand-primary brand-primary-hover text-white" 
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
                    className="w-full hover:bg-gray-50 brand-primary-border brand-primary-text"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    인플루언서 가입
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-gray-50 brand-primary-border brand-primary-text"
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
                <p className="text-xs text-gray-500">테스트 계정: test@example.com / 123456</p>
                <p className="text-xs text-gray-500 mt-1">콘솔에서 라우팅 과정을 확인하세요</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}