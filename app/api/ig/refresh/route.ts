import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { handle, influencerId } = await request.json()
  
  try {
    // 환경변수 확인
    const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
    const BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID  // 수정!
    
    if (!ACCESS_TOKEN || !BUSINESS_ACCOUNT_ID) {
      throw new Error('Instagram API 환경변수가 설정되지 않았습니다')
    }
    
    // Business Discovery API 호출
    const url = `https://graph.facebook.com/v18.0/${BUSINESS_ACCOUNT_ID}?fields=business_discovery.username(${handle}){username,name,biography,profile_picture_url,followers_count,media_count,media{comments_count,like_count}}&access_token=${ACCESS_TOKEN}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.business_discovery) {
      const profile = data.business_discovery
      
      // Supabase 업데이트
      const supabase = createClient()
      await supabase
        .from('influencers')
        .update({
          name: profile.name || handle,
          bio: profile.biography || '',
          profile_image: profile.profile_picture_url || null,
          followers_count: profile.followers_count || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', influencerId)
      
      return NextResponse.json({ 
        success: true,
        metrics: {
          name: profile.name,
          followers_count: profile.followers_count,
          engagement_rate: 0  // 계산 로직 추가 필요
        }
      })
    }
    
    throw new Error('Instagram 데이터를 가져올 수 없습니다')
  } catch (error: any) {
    console.error('Instagram sync error:', error)
    return NextResponse.json({ 
      error: error.message || 'Instagram 동기화 실패' 
    }, { status: 500 })
  }
}