'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Building, 
  User, 
  ChevronDown,
  X
} from 'lucide-react'

export default function Home() {
  const [showLoginMenu, setShowLoginMenu] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="font-bold text-2xl sm:text-3xl text-green-600">itda</div>
          <nav className="flex gap-2 sm:gap-4">
            <div className="relative">
              <Button 
                variant="ghost" 
                className="text-sm sm:text-base"
                onClick={() => setShowLoginMenu(!showLoginMenu)}
              >
                로그인
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showLoginMenu ? 'rotate-180' : ''}`} />
              </Button>
              
              {showLoginMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLoginMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <Link 
                      href="/auth/login"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors rounded-t-lg"
                      onClick={() => setShowLoginMenu(false)}
                    >
                      <Building className="h-4 w-4" />
                      <span>광고주 로그인</span>
                    </Link>
                    <Link 
                      href="/influencer/login"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors rounded-b-lg"
                      onClick={() => setShowLoginMenu(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>인플루언서 로그인</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-green-50 to-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32">
            <div className="flex flex-col items-center text-center space-y-8">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                인플루언서와 광고주를
                <span className="block text-green-600 mt-2">잇다, itda</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-base sm:text-lg lg:text-xl text-gray-600">
                효과적인 마케팅 캠페인을 위한 최적의 파트너를 찾아드립니다
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto min-w-[200px]">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    광고주로 시작하기
                  </Button>
                </Link>
                <Link href="/influencer/signup">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[200px]">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    인플루언서로 시작하기
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full max-w-3xl mt-12">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">10K+</div>
                  <div className="text-sm text-gray-600">인플루언서</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">500+</div>
                  <div className="text-sm text-gray-600">광고주</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">1M+</div>
                  <div className="text-sm text-gray-600">총 팔로워</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">95%</div>
                  <div className="text-sm text-gray-600">만족도</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
              왜 <span className="text-green-600">itda</span>인가?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="flex flex-col items-center text-center group">
                <div className="rounded-full bg-green-100 p-4 mb-4 group-hover:bg-green-200 transition-colors">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">다양한 인플루언서</h3>
                <p className="text-gray-600 leading-relaxed">
                  패션, 뷰티, 음식, 여행 등 다양한 카테고리의 인플루언서들과 만나보세요
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center group">
                <div className="rounded-full bg-green-100 p-4 mb-4 group-hover:bg-green-200 transition-colors">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">실시간 분석</h3>
                <p className="text-gray-600 leading-relaxed">
                  캠페인 성과를 실시간으로 추적하고 데이터 기반 의사결정을 내리세요
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center group">
                <div className="rounded-full bg-green-100 p-4 mb-4 group-hover:bg-green-200 transition-colors">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">안전한 거래</h3>
                <p className="text-gray-600 leading-relaxed">
                  검증된 시스템으로 안전하고 투명한 거래를 보장합니다
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 border-t">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">서비스</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/influencer/signup" className="hover:text-white transition-colors">인플루언서</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">광고주</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">회사</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">회사소개</a></li>
                <li><a href="#" className="hover:text-white transition-colors">채용</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">지원</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">도움말</a></li>
                <li><a href="#" className="hover:text-white transition-colors">문의하기</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">정책</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">이용약관</a></li>
                <li><a href="#" className="hover:text-white transition-colors">개인정보처리방침</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; 2024 itda. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}