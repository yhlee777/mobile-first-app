import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { handle, influencerId } = await request.json()
    
    if (!handle || !influencerId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      )
    }

    const token = process.env.INSTAGRAM_ACCESS_TOKEN!
    const igBusinessId = '17841476342964177'
    
    const url = `https://graph.facebook.com/v18.0/${igBusinessId}`
    const params = new URLSearchParams({
      fields: `business_discovery.username(${handle}){
        username,
        followers_count,
        media_count,
        profile_picture_url,
        media.limit(12){
          comments_count,
          like_count
        }
      }`,
      access_token: token
    })
    
    const response = await fetch(`${url}?${params}`)
    const data = await response.json()
    
    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || 'Instagram API 오류' },
        { status: 400 }
      )
    }
    
    const profile = data.business_discovery
    
    if (!profile) {
      return NextResponse.json(
        { error: '프로필 정보를 가져올 수 없습니다' },
        { status: 404 }
      )
    }
    
    // 참여율 계산
    let engagementRate = 0
    if (profile.media?.data && profile.media.data.length > 0 && profile.followers_count > 0) {
      const totalEngagement = profile.media.data.reduce((sum: number, post: any) => {
        return sum + (post.like_count || 0) + (post.comments_count || 0)
      }, 0)
      const avgEngagement = totalEngagement / profile.media.data.length
      engagementRate = parseFloat(((avgEngagement / profile.followers_count) * 100).toFixed(2))
    }
    
    // Supabase 업데이트
    const supabase = createClient()
    
    const { error: updateError } = await supabase
      .from('influencers')
      .update({
        followers_count: profile.followers_count,
        engagement_rate: engagementRate,
        profile_image: profile.profile_picture_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', influencerId)
    
    if (updateError) {
      console.error('Supabase update error:', updateError)
      return NextResponse.json(
        { error: '데이터베이스 업데이트 실패' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      metrics: {
        followers_count: profile.followers_count,
        engagement_rate: engagementRate,
        profile_picture_url: profile.profile_picture_url
      }
    })
    
  } catch (error) {
    console.error('Refresh API Error:', error)
    return NextResponse.json(
      { error: '프로필 갱신 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}