import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const handle = searchParams.get('handle')
  const influencerId = searchParams.get('influencerId')

  if (!handle || !influencerId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    // 캐시된 데이터 확인 (instagram_cache 테이블이 있는 경우)
    const { data: cachedData } = await supabase
      .from('instagram_cache')
      .select('*')
      .eq('influencer_id', influencerId)
      .single()

    // 24시간 이내의 캐시가 있으면 반환
    if (cachedData && isDataFresh(cachedData.updated_at)) {
      return NextResponse.json({
        metrics: cachedData.metrics,
        posts: cachedData.posts,
        cached: true
      })
    }

    // 캐시가 없거나 오래된 경우, refresh API 호출
    const response = await fetch(`${request.nextUrl.origin}/api/ig/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify({ handle, influencerId })
    })

    if (!response.ok) {
      throw new Error('Failed to refresh data')
    }

    const freshData = await response.json()
    return NextResponse.json({
      ...freshData,
      cached: false
    })
  } catch (error) {
    console.error('Error fetching Instagram metrics:', error)
    
    // 에러 시 인플루언서 테이블의 기본 데이터 반환
    const { data: influencer } = await supabase
      .from('influencers')
      .select('*')
      .eq('id', influencerId)
      .single()

    if (influencer) {
      return NextResponse.json({
        metrics: {
          username: influencer.instagram_handle,
          name: influencer.name,
          bio: influencer.bio || '',
          profile_picture_url: influencer.profile_image || '',
          followers_count: influencer.followers_count || 0,
          engagement_rate: influencer.engagement_rate || 0,
          is_verified: influencer.is_verified || false
        },
        posts: [],
        cached: true,
        fallback: true
      })
    }

    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}

function isDataFresh(updatedAt: string): boolean {
  const lastUpdate = new Date(updatedAt)
  const now = new Date()
  const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
  return hoursSinceUpdate < 24
}