import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const seedInfluencers = [
  {
    instagram_handle: 'fashion_style_kr',
    name: '김스타일',
    bio: '매일 새로운 패션 아이템과 코디를 소개합니다. 합리적인 가격의 데일리룩 추천!',
    category: '패션',
    location: '서울',
    followers_count: 125000,
    engagement_rate: 5.8,
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    is_verified: true,
    portfolio_urls: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',
      'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7'
    ]
  },
  {
    instagram_handle: 'beauty_secrets_daily',
    name: '이뷰티',
    bio: '피부 타입별 맞춤 화장품 추천과 메이크업 튜토리얼. K-뷰티 전문가',
    category: '뷰티',
    location: '서울',
    followers_count: 89000,
    engagement_rate: 7.2,
    profile_image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
    is_verified: true,
    portfolio_urls: [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796',
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e'
    ]
  },
  {
    instagram_handle: 'seoul_foodie',
    name: '서울푸디',
    bio: '서울 맛집 탐방 전문. 숨은 맛집부터 핫플레이스까지 솔직한 리뷰',
    category: '음식',
    location: '서울',
    followers_count: 156000,
    engagement_rate: 6.5,
    profile_image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
    is_verified: true,
    portfolio_urls: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'
    ]
  },
  {
    instagram_handle: 'travel_korea_now',
    name: '박트래블',
    bio: '국내 여행 전문가. 숨은 여행지와 가성비 숙소 추천',
    category: '여행',
    location: '제주',
    followers_count: 203000,
    engagement_rate: 5.2,
    profile_image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop',
    is_verified: false,
    portfolio_urls: [
      'https://images.unsplash.com/photo-1530789253388-582c481c54b0',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1'
    ]
  },
  {
    instagram_handle: 'fitness_daily_kr',
    name: '최피트',
    bio: '홈트레이닝과 헬스장 운동법 공유. 다이어트와 근육 증가 팁',
    category: '피트니스',
    location: '서울',
    followers_count: 67000,
    engagement_rate: 8.1,
    profile_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    is_verified: true,
    portfolio_urls: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e'
    ]
  },
  {
    instagram_handle: 'tech_reviewer_kr',
    name: '김테크',
    bio: 'IT 제품 리뷰와 신제품 소식. 가성비 전자제품 추천',
    category: '테크',
    location: '경기',
    followers_count: 94000,
    engagement_rate: 4.8,
    profile_image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&fit=crop',
    is_verified: false,
    portfolio_urls: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475',
      'https://images.unsplash.com/photo-1496065187959-7f07b8353c55'
    ]
  },
  {
    instagram_handle: 'minimal_life_kr',
    name: '민라이프',
    bio: '미니멀 라이프와 제로웨이스트. 지속가능한 일상 공유',
    category: '라이프스타일',
    location: '서울',
    followers_count: 78000,
    engagement_rate: 6.9,
    profile_image: 'https://images.unsplash.com/photo-1483389127117-b6a2102724ae?w=400&h=400&fit=crop',
    is_verified: true,
    portfolio_urls: [
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e'
    ]
  },
  {
    instagram_handle: 'mom_daily_diary',
    name: '엄마일기',
    bio: '육아 꿀팁과 아이템 추천. 워킹맘의 일상 브이로그',
    category: '육아',
    location: '경기',
    followers_count: 112000,
    engagement_rate: 7.5,
    profile_image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&h=400&fit=crop',
    is_verified: false,
    portfolio_urls: [
      'https://images.unsplash.com/photo-1491013516836-7db643ee125a',
      'https://images.unsplash.com/photo-1476703993599-0035a21b17a9'
    ]
  },
  {
    instagram_handle: 'pet_love_daily',
    name: '펫러버',
    bio: '강아지와 고양이 케어 팁. 펫용품 리뷰와 동물병원 정보',
    category: '기타',
    location: '부산',
    followers_count: 134000,
    engagement_rate: 8.3,
    profile_image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=400&fit=crop',
    is_verified: true,
    portfolio_urls: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b',
      'https://images.unsplash.com/photo-1517849845537-4d257902454a'
    ]
  },
  {
    instagram_handle: 'home_cooking_pro',
    name: '홈쿠킹',
    bio: '초보도 따라하기 쉬운 집밥 레시피. 에어프라이어 요리 전문',
    category: '음식',
    location: '대구',
    followers_count: 87000,
    engagement_rate: 6.7,
    profile_image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    is_verified: false,
    portfolio_urls: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445'
    ]
  }
]

export async function POST() {
  const supabase = createClient()
  
  try {
    // 각 인플루언서마다 Auth 사용자 생성 및 데이터 삽입
    for (const influencer of seedInfluencers) {
      // 1. Auth 사용자 생성
      const email = `${influencer.instagram_handle}@instagram.temp`
      const password = 'password123' // 테스트용 비밀번호
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            instagram_handle: influencer.instagram_handle,
            user_type: 'influencer'
          }
        }
      })
      
      if (authError) {
        console.error('Auth error for', influencer.name, authError)
        continue
      }
      
      if (authData.user) {
        // 2. users 테이블에 삽입
        await supabase.from('users').insert({
          id: authData.user.id,
          user_type: 'influencer',
          email,
          instagram_handle: influencer.instagram_handle
        })
        
        // 3. influencers 테이블에 삽입
        await supabase.from('influencers').insert({
          user_id: authData.user.id,
          ...influencer,
          is_active: true
        })
        
        console.log('Created:', influencer.name)
      }
    }
    
    return NextResponse.json({ message: 'Seed data created successfully' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to create seed data' }, { status: 500 })
  }
}