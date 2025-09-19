import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createClient()

  try {
    // 먼저 테스트용 user들을 생성 또는 현재 user 사용
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ 
        error: '먼저 로그인해주세요' 
      }, { status: 401 })
    }

    // 샘플 브랜드 데이터 (모두 같은 user_id 사용)
    const brands = [
      {
        user_id: user.id,
        name: '썸머 패션',
        company_name: '(주)썸머패션코리아',
        description: '트렌디한 여름 패션을 선도하는 브랜드입니다. 20-30대 여성을 타겟으로 감각적인 디자인의 의류를 제공합니다.',
        website: 'https://summerfashion.co.kr',
        contact_email: 'contact@summerfashion.co.kr',
        contact_phone: '02-1234-5678',
        address: '서울시 강남구 테헤란로 123',
        portfolio_urls: [
          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'
        ]
      },
      {
        user_id: user.id,
        name: '글로우 뷰티',
        company_name: '(주)글로우코스메틱',
        description: '자연 유래 성분으로 만든 프리미엄 스킨케어 브랜드. 민감성 피부도 사용 가능한 순한 화장품을 개발합니다.',
        website: 'https://glowbeauty.kr',
        contact_email: 'pr@glowbeauty.kr',
        contact_phone: '02-2345-6789',
        address: '서울시 서초구 서초대로 456',
        portfolio_urls: [
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
          'https://images.unsplash.com/photo-1570194065650-d99fb4b38e39?w=600'
        ]
      },
      {
        user_id: user.id,
        name: '더 다이닝',
        company_name: '(주)더다이닝그룹',
        description: '강남 일대 프리미엄 레스토랑을 운영하는 외식 전문 기업입니다. 이탈리안, 프렌치, 한식 등 다양한 브랜드를 보유하고 있습니다.',
        website: 'https://thedining.kr',
        contact_email: 'marketing@thedining.kr',
        contact_phone: '02-3456-7890',
        address: '서울시 강남구 압구정로 789',
        portfolio_urls: [
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600'
        ]
      },
      {
        user_id: user.id,
        name: '핏니스 프로',
        company_name: '(주)피트니스프로',
        description: '홈트레이닝 전문 브랜드로 요가매트, 덤벨, 밴드 등 다양한 운동 용품을 판매합니다.',
        website: 'https://fitnesspro.co.kr',
        contact_email: 'support@fitnesspro.co.kr',
        contact_phone: '02-4567-8901',
        address: '경기도 성남시 분당구 판교로 321',
        portfolio_urls: [
          'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600'
        ]
      },
      {
        user_id: user.id,
        name: '그린 라이프',
        company_name: '(주)그린라이프',
        description: '친환경 생활용품 전문 브랜드. 플라스틱 프리, 제로웨이스트를 추구하며 지속가능한 제품을 만듭니다.',
        website: 'https://greenlife.eco',
        contact_email: 'hello@greenlife.eco',
        contact_phone: '02-5678-9012',
        address: '서울시 마포구 상암로 654',
        portfolio_urls: [
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600',
          'https://images.unsplash.com/photo-1526893381913-e311045b8064?w=600'
        ]
      }
    ]

    // 기존 브랜드가 있는지 확인
    const { data: existingBrands } = await supabase
      .from('brands')
      .select('name')
      .eq('user_id', user.id)

    if (existingBrands && existingBrands.length > 0) {
      return NextResponse.json({ 
        error: '이미 브랜드가 존재합니다',
        existing: existingBrands
      }, { status: 400 })
    }

    // 브랜드 생성 - 하나씩 생성 (중복 에러 방지)
    const createdBrands = []
    for (const brand of brands) {
      const { data, error } = await supabase
        .from('brands')
        .insert(brand)
        .select()
        .single()

      if (error) {
        console.error(`Error creating brand ${brand.name}:`, error)
        continue // 에러가 나도 다음 브랜드 계속 생성
      }
      
      if (data) {
        createdBrands.push(data)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${createdBrands.length}개의 브랜드가 생성되었습니다`,
      brands: createdBrands 
    })

  } catch (error: any) {
    console.error('Error seeding brands:', error)
    return NextResponse.json(
      { 
        error: '브랜드 생성 중 오류가 발생했습니다',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET - 현재 브랜드 목록 확인
export async function GET() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ 
    total: data?.length || 0,
    brands: data 
  })
}