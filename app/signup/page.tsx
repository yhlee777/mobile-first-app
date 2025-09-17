'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Phone, User, Building } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState<'brand' | 'influencer'>('brand')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendOTP = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const formattedPhone = phone.startsWith('+82') ? phone : `+82${phone.replace(/^0/, '')}`
      
      // OTP 전송
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: {
            user_type: userType,
            name: name
          }
        }
      })
      
      if (error) throw error
      setOtpSent(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const formattedPhone = phone.startsWith('+82') ? phone : `+82${phone.replace(/^0/, '')}`
      
      // OTP 확인
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      })
      
      if (error) throw error
      
      // 사용자 타입 저장
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            user_type: userType,
            phone: formattedPhone
          })
        
        if (profileError && profileError.code !== '23505') { // 중복 에러가 아닌 경우
          throw profileError
        }
        
        // 브랜드 프로필 생성
        if (userType === 'brand') {
          await supabase
            .from('brands')
            .insert({
              user_id: data.user.id,
              name: name,
              company_name: companyName
            })
        }
      }
      
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>
            인플루언서 플랫폼에 가입하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="brand" onValueChange={(v) => setUserType(v as 'brand' | 'influencer')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="brand">광고주</TabsTrigger>
              <TabsTrigger value="influencer">인플루언서</TabsTrigger>
            </TabsList>
            
            <TabsContent value="brand" className="space-y-4">
              {!otpSent ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">담당자명</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="홍길동"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">회사명</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="company"
                        type="text"
                        placeholder="(주)회사명"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">전화번호</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="010-1234-5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                  
                  <Button
                    onClick={handleSendOTP}
                    disabled={loading || !phone || !name || !companyName}
                    className="w-full"
                  >
                    {loading ? '전송 중...' : 'OTP 전송'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">인증번호</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="6자리 인증번호"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                  
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={loading || !otp}
                    className="w-full"
                  >
                    {loading ? '확인 중...' : '가입하기'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOtpSent(false)
                      setOtp('')
                    }}
                    className="w-full"
                  >
                    다시 전송
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="influencer" className="space-y-4">
              <div className="text-center text-gray-600 py-8">
                인플루언서 회원가입은 준비 중입니다.
                <br />
                관리자에게 문의해주세요.
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-primary hover:underline">
                로그인
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}