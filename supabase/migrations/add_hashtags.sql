-- 인플루언서 테이블에 해시태그 컬럼 추가
ALTER TABLE public.influencers 
ADD COLUMN hashtags TEXT[] DEFAULT '{}';

-- 브랜드 테이블에도 해시태그 추가 (선택적)
ALTER TABLE public.brands 
ADD COLUMN hashtags TEXT[] DEFAULT '{}';

-- 기존 데이터에 샘플 해시태그 추가 (선택적)
UPDATE public.influencers 
SET hashtags = ARRAY['맛집', '서울맛집', '데이트맛집']
WHERE category = '음식' AND hashtags = '{}';

UPDATE public.influencers 
SET hashtags = ARRAY['패션', '데일리룩', 'OOTD']
WHERE category = '패션' AND hashtags = '{}';