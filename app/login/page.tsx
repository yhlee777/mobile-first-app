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
        console.log('로그인 성공, 사용자 ID:', authData.user.id)
        
        // 1. 먼저 users 테이블에서 user_type 확인
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', authData.user.id)
          .single()

        if (userData && userData.user_type) {
          console.log('users 테이블에서 user_type 확인:', userData.user_type)
          
          if (userData.user_type === 'influencer') {
            router.push('/influencer/dashboard')
            return
          } else if (userData.user_type === 'advertiser') {
            router.push('/advertiser/dashboard')
            return
          }
        }
        
        // 2. users 테이블에 없으면 influencers 테이블 확인
        const { data: influencerData, error: influencerError } = await supabase
          .from('influencers')
          .select('id, user_id')
          .eq('user_id', authData.user.id)
          .single()

        if (influencerData && !influencerError) {
          console.log('인플루언서로 확인됨')
          
          // users 테이블에 user_type 업데이트
          await supabase
            .from('users')
            .upsert({
              id: authData.user.id,
              user_type: 'influencer',
              name: identifier,
              updated_at: new Date().toISOString()
            })
          
          router.push('/influencer/dashboard')
          return
        }

        // 3. advertisers 또는 brands 테이블 확인
        const { data: advertiserData, error: advertiserError } = await supabase
          .from('advertisers')
          .select('id, user_id')
          .eq('user_id', authData.user.id)
          .single()

        if (advertiserData && !advertiserError) {
          console.log('광고주(advertisers)로 확인됨')
          
          // users 테이블에 user_type 업데이트
          await supabase
            .from('users')
            .upsert({
              id: authData.user.id,
              user_type: 'advertiser',
              name: identifier,
              updated_at: new Date().toISOString()
            })
          
          router.push('/advertiser/dashboard')
          return
        }
        
        // 4. brands 테이블도 확인
      // 4. brands 테이블도 확인 부분을 수정
const { data: brandData, error: brandError } = await supabase
  .from('brands')
  .select('id, user_id, name')  // name 추가
  .eq('user_id', authData.user.id)
  .single()

if (brandData && !brandError) {
  console.log('광고주(brands)로 확인됨')
  
  // users 테이블에 user_type 업데이트
  await supabase
    .from('users')
    .upsert({
      id: authData.user.id,
      user_type: 'advertiser',
      name: brandData.name || identifier,
      updated_at: new Date().toISOString()
    })
  
  router.push('/advertiser/dashboard')
  return
}

        // 5. 어떤 테이블에서도 찾을 수 없는 경우
        console.log('⚠️ 사용자 타입을 확인할 수 없습니다')
        console.log('다음 테이블을 확인했습니다: users, influencers, advertisers, brands')
        
        // 기본값으로 인플루언서 대시보드로 이동
        router.push('/influencer/dashboard')
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
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">로그인</CardTitle>
            <CardDescription>
              계정에 로그인하여 서비스를 이용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">아이디</Label>
                <Input
                  id="identifier"
                  placeholder="이메일 또는 Instagram 아이디"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={loading}
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

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <Link href="/signup" className="text-green-600 hover:text-green-700 font-medium">
                  회원가입
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}