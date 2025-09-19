'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Building,
  ArrowRight,
  Sparkles,
  Clock,
  MessageSquare,
  CheckCircle
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20">
      {/* 기존 스타일 헤더 유지 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#51a66f]">잇다</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/login')}
              className="border-[#51a66f] text-[#51a66f] hover:bg-[#51a66f] hover:text-white"
            >
              로그인
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 메인 히어로 - 심플하지만 기존 스타일 유지 */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 mb-4">
            <Sparkles className="h-4 w-4 text-[#51a66f]" />
            <span className="text-sm font-medium text-gray-700">인플루언서 마케팅 플랫폼</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
            DM 100개, 답장 3개?<br />
            <span className="text-[#51a66f]">이제 그만.</span>
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            공고 하나로 인플루언서 100명 만나기<br />
            5분이면 충분합니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-[#51a66f] hover:bg-[#449960] text-white"
              onClick={() => router.push('/signup?tab=advertiser')}
            >
              <Building className="h-5 w-5 mr-2" />
              광고주로 시작하기
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-[#51a66f] text-[#51a66f] hover:bg-[#51a66f] hover:text-white"
              onClick={() => router.push('/signup?tab=influencer')}
            >
              <Users className="h-5 w-5 mr-2" />
              인플루언서로 시작하기
            </Button>
          </div>
        </div>

        {/* 3단계 프로세스 - 기존 카드 스타일 */}
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[#51a66f] mb-3">1</div>
              <h3 className="font-bold mb-2">공고 등록</h3>
              <p className="text-sm text-gray-600">
                예산과 조건 설정<br />5분이면 완료
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[#51a66f] mb-3">2</div>
              <h3 className="font-bold mb-2">지원자 확인</h3>
              <p className="text-sm text-gray-600">
                인플루언서가<br />먼저 찾아옵니다
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[#51a66f] mb-3">3</div>
              <h3 className="font-bold mb-2">매칭 완료</h3>
              <p className="text-sm text-gray-600">
                선택하고<br />바로 협업 시작
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 핵심 가치 - 아이콘 카드 */}
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
          <Card className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <Clock className="h-8 w-8 text-[#51a66f] mb-3" />
              <h3 className="font-bold mb-2">5분 투자</h3>
              <p className="text-sm text-gray-600">
                캠페인 등록은 단 5분
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-[#51a66f] mb-3" />
              <h3 className="font-bold mb-2">100명 지원</h3>
              <p className="text-sm text-gray-600">
                평균 지원자 수
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <CheckCircle className="h-8 w-8 text-[#51a66f] mb-3" />
              <h3 className="font-bold mb-2">수수료 0원</h3>
              <p className="text-sm text-gray-600">
                평생 무료 서비스
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 사용자 선택 - 기존 스타일 카드 */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer border-2 hover:border-[#51a66f]"
                onClick={() => router.push('/signup?tab=advertiser')}>
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 text-[#51a66f] mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">브랜드/광고주</h3>
              <p className="text-gray-600 mb-4">
                인플루언서를 찾고 있어요
              </p>
              <Button className="bg-[#51a66f] hover:bg-[#449960] w-full">
                공고 등록하기 <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer border-2 hover:border-purple-500"
                onClick={() => router.push('/signup?tab=influencer')}>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">인플루언서</h3>
              <p className="text-gray-600 mb-4">
                브랜드와 협업하고 싶어요
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700 w-full">
                캠페인 보기 <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 기존 스타일 푸터 */}
      <footer className="mt-20 py-8 text-center text-gray-500 text-sm">
        <p>© 2024 잇다. All rights reserved.</p>
      </footer>
    </div>
  )
}