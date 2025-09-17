-- 샘플 인플루언서 데이터 삽입
INSERT INTO public.influencers (name, instagram_handle, profile_image, bio, category_id, followers_count, location, email, is_verified) 
VALUES 
  ('김민지', 'minji_fashion', 'https://ui-avatars.com/api/?name=김민지&background=FF6B6B&color=fff', 
   '패션 인플루언서 | 일상룩 | 협업문의 DM', 
   (SELECT id FROM categories WHERE slug = 'fashion'), 
   52000, '서울', 'minji@example.com', true),
   
  ('이수현', 'soohyun_beauty', 'https://ui-avatars.com/api/?name=이수현&background=4ECDC4&color=fff',
   '뷰티 크리에이터 ✨ 메이크업 튜토리얼', 
   (SELECT id FROM categories WHERE slug = 'beauty'), 
   128000, '서울', 'soohyun@example.com', true),
   
  ('박준호', 'junho_food', 'https://ui-avatars.com/api/?name=박준호&background=95E1D3&color=fff',
   '맛집 탐방 | 푸드 리뷰어 🍔', 
   (SELECT id FROM categories WHERE slug = 'food'), 
   89000, '부산', 'junho@example.com', true),
   
  ('정하늘', 'haneul_travel', 'https://ui-avatars.com/api/?name=정하늘&background=F38181&color=fff',
   '세계여행 | 여행 팁 공유 ✈️', 
   (SELECT id FROM categories WHERE slug = 'travel'), 
   234000, '제주', 'haneul@example.com', true),
   
  ('김태양', 'taeyang_fitness', 'https://ui-avatars.com/api/?name=김태양&background=AA96DA&color=fff',
   '헬스 트레이너 | 운동 루틴 공유 💪', 
   (SELECT id FROM categories WHERE slug = 'fitness'), 
   167000, '서울', 'taeyang@example.com', false),
   
  ('이서연', 'seoyeon_lifestyle', 'https://ui-avatars.com/api/?name=이서연&background=FCBAD3&color=fff',
   '라이프스타일 | 인테리어 | 일상', 
   (SELECT id FROM categories WHERE slug = 'lifestyle'), 
   445000, '서울', 'seoyeon@example.com', true),
   
  ('최민수', 'minsu_tech', 'https://ui-avatars.com/api/?name=최민수&background=A8D8EA&color=fff',
   '테크 리뷰어 | 가젯 소개 📱', 
   (SELECT id FROM categories WHERE slug = 'tech'), 
   93000, '판교', 'minsu@example.com', false),
   
  ('박지은', 'jieun_gaming', 'https://ui-avatars.com/api/?name=박지은&background=FFFFD2&color=333',
   '게임 스트리머 | e스포츠 🎮', 
   (SELECT id FROM categories WHERE slug = 'gaming'), 
   321000, '서울', 'jieun@example.com', true);

-- 샘플 인플루언서 통계 데이터
INSERT INTO public.influencer_stats (influencer_id, avg_likes, avg_comments, engagement_rate, posts_per_month)
SELECT 
  id,
  FLOOR(followers_count * 0.05 + RANDOM() * followers_count * 0.03),
  FLOOR(followers_count * 0.01 + RANDOM() * followers_count * 0.005),
  3.5 + RANDOM() * 4.5,
  15 + FLOOR(RANDOM() * 15)
FROM public.influencers;