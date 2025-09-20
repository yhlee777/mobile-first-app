import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()
    
    if (!username) {
      return NextResponse.json(
        { error: 'Instagram 아이디를 입력해주세요' },
        { status: 400 }
      )
    }
    
    const cleanUsername = username.replace('@', '').toLowerCase()
    
    const token = process.env.INSTAGRAM_ACCESS_TOKEN!
    const igBusinessId = '17841476342964177'
    
    // ✅ is_verified 필드 제거 (Business Discovery에서 지원 안 함)
    const url = `https://graph.facebook.com/v18.0/${igBusinessId}`
    const params = new URLSearchParams({
      fields: `business_discovery.username(${cleanUsername}){
        username,
        name,
        biography,
        followers_count,
        media_count,
        profile_picture_url,
        media.limit(12){
          comments_count,
          like_count,
          media_type,
          media_url,
          permalink,
          timestamp,
          caption
        }
      }`,
      access_token: token
    })
    
    console.log(`Fetching profile for: @${cleanUsername}`)
    
    const response = await fetch(`${url}?${params}`)
    const data = await response.json()
    
    if (data.error) {
      console.error('API Error:', data.error)
      
      if (data.error.code === 24) {
        return NextResponse.json({
          error: '비즈니스/크리에이터 계정만 조회 가능합니다',
          details: '일반 개인 계정은 Business Discovery API로 조회할 수 없습니다.'
        }, { status: 400 })
      }
      
      if (data.error.code === 803 || data.error.message?.includes('does not exist')) {
        return NextResponse.json({
          error: '존재하지 않는 Instagram 계정입니다',
          username: cleanUsername
        }, { status: 404 })
      }
      
      return NextResponse.json({ 
        error: data.error.message || 'Instagram API 오류',
        errorCode: data.error.code
      }, { status: 400 })
    }
    
    const profile = data.business_discovery
    
    if (!profile) {
      return NextResponse.json({ 
        error: '프로필 정보를 가져올 수 없습니다',
        username: cleanUsername
      }, { status: 404 })
    }
    
    // 참여율 계산 (최근 12개 게시물 기준)
    let engagementRate = 0
    if (profile.media?.data && profile.media.data.length > 0 && profile.followers_count > 0) {
      const totalEngagement = profile.media.data.reduce((sum: number, post: any) => {
        return sum + (post.like_count || 0) + (post.comments_count || 0)
      }, 0)
      const avgEngagement = totalEngagement / profile.media.data.length
      engagementRate = parseFloat(((avgEngagement / profile.followers_count) * 100).toFixed(2))
    }
    
    console.log(`✅ Successfully fetched @${profile.username} - ${profile.followers_count} followers`)
    
    return NextResponse.json({
      success: true,
      profile: {
        username: profile.username,
        name: profile.name || profile.username,
        bio: profile.biography || '',
        followers_count: profile.followers_count || 0,
        media_count: profile.media_count || 0,
        profile_picture_url: profile.profile_picture_url || '',
        is_verified: false,  // Business Discovery API에서 지원 안 함
        engagement_rate: engagementRate
      }
    })
    
  } catch (error) {
    console.error('Server Error:', error)
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다',
      details: String(error)
    }, { status: 500 })
  }
}