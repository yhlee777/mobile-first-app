-- 인플루언서 시드 데이터 생성
-- 먼저 Auth 사용자 생성 후 실행

-- 인플루언서 데이터 삽입
INSERT INTO influencers (user_id, instagram_handle, name, bio, category, location, followers_count, engagement_rate, profile_image, is_verified, is_active) VALUES
-- 1. 패션 인플루언서
('user-id-1', 'fashion_style_kr', '김스타일', '매일 새로운 패션 아이템과 코디를 소개합니다. 합리적인 가격의 데일리룩 추천!', '패션', '서울', 125000, 5.8, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop', true, true),

-- 2. 뷰티 인플루언서
('user-id-2', 'beauty_secrets_daily', '이뷰티', '피부 타입별 맞춤 화장품 추천과 메이크업 튜토리얼. K-뷰티 전문가', '뷰티', '서울', 89000, 7.2, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop', true, true),

-- 3. 음식 인플루언서
('user-id-3', 'seoul_foodie', '서울푸디', '서울 맛집 탐방 전문. 숨은 맛집부터 핫플레이스까지 솔직한 리뷰', '음식', '서울', 156000, 6.5, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop', true, true),

-- 4. 여행 인플루언서
('user-id-4', 'travel_korea_now', '박트래블', '국내 여행 전문가. 숨은 여행지와 가성비 숙소 추천', '여행', '제주', 203000, 5.2, 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop', false, true),

-- 5. 피트니스 인플루언서
('user-id-5', 'fitness_daily_kr', '최피트', '홈트레이닝과 헬스장 운동법 공유. 다이어트와 근육 증가 팁', '피트니스', '서울', 67000, 8.1, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', true, true),

-- 6. 테크 인플루언서
('user-id-6', 'tech_reviewer_kr', '김테크', 'IT 제품 리뷰와 신제품 소식. 가성비 전자제품 추천', '테크', '경기', 94000, 4.8, 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&fit=crop', false, true),

-- 7. 라이프스타일 인플루언서
('user-id-7', 'minimal_life_kr', '민라이프', '미니멀 라이프와 제로웨이스트. 지속가능한 일상 공유', '라이프스타일', '서울', 78000, 6.9, 'https://images.unsplash.com/photo-1483389127117-b6a2102724ae?w=400&h=400&fit=crop', true, true),

-- 8. 육아 인플루언서
('user-id-8', 'mom_daily_diary', '엄마일기', '육아 꿀팁과 아이템 추천. 워킹맘의 일상 브이로그', '육아', '경기', 112000, 7.5, 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&h=400&fit=crop', false, true),

-- 9. 펫 인플루언서
('user-id-9', 'pet_love_daily', '펫러버', '강아지와 고양이 케어 팁. 펫용품 리뷰와 동물병원 정보', '기타', '부산', 134000, 8.3, 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=400&fit=crop', true, true),

-- 10. 요리 인플루언서
('user-id-10', 'home_cooking_pro', '홈쿠킹', '초보도 따라하기 쉬운 집밥 레시피. 에어프라이어 요리 전문', '음식', '대구', 87000, 6.7, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', false, true);

-- 포트폴리오 URL 업데이트 (JSON 배열 형태)
UPDATE influencers SET portfolio_urls = '[
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b",
  "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7"
]'::jsonb WHERE instagram_handle = 'fashion_style_kr';

UPDATE influencers SET portfolio_urls = '[
  "https://images.unsplash.com/photo-1512496015851-a90fb38ba796",
  "https://images.unsplash.com/photo-1519699047748-de8e457a634e",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937"
]'::jsonb WHERE instagram_handle = 'beauty_secrets_daily';

UPDATE influencers SET portfolio_urls = '[
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1"
]'::jsonb WHERE instagram_handle = 'seoul_foodie';

-- 나머지 인플루언서들도 동일한 방식으로 포트폴리오 추가