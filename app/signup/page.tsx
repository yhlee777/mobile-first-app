'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Instagram, Building, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'influencer' | 'advertiser'>('influencer')
  
  // 인플루언서 폼
  const [instagramHandle, setInstagramHandle] = useState('')
  const [influencerPassword, setInfluencerPassword] = useState('')
  const [influencerPasswordConfirm, setInfluencerPasswordConfirm] = useState('')
  
  // 광고주 폼
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [advertiserPassword, setAdvertiserPassword] = useState('')
  const [advertiserPasswordConfirm, setAdvertiserPasswordConfirm] = useState('')

  const handleInfluencerSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (influencerPassword !== influencerPasswordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (influencerPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }
    
    const cleanHandle = instagramHandle.replace('@', '').trim()
    if (!cleanHandle) {
      setError('인스타그램 아이디를 입력해주세요.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const tempEmail = `${cleanHandle}@instagram.temp`
      
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
          setError('이미 등록된 인스타그램 계정입니다.')
        } else {
          setError(authError.message)
        }
        return
      }
      
      if (!authData.user) {
        throw new Error('회원가입에 실패했습니다.')
      }

      await supabase.from('users').insert([
        {
          id: authData.user.id,
          user_type: 'influencer',
          email: tempEmail,
          instagram_handle: cleanHandle
        }
      ])
      
      await supabase.from('influencers').insert([
        {
          user_id: authData.user.id,
          instagram_handle: cleanHandle,
          name: cleanHandle,
          is_active: false
        }
      ])
      
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: influencerPassword
      })
      
      if (signInData?.user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
      
    } catch (error: any) {
      setError(error.message || '회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdvertiserSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (advertiserPassword !== advertiserPasswordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (advertiserPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
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
          setError('이미 등록된 이메일입니다.')
        } else {
          setError(authError.message)
        }
        return
      }
      
      if (!authData.user) {
        throw new Error('회원가입에 실패했습니다.')
      }

      await supabase.from('users').insert([
        {
          id: authData.user.id,
          user_type: 'advertiser',
          email: email
        }
      ])
      
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: email,
        password: advertiserPassword
      })
      
      if (signInData?.user) {
        router.push('/advertiser')
      } else {
        router.push('/login')
      }
      
    } catch (error: any) {
      setError(error.message || '회원가입 중 오류가 발생했습니다.')
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
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
        </div>

        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">회원가입</CardTitle>
            <CardDescription>
              인플루언서 또는 광고주로 가입하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'influencer' | 'advertiser')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="influencer" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  인플루언서
                </TabsTrigger>
                <TabsTrigger value="advertiser" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  광고주
                </TabsTrigger>
              </TabsList>

              {/* 인플루언서 탭 */}
              <TabsContent value="influencer" className="mt-4">
                <form onSubmit={handleInfluencerSignup} className="space-y-4">
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
                    <p className="text-xs text-gray-500">* @ 없이 아이디만 입력</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="influencer-password">비밀번호</Label>
                    <Input
                      id="influencer-password"
                      type="password"
                      placeholder="••••••••"
                      value={influencerPassword}
                      onChange={(e) => setInfluencerPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">* 최소 6자 이상</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="influencer-password-confirm">비밀번호 확인</Label>
                    <Input
                      id="influencer-password-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={influencerPasswordConfirm}
                      onChange={(e) => setInfluencerPasswordConfirm(e.target.value)}
                      required
                    />
                  </div>
                  
                  {error && activeTab === 'influencer' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={loading || !instagramHandle || !influencerPassword}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        가입 중...
                      </>
                    ) : (
                      '인플루언서로 시작하기'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* 광고주 탭 */}
              <TabsContent value="advertiser" className="mt-4">
                <form onSubmit={handleAdvertiserSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">회사명</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="회사명 입력"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="company@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="advertiser-password">비밀번호</Label>
                    <Input
                      id="advertiser-password"
                      type="password"
                      placeholder="••••••••"
                      value={advertiserPassword}
                      onChange={(e) => setAdvertiserPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">* 최소 6자 이상</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="advertiser-password-confirm">비밀번호 확인</Label>
                    <Input
                      id="advertiser-password-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={advertiserPasswordConfirm}
                      onChange={(e) => setAdvertiserPasswordConfirm(e.target.value)}
                      required
                    />
                  </div>
                  
                  {error && activeTab === 'advertiser' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={loading || !email || !advertiserPassword || !companyName}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        가입 중...
                      </>
                    ) : (
                      '광고주로 시작하기'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                  로그인
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}