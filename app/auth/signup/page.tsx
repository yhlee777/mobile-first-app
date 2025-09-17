'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Building, Mail, Lock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            user_type: 'brand',
            name: name
          }
        }
      })
      
      if (error) throw error
      
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          user_type: 'brand',
          phone: null
        })
        
        await supabase.from('brands').insert({
          user_id: data.user.id,
          name: name,
          company_name: companyName
        })
        
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        })
        
        if (!loginError) {
          window.location.href = '/dashboard'
        } else {
          setSuccess(true)
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle>회원가입 완료</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">회원가입이 완료되었습니다!</p>
            <Link href="/login" className="block">
              <Button className="w-full">로그인 페이지로 이동</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>
            광고주 계정을 만들어보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="brand" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="brand">광고주</TabsTrigger>
              <TabsTrigger value="influencer">인플루언서</TabsTrigger>
            </TabsList>
            
            <TabsContent value="brand" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일 *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호 * (6자 이상)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">담당자명 *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                  <Label htmlFor="company">회사명 *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="company"
                      type="text"
                      placeholder="(주)회사명"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                
                <Button
                  onClick={handleSignup}
                  disabled={loading || !email || !password || !name || !companyName || password.length < 6}
                  className="w-full"
                >
                  {loading ? '가입 중...' : '회원가입'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="influencer" className="space-y-4">
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="font-medium text-gray-700">인플루언서 가입</p>
                <p className="text-sm text-gray-600 mt-2">
                  인플루언서 회원가입은<br />
                  관리자 승인이 필요합니다
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  문의: admin@influencer.com
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="auth/login" className="text-primary hover:underline">
                로그인
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}