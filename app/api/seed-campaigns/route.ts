import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createClient()

  try {
    // 현재 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: '로그인이 필요합니다',
        details: userError 
      }, { status: 401 })
    }

    console.log('Current user:', user.id)

    // 현재 사용자의 brand 확인 또는 생성
    let { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('user_id', user.id)
      .single()

    console.log('Existing brand:', brand)
    console.log('Brand error:', brandError)

    if (!brand) {
      // 브랜드가 없으면 생성
      const { data: newBrand, error: createError } = await supabase
        .from('brands')
        .insert({
          user_id: user.id,
          name: '테스트 브랜드',
          company_name: '(주)테스트컴퍼니',
          description: '캠페인 테스트를 위한 브랜드입니다',
          contact_email: 'test@example.com',
          contact_phone: '02-1234-5678'
        })
        .select()
        .single()

      if (createError) {
        console.error('Brand creation error:', createError)
        return NextResponse.json({ 
          error: '브랜드 생성 실패',
          details: createError.message 
        }, { status: 500 })
      }

      brand = newBrand
      console.log('New brand created:', brand)
    }

    // 오늘 날짜 기준으로 날짜 설정
    const today = new Date()
    const nextMonth = new Date(today)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const twoMonthsLater = new Date(today)
    twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2)

    // 샘플 캠페인 데이터 (날짜를 현재 기준으로 수정)
    const campaigns = [
      {
        brand_id: brand.id,
        title: '여름 신상품 SNS 홍보 캠페인',
        description: `안녕하세요! 저희 브랜드의 신상품을 홍보해주실 인플루언서를 찾습니다.
        
주요 제품:
- 여름 원피스 컬렉션
- 비치웨어 라인
- 썸머 액세서리

원하는 콘텐츠:
- 제품 착용 사진 3장 이상
- 스토리 2회 이상 업로드`,
        requirements: `- 패션/라이프스타일 카테고리
- 팔로워 1만명 이상
- 20-30대 여성 팔로워 비율 높은 계정`,
        budget_min: 300000,
        budget_max: 800000,
        category: '패션',
        start_date: today.toISOString().split('T')[0],
        end_date: nextMonth.toISOString().split('T')[0],
        status: 'active'
      },
      {
        brand_id: brand.id,
        title: '신제품 화장품 리뷰 캠페인',
        description: `뷰티 인플루언서님들을 모집합니다!

제공 혜택:
- 스킨케어 풀 세트 제공
- 추가 협찬금 지급

필요 콘텐츠:
- 언박싱 영상/릴스
- 2주 사용 후 리뷰`,
        requirements: `- 뷰티 전문 인플루언서
- 스킨케어 리뷰 경험`,
        budget_min: 500000,
        budget_max: 1500000,
        category: '뷰티',
        start_date: today.toISOString().split('T')[0],
        end_date: twoMonthsLater.toISOString().split('T')[0],
        status: 'active'
      },
      {
        brand_id: brand.id,
        title: '맛집 레스토랑 방문 리뷰',
        description: `신규 오픈 레스토랑 홍보

제공 사항:
- 2인 식사권
- 촬영 시간 배려
- 활동비 지급`,
        requirements: `- 음식/맛집 카테고리
- 사진 퀄리티 중요`,
        budget_min: 200000,
        budget_max: 500000,
        category: '음식',
        start_date: today.toISOString().split('T')[0],
        end_date: nextMonth.toISOString().split('T')[0],
        status: 'active'
      },
      {
        brand_id: brand.id,
        title: '홈트레이닝 용품 체험단',
        description: `운동용품 체험단 모집!

제공 제품:
- 요가매트
- 폼롤러
- 저항밴드 세트`,
        requirements: `- 피트니스 콘텐츠
- 꾸준한 업로드 가능`,
        budget_min: 300000,
        budget_max: 600000,
        category: '피트니스',
        start_date: today.toISOString().split('T')[0],
        end_date: twoMonthsLater.toISOString().split('T')[0],
        status: 'active'
      },
      {
        brand_id: brand.id,
        title: '친환경 라이프스타일 캠페인',
        description: `지속가능한 라이프스타일 브랜드

제공 혜택:
- 월별 신제품 제공
- 활동비 지급`,
        requirements: `- 라이프스타일 카테고리
- 장기 협업 가능`,
        budget_min: 400000,
        budget_max: 1000000,
        category: '라이프스타일',
        start_date: today.toISOString().split('T')[0],
        end_date: twoMonthsLater.toISOString().split('T')[0],
        status: 'active'
      }
    ]

    console.log('Campaigns to insert:', campaigns)

    // 캠페인 생성
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaigns)
      .select()

    if (error) {
      console.error('Campaign insert error:', error)
      return NextResponse.json({ 
        error: '캠페인 생성 실패',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `${data.length}개의 캠페인이 생성되었습니다`,
      campaigns: data 
    })

  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        error: '캠페인 생성 중 오류가 발생했습니다',
        details: error.message 
      },
      { status: 500 }
    )
  }
}