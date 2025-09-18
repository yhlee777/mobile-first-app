import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()
    
    if (!username) {
      return NextResponse.json(
        { error: '인스타그램 아이디를 입력해주세요' },
        { status: 400 }
      )
    }

    // 환경 변수 확인
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
    
    if (!accessToken || !businessAccountId) {
      return NextResponse.json(
        { 
          error: 'Instagram API 설정이 필요합니다. 환경변수를 확인해주세요.',
          details: 'INSTAGRAM_ACCESS_TOKEN과 INSTAGRAM_BUSINESS_ACCOUNT_ID가 필요합니다.'
        },
        { status: 500 }
      )
    }

    console.log('🔍 Instagram API 호출 시작:', username)

    // Instagram Graph API Business Discovery 엔드포인트
    // username 파라미터에서 @ 제거
    const cleanUsername = username.replace('@', '')
    
    // Business Discovery API를 사용하여 다른 Instagram 계정 정보 조회
    const fields = `business_discovery.username(${cleanUsername}){username,id,followers_count,media_count,media{comments_count,like_count}}`
    
    const url = `https://graph.facebook.com/v18.0/${businessAccountId}?fields=${encodeURIComponent(fields)}&access_token=${accessToken}`
    
    console.log('📡 API URL:', url.replace(accessToken, 'TOKEN_HIDDEN'))
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.error) {
      console.error('❌ Instagram API Error:', data.error)
      
      // 에러 타입에 따른 메시지
      if (data.error.code === 190) {
        return NextResponse.json({
          error: 'Instagram 액세스 토큰이 만료되었습니다. 관리자에게 문의해주세요.',
          is_token_error: true
        }, { status: 401 })
      }
      
      if (data.error.code === 24) {
        return NextResponse.json({
          error: `@${cleanUsername} 계정을 찾을 수 없습니다. Business 또는 Creator 계정인지 확인해주세요.`,
          is_user_error: true
        }, { status: 404 })
      }
      
      return NextResponse.json({
        error: data.error.message || 'Instagram API 오류가 발생했습니다.',
        details: data.error
      }, { status: 500 })
    }
    
    // Business Discovery 데이터 추출
    const businessDiscovery = data.business_discovery
    
    if (!businessDiscovery) {
      return NextResponse.json({
        error: '해당 계정의 정보를 가져올 수 없습니다. Business 계정인지 확인해주세요.',
        is_user_error: true
      }, { status: 404 })
    }
    
    console.log('✅ Instagram 데이터 수신:', {
      username: businessDiscovery.username,
      followers: businessDiscovery.followers_count,
      posts: businessDiscovery.media_count
    })
    
    // 참여율(ER) 계산 - 최근 25개 게시물 기준 (Instagram API 기본 제공)
    let engagementRate = 0
    
    if (businessDiscovery.media && businessDiscovery.media.data) {
      const posts = businessDiscovery.media.data
      const validPosts = posts.filter((post: any) => 
        post.like_count !== undefined && post.comments_count !== undefined
      )
      
      if (validPosts.length > 0 && businessDiscovery.followers_count > 0) {
        const totalEngagement = validPosts.reduce((sum: number, post: any) => {
          return sum + (post.like_count || 0) + (post.comments_count || 0)
        }, 0)
        
        const avgEngagement = totalEngagement / validPosts.length
        engagementRate = parseFloat(((avgEngagement / businessDiscovery.followers_count) * 100).toFixed(2))
        
        console.log('📊 참여율 계산:', {
          posts: validPosts.length,
          avgEngagement: Math.round(avgEngagement),
          engagementRate: engagementRate
        })
      }
    }
    
    // 응답 데이터
    const responseData = {
      success: true,
      data: {
        instagram_id: businessDiscovery.id,
        instagram_username: businessDiscovery.username,
        followers_count: businessDiscovery.followers_count || 0,
        media_count: businessDiscovery.media_count || 0,
        engagement_rate: engagementRate,
        last_synced_at: new Date().toISOString(),
        is_mock: false // 실제 데이터임을 표시
      }
    }
    
    console.log('✅ 응답 데이터:', responseData.data)
    
    return NextResponse.json(responseData)
    
  } catch (error: any) {
    console.error('🔥 Instagram fetch error:', error)
    return NextResponse.json(
      { 
        error: '인스타그램 데이터를 가져오는데 실패했습니다',
        details: error.message 
      },
      { status: 500 }
    )
  }
}