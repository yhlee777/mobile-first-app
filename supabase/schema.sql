-- Supabase 데이터베이스 스키마
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- Users 테이블 (Supabase Auth 확장)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(20) CHECK (user_type IN ('brand', 'influencer')) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 카테고리
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 브랜드 (광고주)
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  name VARCHAR(200) NOT NULL,
  company_name VARCHAR(200),
  description TEXT,
  website VARCHAR(500),
  logo_url VARCHAR(500),
  business_registration VARCHAR(50),
  contact_email VARCHAR(200),
  contact_phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 인플루언서
CREATE TABLE IF NOT EXISTS public.influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  name VARCHAR(200) NOT NULL,
  instagram_handle VARCHAR(100) UNIQUE NOT NULL,
  profile_image VARCHAR(500),
  bio TEXT,
  category_id UUID REFERENCES public.categories(id),
  followers_count INTEGER DEFAULT 0,
  location VARCHAR(100),
  email VARCHAR(200),
  phone VARCHAR(20),
  website VARCHAR(500),
  price_range_min DECIMAL(10, 2),
  price_range_max DECIMAL(10, 2),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 인플루언서 통계
CREATE TABLE IF NOT EXISTS public.influencer_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE UNIQUE,
  avg_likes INTEGER DEFAULT 0,
  avg_comments INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  posts_per_month INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Instagram 캐시
CREATE TABLE IF NOT EXISTS public.instagram_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE UNIQUE,
  instagram_handle VARCHAR(100) NOT NULL,
  metrics JSONB,
  posts JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 메시지
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 알림
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 샘플 카테고리 데이터 삽입
INSERT INTO public.categories (name, slug) VALUES
  ('패션', 'fashion'),
  ('뷰티', 'beauty'),
  ('음식', 'food'),
  ('여행', 'travel'),
  ('피트니스', 'fitness'),
  ('라이프스타일', 'lifestyle'),
  ('테크', 'tech'),
  ('게임', 'gaming'),
  ('음악', 'music'),
  ('예술', 'art')
ON CONFLICT (slug) DO NOTHING;

-- Row Level Security (RLS) 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_stats ENABLE ROW LEVEL SECURITY;

-- RLS 정책들
-- 사용자는 자신의 프로필만 볼 수 있음
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 모든 사용자가 인플루언서 목록을 볼 수 있음
CREATE POLICY "All users can view influencers" ON public.influencers
  FOR SELECT USING (true);

-- 모든 사용자가 브랜드 목록을 볼 수 있음
CREATE POLICY "All users can view brands" ON public.brands
  FOR SELECT USING (true);

-- 사용자는 자신의 메시지만 볼 수 있음
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- 사용자는 자신의 알림만 볼 수 있음
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- 모든 사용자가 인플루언서 통계를 볼 수 있음
CREATE POLICY "All users can view influencer stats" ON public.influencer_stats
  FOR SELECT USING (true);

-- 모든 사용자가 인스타그램 캐시를 볼 수 있음
CREATE POLICY "All users can view instagram cache" ON public.instagram_cache
  FOR SELECT USING (true);

-- 함수와 트리거
-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencers_updated_at BEFORE UPDATE ON public.influencers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_stats_updated_at BEFORE UPDATE ON public.influencer_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instagram_cache_updated_at BEFORE UPDATE ON public.instagram_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_influencers_category ON public.influencers(category_id);
CREATE INDEX idx_influencers_followers ON public.influencers(followers_count DESC);
CREATE INDEX idx_influencers_verified ON public.influencers(is_verified);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);