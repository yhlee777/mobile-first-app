import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const IG_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
const IG_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID

export async function POST(request: NextRequest) {
  const supabase = createClient()
  
  // 인증 확인
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { handle, influencerId } = body

  if (!handle || !influencerId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    // 새로운 데이터 가져오기
    const freshData = await fetchInstagramData(handle)
    
    // 인플루언서 테이블 업데이트
    const { error: updateError } = await supabase
      .from('influencers')
      .update({
        followers_count: freshData.metrics.followers_count,
        engagement_rate: freshData.metrics.engagement_rate,
        is_verified: freshData.metrics.is_verified,
        updated_at: new Date().toISOString()
      })
      .eq('id', influencerId)

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    // 캐시 테이블이 있다면 업데이트 (선택사항)
    // upsert 사용 시 conflictColumn 지정 필요 없음 - primary key 기준으로 작동
    const { error: cacheError } = await supabase
      .from('instagram_cache')
      .upsert({
        influencer_id: influencerId,
        instagram_handle: handle,
        metrics: freshData.metrics,
        posts: freshData.posts,
        updated_at: new Date().toISOString()
      })

    if (cacheError) {
      console.log('Cache update skipped:', cacheError.message)
      // 캐시 테이블이 없어도 계속 진행
    }

    return NextResponse.json(freshData)
  } catch (error) {
    console.error('Error refreshing Instagram data:', error)
    return NextResponse.json({ error: 'Failed to refresh data' }, { status: 500 })
  }
}

async function fetchInstagramData(handle: string) {
  // Instagram API 토큰이 없으면 더미 데이터 반환
  if (!IG_ACCESS_TOKEN || !IG_BUSINESS_ACCOUNT_ID) {
    console.warn('Instagram API credentials not configured, returning mock data')
    return getMockData(handle)
  }

  const baseUrl = 'https://graph.facebook.com/v18.0'
  
  try {
    // Instagram Business Discovery API 사용
    const discoveryUrl = `${baseUrl}/${IG_BUSINESS_ACCOUNT_ID}`
    const params = new URLSearchParams({
      fields: `business_discovery.username(${handle}){
        username,
        website,
        name,
        ig_id,
        id,
        profile_picture_url,
        biography,
        follows_count,
        followers_count,
        media_count,
        is_verified,
        is_verified_badge,
        media{
          id,
          caption,
          like_count,
          comments_count,
          timestamp,
          username,
          media_type,
          media_url,
          permalink,
          thumbnail_url,
          is_shared_to_feed
        }
      }`,
      access_token: IG_ACCESS_TOKEN
    })

    const response = await fetch(`${discoveryUrl}?${params}`)
    
    if (!response.ok) {
      console.error('Instagram API error:', response.status, response.statusText)
      return getMockData(handle)
    }

    const data = await response.json()
    
    if (!data.business_discovery) {
      return getMockData(handle)
    }

    const discovery = data.business_discovery
    const media = discovery.media?.data || []

    // 최근 게시물 12개로 제한
    const recentPosts = media.slice(0, 12)
    
    // 참여율 계산 - 타입 안정성 보장
    let avgEngagementRate: number = 0
    
    if (discovery.followers_count > 0 && recentPosts.length > 0) {
      const totalEngagements = recentPosts.reduce((sum: number, post: any) => {
        return sum + (post.like_count || 0) + (post.comments_count || 0)
      }, 0)
      avgEngagementRate = parseFloat(((totalEngagements / recentPosts.length) / discovery.followers_count * 100).toFixed(2))
    }

    // 평균 좋아요/댓글 계산
    const avgLikes = recentPosts.length > 0
      ? Math.round(recentPosts.reduce((sum: number, post: any) => sum + (post.like_count || 0), 0) / recentPosts.length)
      : 0
      
    const avgComments = recentPosts.length > 0
      ? Math.round(recentPosts.reduce((sum: number, post: any) => sum + (post.comments_count || 0), 0) / recentPosts.length)
      : 0

    return {
      metrics: {
        username: discovery.username,
        name: discovery.name || discovery.username,
        bio: discovery.biography || '',
        profile_picture_url: discovery.profile_picture_url || '',
        followers_count: discovery.followers_count || 0,
        following_count: discovery.follows_count || 0,
        posts_count: discovery.media_count || 0,
        engagement_rate: avgEngagementRate,
        avg_likes_per_post: avgLikes,
        avg_comments_per_post: avgComments,
        is_verified: discovery.is_verified || discovery.is_verified_badge || false,
        total_posts: discovery.media_count || 0
      },
      posts: recentPosts.map((post: any) => ({
        id: post.id,
        caption: post.caption || '',
        likes: post.like_count || 0,
        comments: post.comments_count || 0,
        timestamp: post.timestamp,
        media_type: post.media_type,
        media_url: post.media_url || post.thumbnail_url,
        permalink: post.permalink,
        engagement_rate: discovery.followers_count > 0 
          ? parseFloat((((post.like_count || 0) + (post.comments_count || 0)) / discovery.followers_count * 100).toFixed(2))
          : 0
      }))
    }
  } catch (error) {
    console.error('Error fetching Instagram data:', error)
    return getMockData(handle)
  }
}

// 목 데이터 생성 함수
function getMockData(handle: string) {
  // 핸들에 따라 다른 더미 데이터 생성
  const seed = handle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (min: number, max: number) => {
    const rand = Math.sin(seed) * 10000
    return Math.floor((rand - Math.floor(rand)) * (max - min + 1)) + min
  }

  const followers = random(5000, 500000)
  const totalPosts = random(50, 2000)
  const avgLikes = Math.floor(followers * (random(2, 8) / 100))
  const avgComments = Math.floor(avgLikes * (random(5, 15) / 100))
  const engagementRate = parseFloat(((avgLikes + avgComments) / followers * 100).toFixed(2))

  // 샘플 포스트 생성
  const posts = Array.from({ length: 12 }, (_, i) => {
    const postLikes = avgLikes + random(-avgLikes * 0.5, avgLikes * 0.5)
    const postComments = avgComments + random(-avgComments * 0.5, avgComments * 0.5)
    
    return {
      id: `mock_post_${i + 1}`,
      caption: getSampleCaption(i),
      likes: Math.max(0, Math.floor(postLikes)),
      comments: Math.max(0, Math.floor(postComments)),
      timestamp: new Date(Date.now() - i * 86400000 * random(1, 7)).toISOString(),
      media_type: 'IMAGE',
      media_url: getSampleImage(i),
      permalink: `https://instagram.com/p/mock_${i + 1}`,
      engagement_rate: parseFloat((((postLikes + postComments) / followers) * 100).toFixed(2))
    }
  })

  return {
    metrics: {
      username: handle,
      name: handle.charAt(0).toUpperCase() + handle.slice(1),
      bio: `안녕하세요! ${handle}입니다. 일상과 특별한 순간들을 공유합니다 ✨`,
      profile_picture_url: `https://i.pravatar.cc/150?u=${handle}`,
      followers_count: followers,
      following_count: random(100, 2000),
      posts_count: totalPosts,
      engagement_rate: engagementRate,
      avg_likes_per_post: avgLikes,
      avg_comments_per_post: avgComments,
      is_verified: followers > 100000 && random(0, 100) > 70,
      total_posts: totalPosts
    },
    posts
  }
}

function getSampleCaption(index: number): string {
  const captions = [
    "오늘도 좋은 하루 보내세요 🌟 #일상 #데일리",
    "새로운 시작, 새로운 도전 💪 #동기부여 #화이팅",
    "맛있는 저녁 시간 🍽️ #맛스타그램 #먹스타그램",
    "여행은 언제나 설레요 ✈️ #여행스타그램 #travel",
    "운동 완료! 오늘도 뿌듯해요 🏃‍♀️ #운동스타그램 #헬스",
    "카페에서 여유로운 시간 ☕ #카페스타그램 #일상",
    "오늘의 OOTD 👗 #패션스타그램 #데일리룩",
    "주말 나들이 🌳 #주말 #힐링",
    "새로운 제품 리뷰 📦 #리뷰 #추천템",
    "요리 도전! 맛있게 됐어요 👨‍🍳 #요리스타그램 #홈쿡",
    "독서 시간 📚 #북스타그램 #독서",
    "일몰이 너무 예뻐요 🌅 #sunset #감성"
  ]
  return captions[index % captions.length]
}

function getSampleImage(index: number): string {
  const images = [
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1512310604669-443f26c35f52?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=800&fit=crop'
  ]
  return images[index % images.length]
}