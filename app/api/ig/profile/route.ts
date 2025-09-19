import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')
  
  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 })
  }

  try {
    // Instagram Business Discovery API
    const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
    const BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
    
    if (!ACCESS_TOKEN || !BUSINESS_ACCOUNT_ID) {
      return NextResponse.json({ 
        error: 'Instagram API 설정이 필요합니다.' 
      }, { status: 500 })
    }
    
    // Business Discovery 엔드포인트
    const url = `https://graph.facebook.com/v18.0/${BUSINESS_ACCOUNT_ID}?fields=business_discovery.username(${username}){username,name,biography,profile_picture_url,followers_count,media_count,media{comments_count,like_count}}&access_token=${ACCESS_TOKEN}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.error) {
      console.error('Facebook API Error:', data.error)
      return NextResponse.json({ 
        error: data.error.message || 'API 오류가 발생했습니다.' 
      }, { status: 400 })
    }
    
    if (data.business_discovery) {
      const profile = data.business_discovery
      
      // 참여율 계산 (최근 게시물 평균)
      let engagement_rate: number = 0
      if (profile.media && profile.media.data && profile.media.data.length > 0) {
        const recentPosts = profile.media.data.slice(0, 10)
        const totalEngagement = recentPosts.reduce((sum: number, post: any) => 
          sum + (post.like_count || 0) + (post.comments_count || 0), 0
        )
        
        if (profile.followers_count > 0 && recentPosts.length > 0) {
          const rawRate = (totalEngagement / recentPosts.length) / profile.followers_count * 100
          engagement_rate = Math.round(rawRate * 100) / 100  // 소수점 2자리까지
        }
      }
      
      return NextResponse.json({
        success: true,
        data: {
          username: profile.username,
          name: profile.name || profile.username,
          bio: profile.biography || '',
          profile_picture: profile.profile_picture_url || null,
          followers_count: profile.followers_count || 0,
          media_count: profile.media_count || 0,
          engagement_rate: engagement_rate
        }
      })
    }
    
    return NextResponse.json({ 
      error: '계정 정보를 찾을 수 없습니다. 비즈니스/크리에이터 계정인지 확인해주세요.' 
    }, { status: 404 })
    
  } catch (error: any) {
    console.error('Instagram API Error:', error)
    return NextResponse.json({ 
      error: error.message || 'Instagram API 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}