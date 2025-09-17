import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const IG_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
const IG_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
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
    
    // 캐시 업데이트
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
      console.error('Cache update error:', cacheError)
    }

    // 통계 테이블도 업데이트
    const { error: statsError } = await supabase
      .from('influencer_stats')
      .upsert({
        influencer_id: influencerId,
        avg_likes: freshData.metrics.avg_likes_per_post,
        avg_comments: freshData.metrics.avg_comments_per_post,
        engagement_rate: freshData.metrics.engagement_rate,
        posts_per_month: Math.round(freshData.metrics.total_posts / 12),
        updated_at: new Date().toISOString()
      })

    if (statsError) {
      console.error('Stats update error:', statsError)
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
        media{
          id,
          caption,
          like_count,
          comments_count,
          media_type,
          media_url,
          permalink,
          thumbnail_url,
          timestamp,
          username
        }
      }`,
      access_token: IG_ACCESS_TOKEN
    })

    const response = await fetch(`${discoveryUrl}?${params}`)
    const data = await response.json()

    if (data.error) {
      console.error('Instagram API Error:', data.error)
      return getMockData(handle)
    }

    const businessData = data.business_discovery
    const media = businessData.media?.data || []
    
    const totalLikes = media.reduce((sum: number, post: any) => sum + (post.like_count || 0), 0)
    const totalComments = media.reduce((sum: number, post: any) => sum + (post.comments_count || 0), 0)
    const avgLikes = media.length > 0 ? Math.round(totalLikes / media.length) : 0
    const avgComments = media.length > 0 ? Math.round(totalComments / media.length) : 0
    const engagementRate = businessData.followers_count > 0 
      ? ((totalLikes + totalComments) / (media.length * businessData.followers_count)) * 100 
      : 0

    return {
      metrics: {
        followers_count: businessData.followers_count || 0,
        following_count: businessData.follows_count || 0,
        total_posts: businessData.media_count || 0,
        avg_likes_per_post: avgLikes,
        avg_comments_per_post: avgComments,
        engagement_rate: engagementRate,
        profile_picture_url: businessData.profile_picture_url,
        biography: businessData.biography,
        website: businessData.website
      },
      posts: media.slice(0, 12).map((post: any) => ({
        id: post.id,
        media_type: post.media_type,
        media_url: post.media_url || post.thumbnail_url,
        caption: post.caption,
        like_count: post.like_count || 0,
        comments_count: post.comments_count || 0,
        timestamp: post.timestamp,
        permalink: post.permalink
      }))
    }
  } catch (error) {
    console.error('Instagram API Error:', error)
    return getMockData(handle)
  }
}

function getMockData(handle: string) {
  const mockPosts = Array.from({ length: 9 }, (_, i) => ({
    id: `mock_${i}`,
    media_type: i % 3 === 0 ? 'VIDEO' : 'IMAGE',
    media_url: `https://picsum.photos/400/400?random=${i}`,
    caption: `Sample post ${i + 1} from @${handle}`,
    like_count: Math.floor(Math.random() * 10000) + 1000,
    comments_count: Math.floor(Math.random() * 500) + 50,
    timestamp: new Date(Date.now() - i * 86400000).toISOString(),
    permalink: `https://instagram.com/p/mock_${i}`
  }))

  const totalLikes = mockPosts.reduce((sum, post) => sum + post.like_count, 0)
  const totalComments = mockPosts.reduce((sum, post) => sum + post.comments_count, 0)
  const followersCount = Math.floor(Math.random() * 50000) + 10000

  return {
    metrics: {
      followers_count: followersCount,
      following_count: Math.floor(Math.random() * 1000) + 100,
      total_posts: Math.floor(Math.random() * 500) + 100,
      avg_likes_per_post: Math.round(totalLikes / mockPosts.length),
      avg_comments_per_post: Math.round(totalComments / mockPosts.length),
      engagement_rate: ((totalLikes + totalComments) / (mockPosts.length * followersCount)) * 100,
      profile_picture_url: `https://ui-avatars.com/api/?name=${handle}&background=random`,
      biography: `안녕하세요! ${handle}입니다. 🌟`,
      website: null
    },
    posts: mockPosts
  }
}