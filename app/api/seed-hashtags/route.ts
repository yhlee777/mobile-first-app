import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createClient()
  
  // 해시태그 데이터
  const hashtagData = [
    {
      category: '패션',
      hashtags: ['패션', 'OOTD', '데일리룩', '스트릿패션', '패션스타그램']
    },
    {
      category: '뷰티',
      hashtags: ['뷰티', '메이크업', '스킨케어', '뷰티스타그램', '화장품추천']
    },
    {
      category: '음식',
      hashtags: ['맛집', '맛집추천', '먹스타그램', '푸디', '맛집탐방']
    },
    {
      category: '여행',
      hashtags: ['여행', '여행스타그램', '국내여행', '해외여행', '여행추천']
    },
    {
      category: '피트니스',
      hashtags: ['운동', '헬스', '다이어트', '운동스타그램', '홈트']
    },
    {
      category: '테크',
      hashtags: ['테크', 'IT', '가젯', '리뷰', '신제품']
    },
    {
      category: '라이프스타일',
      hashtags: ['일상', '라이프스타일', '일상스타그램', '소통', '데일리']
    },
    {
      category: '육아',
      hashtags: ['육아', '육아스타그램', '맘스타그램', '아기', '육아일기']
    }
  ]

  try {
    // 각 카테고리별로 인플루언서 업데이트
    for (const data of hashtagData) {
      // 해당 카테고리의 인플루언서 찾기
      const { data: influencers, error: fetchError } = await supabase
        .from('influencers')
        .select('id')
        .eq('category', data.category)

      if (fetchError) {
        console.error(`Error fetching ${data.category} influencers:`, fetchError)
        continue
      }

      // 각 인플루언서에 해시태그 추가
      if (influencers && influencers.length > 0) {
        for (const influencer of influencers) {
          // 랜덤하게 3-5개의 해시태그 선택
          const numTags = Math.floor(Math.random() * 3) + 3
          const selectedTags = [...data.hashtags]
            .sort(() => 0.5 - Math.random())
            .slice(0, numTags)

          const { error: updateError } = await supabase
            .from('influencers')
            .update({ hashtags: selectedTags })
            .eq('id', influencer.id)

          if (updateError) {
            console.error(`Error updating influencer ${influencer.id}:`, updateError)
          }
        }
        console.log(`Updated ${influencers.length} influencers in ${data.category}`)
      }
    }

    // 몇 명의 인플루언서에게 추가 해시태그 부여
    const { data: allInfluencers } = await supabase
      .from('influencers')
      .select('id, location, hashtags')

    if (allInfluencers) {
      for (const influencer of allInfluencers) {
        const currentTags = influencer.hashtags || []
        const locationTag = influencer.location ? `${influencer.location}맛집` : null
        
        // 지역 태그 추가 (예: 서울맛집)
        if (locationTag && !currentTags.includes(locationTag)) {
          const updatedTags = [...currentTags, locationTag].slice(0, 7)
          
          await supabase
            .from('influencers')
            .update({ hashtags: updatedTags })
            .eq('id', influencer.id)
        }
      }
    }

    return NextResponse.json({ 
      message: '해시태그가 성공적으로 추가되었습니다!' 
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ 
      error: '해시태그 추가 중 오류가 발생했습니다' 
    }, { status: 500 })
  }
}

// GET 메서드도 추가 (테스트용)
export async function GET() {
  return NextResponse.json({ 
    message: 'POST 요청을 사용하세요' 
  })
}