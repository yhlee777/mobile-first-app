import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 실제 Instagram API 대신 시뮬레이션
// 실제 구현시에는 Instagram Graph API 사용
export async function POST(request: Request) {
  try {
    const { influencerId, instagramHandle } = await request.json()
    const supabase = createClient()

    // 시뮬레이션 데이터 (실제로는 Instagram API 호출)
    const simulatedData = generateSimulatedMetrics(instagramHandle)

    // instagram_metrics 테이블 업데이트
    const { error: metricsError } = await supabase
      .from('instagram_metrics')
      .upsert({
        influencer_id: influencerId,
        followers_count: simulatedData.followers,
        following_count: simulatedData.following,
        posts_count: simulatedData.posts,
        engagement_rate: simulatedData.engagementRate,
        avg_likes: simulatedData.avgLikes,
        avg_comments: simulatedData.avgComments,
        last_updated: new Date().toISOString()
      })

    if (metricsError) throw metricsError

    // influencers 테이블도 업데이트
    const { error: influencerError } = await supabase
      .from('influencers')
      .update({
        followers_count: simulatedData.followers,
        engagement_rate: simulatedData.engagementRate,
        updated_at: new Date().toISOString()
      })
      .eq('id', influencerId)

    if (influencerError) throw influencerError

    return NextResponse.json({ 
      success: true, 
      data: simulatedData 
    })
  } catch (error) {
    console.error('Instagram sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync Instagram data' },
      { status: 500 }
    )
  }
}

function generateSimulatedMetrics(handle: string) {
  // 핸들 기반으로 일관된 데이터 생성
  const seed = handle.length + handle.charCodeAt(0)
  const baseFollowers = 10000 + (seed * 1234) % 490000
  const engagementBase = 2 + (seed % 8)
  
  return {
    followers: baseFollowers,
    following: Math.floor(baseFollowers * 0.3),
    posts: 100 + (seed % 400),
    engagementRate: Number((engagementBase + Math.random() * 2).toFixed(1)),
    avgLikes: Math.floor(baseFollowers * (engagementBase / 100)),
    avgComments: Math.floor(baseFollowers * (engagementBase / 200))
  }
}