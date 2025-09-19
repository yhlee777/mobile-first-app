import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { handle, influencerId } = await request.json()
  
  try {
    const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
    const BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
    
    if (!ACCESS_TOKEN || !BUSINESS_ACCOUNT_ID) {
      console.error('Missing Instagram API credentials')
      // API 없으면 수동 입력 안내
      return NextResponse.json({ 
        success: false,
        message: '프로필 편집에서 정보를 직접 입력해주세요'
      })
    }
    
    // Business Discovery API 호출 - media 필드 추가
    const url = `https://graph.facebook.com/v18.0/${BUSINESS_ACCOUNT_ID}?fields=business_discovery.username(${handle}){username,name,biography,profile_picture_url,followers_count,media_count,media.limit(25){comments_count,like_count}}&access_token=${ACCESS_TOKEN}`
    
    console.log('Fetching Instagram data for:', handle)
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!data.business_discovery) {
      console.error('No business discovery data:', data)
      return NextResponse.json({ 
        success: false,
        message: '비즈니스/크리에이터 계정이 아니거나 찾을 수 없습니다'
      })
    }
    
    const profile = data.business_discovery
    
    // 참여율 계산 (최근 게시물 기준)
    let engagement_rate = 0
    if (profile.media && profile.media.data && profile.followers_count > 0) {
      const posts = profile.media.data
      let totalEngagement = 0
      let validPosts = 0
      
      posts.forEach((post: any) => {
        if (post.like_count !== undefined) {
          totalEngagement += (post.like_count || 0) + (post.comments_count || 0)
          validPosts++
        }
      })
      
      if (validPosts > 0) {
        const avgEngagement = totalEngagement / validPosts
        engagement_rate = parseFloat(((avgEngagement / profile.followers_count) * 100).toFixed(2))
      }
      
      console.log('Engagement calculation:', {
        posts: validPosts,
        totalEngagement,
        followers: profile.followers_count,
        rate: engagement_rate
      })
    }
    
    // Supabase 업데이트
    const supabase = createClient()
    const updateData = {
      name: profile.name || handle,
      bio: profile.biography || '',
      profile_image: profile.profile_picture_url || null,
      followers_count: profile.followers_count || 0,
      engagement_rate: engagement_rate, // 계산된 참여율
      updated_at: new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('influencers')
      .update(updateData)
      .eq('id', influencerId)
    
    if (error) {
      console.error('Supabase update error:', error)
      throw error
    }
    
    return NextResponse.json({ 
      success: true,
      metrics: {
        ...updateData,
        message: `팔로워: ${profile.followers_count}, 참여율: ${engagement_rate}%`
      }
    })
    
  } catch (error: any) {
    console.error('Instagram sync error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Instagram 동기화 실패' 
    }, { status: 500 })
  }
}