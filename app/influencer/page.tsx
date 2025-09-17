'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Building, User, TrendingUp, Shield, Zap, Target } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            브랜드와 인플루언서를
            <span className="text-green-600"> 연결하는 </span>
            플랫폼
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            효과적인 인플루언서 마케팅으로 브랜드 가치를 높이세요
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/influencer/signup')}
            >
              <User className="mr-2 h-5 w-5" />
              인플루언서로 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/auth/signup')}
            >
              <Building className="mr-2 h-5 w-5" />
              광고주로 시작하기
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>정확한 타겟팅</CardTitle>
              <CardDescription>
                카테고리, 팔로워 수, 참여율 기준으로 최적의 인플루언서를 찾아보세요
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>실시간 분석</CardTitle>
              <CardDescription>
                캠페인 성과를 실시간으로 추적하고 ROI를 측정하세요
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>안전한 거래</CardTitle>
              <CardDescription>
                검증된 인플루언서와 투명한 계약 프로세스로 안심하고 거래하세요
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600">1,000+</div>
              <div className="text-gray-600 mt-2">활동 인플루언서</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600">500+</div>
              <div className="text-gray-600 mt-2">파트너 브랜드</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600">10M+</div>
              <div className="text-gray-600 mt-2">총 도달수</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600">95%</div>
              <div className="text-gray-600 mt-2">만족도</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">
              지금 시작하세요
            </h2>
            <p className="text-lg mb-8 opacity-90">
              무료로 가입하고 첫 캠페인을 시작해보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100"
                onClick={() => router.push('/influencer/signup')}
              >
                <User className="mr-2 h-5 w-5" />
                인플루언서 회원가입
              </Button>
              <Button
                size="lg"
                className="bg-white/10 text-white border border-white/30 hover:bg-white/20"
                onClick={() => router.push('/auth/signup')}
              >
                <Building className="mr-2 h-5 w-5" />
                광고주 회원가입
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">플랫폼</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => router.push('/influencer/signup')}
                    className="hover:text-white transition-colors"
                  >
                    인플루언서
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/auth/signup')}
                    className="hover:text-white transition-colors"
                  >
                    광고주
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">회사</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">소개</a></li>
                <li><a href="#" className="hover:text-white transition-colors">채용</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">지원</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">도움말</a></li>
                <li><a href="#" className="hover:text-white transition-colors">문의하기</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">법적사항</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">이용약관</a></li>
                <li><a href="#" className="hover:text-white transition-colors">개인정보처리방침</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p>&copy; 2024 인플루언서 플랫폼. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}