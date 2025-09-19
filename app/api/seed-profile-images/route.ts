import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createClient()
  
  // 카테고리별 프로필 이미지 URL 세트
  const profileImages = {
    '패션': [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&h=400&fit=crop'
    ],
    '뷰티': [
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1521117660421-ce701ed42966?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1514626585111-9aa86183ac98?w=400&h=400&fit=crop'
    ],
    '음식': [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop'
    ],
    '여행': [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1496440737103-cd596325d314?w=400&h=400&fit=crop'
    ],
    '피트니스': [
      'https://images.unsplash.com/photo-1540206395-68808572332f?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=400&h=400&fit=crop'
    ],
    '테크': [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&fit=crop'
    ],
    '라이프스타일': [
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=400&fit=crop'
    ],
    '육아': [
      'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1561525140-c2a4cc68e4bd?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1477332552946-cfb384aeaf1c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
    ],
    '기타': [
      'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
    ]
  }

  // 포트폴리오 이미지 세트 (카테고리별)
  const portfolioImages = {
    '패션': [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop'
    ],
    '뷰티': [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=800&fit=crop'
    ],
    '음식': [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=800&fit=crop'
    ],
    '여행': [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=600&h=800&fit=crop'
    ],
    '피트니스': [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=800&fit=crop'
    ],
    '기타': [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1494253109108-2e30c049369b?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop'
    ]
  }

  try {
    // 모든 인플루언서 가져오기
    const { data: influencers, error: fetchError } = await supabase
      .from('influencers')
      .select('id, category')

    if (fetchError) {
      console.error('Error fetching influencers:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!influencers || influencers.length === 0) {
      return NextResponse.json({ message: '업데이트할 인플루언서가 없습니다' })
    }

    let updateCount = 0

    // 각 인플루언서에 랜덤 프로필 이미지 할당
    for (const influencer of influencers) {
      const category = influencer.category || '기타'
      const categoryImages = profileImages[category as keyof typeof profileImages] || profileImages['기타']
      const categoryPortfolios = portfolioImages[category as keyof typeof portfolioImages] || portfolioImages['기타']
      
      // 랜덤 프로필 이미지 선택
      const randomProfile = categoryImages[Math.floor(Math.random() * categoryImages.length)]
      
      // 랜덤 포트폴리오 이미지 3-5개 선택
      const numPortfolios = Math.floor(Math.random() * 3) + 3
      const selectedPortfolios = [...categoryPortfolios]
        .sort(() => 0.5 - Math.random())
        .slice(0, numPortfolios)

      const { error: updateError } = await supabase
        .from('influencers')
        .update({ 
          profile_image: randomProfile,
          portfolio_urls: selectedPortfolios
        })
        .eq('id', influencer.id)

      if (updateError) {
        console.error(`Error updating influencer ${influencer.id}:`, updateError)
      } else {
        updateCount++
      }
    }

    return NextResponse.json({ 
      message: `${updateCount}명의 인플루언서 프로필 이미지가 업데이트되었습니다!`,
      total: influencers.length,
      updated: updateCount
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ 
      error: '프로필 이미지 업데이트 중 오류가 발생했습니다' 
    }, { status: 500 })
  }
}

// GET 메서드도 추가 (테스트용)
export async function GET() {
  return NextResponse.json({ 
    message: 'POST 요청을 사용하세요' 
  })
}