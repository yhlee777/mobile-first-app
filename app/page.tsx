'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Building,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()  // router 추가
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-blue-50">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 브랜드 로고 */}
            <h1 className="text-2xl sm:text-3xl font-bold brand-primary-text">잇다</h1>
            
            {/* 로그인 버튼 제거 */}
            <div></div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center max-w-4xl mx-auto">
          {/* 메인 타이틀 */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 mb-4">
              <Sparkles className="h-4 w-4 brand-primary-text" />
              <span className="text-sm font-medium text-gray-700">인플루언서 마케팅 플랫폼</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              인플루언서와 <br />
              <span className="brand-primary-text">광고주</span>를 잇다
            </h2>
            
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              효과적인 마케팅 캠페인을 위한 스마트한 매칭 플랫폼입니다. 
              <br className="hidden sm:block" />
              지금 시작해서 새로운 기회를 만나보세요.
            </p>
          </div>

          {/* CTA 버튼들 - Link를 Button onClick으로 변경 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16">
            <Button 
              size="lg" 
              className="w-full sm:w-auto brand-primary brand-primary-hover text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => router.push('/signup?tab=advertiser')}  // 변경
            >
              <Building className="h-5 w-5" />
              광고주로 시작하기
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto brand-primary-border brand-primary-text hover:brand-primary hover:text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => router.push('/signup?tab=influencer')}  // 변경
            >
              <Users className="h-5 w-5" />
              인플루언서로 시작하기
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          {/* 주요 기능 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 sm:mb-16">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="brand-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">정확한 매칭</h3>
              <p className="text-sm text-gray-600">AI 기반 매칭으로 최적의 파트너를 찾아드립니다</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="brand-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">성과 분석</h3>
              <p className="text-sm text-gray-600">실시간 데이터로 캠페인 성과를 한눈에 확인하세요</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="brand-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">간편한 관리</h3>
              <p className="text-sm text-gray-600">직관적인 대시보드로 모든 활동을 효율적으로 관리</p>
            </div>
          </div>

          {/* 통계 섹션 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold brand-primary-text mb-2">10K+</div>
              <div className="text-sm text-gray-600">등록된 인플루언서</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold brand-primary-text mb-2">500+</div>
              <div className="text-sm text-gray-600">활성 광고주</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold brand-primary-text mb-2">1M+</div>
              <div className="text-sm text-gray-600">총 캠페인 도달률</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold brand-primary-text mb-2">95%</div>
              <div className="text-sm text-gray-600">고객 만족도</div>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-white font-bold text-xl mb-4">잇다</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                인플루언서와 광고주를 연결하는 스마트한 마케팅 플랫폼입니다.
                <br />
                진정성 있는 콘텐츠로 브랜드 가치를 높이세요.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">서비스</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">회사소개</Link></li>
                <li><Link href="/features" className="text-gray-400 hover:text-white text-sm transition-colors">주요기능</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">요금안내</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">고객지원</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white text-sm transition-colors">도움말</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">문의하기</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">이용약관</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 잇다. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}