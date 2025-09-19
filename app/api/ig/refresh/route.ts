import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { handle, influencerId } = await request.json()
  
  if (!handle || !influencerId) {
    return NextResponse.json({ 
      error: 'handle과 influencerId가 필요합니다.' 
    }, { status: 400 })
  }
  
  try {
    // Business Discovery로 프로필 정보 가져오기
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ig/profile?username=${handle}`
    const response = await fetch(apiUrl)
    const result = await response.json()
    
    if (result.success) {
      const { data } = result
      
      // Supabase 업데이트
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('influencers')
        .update({
          name: data.name,
          bio: data.bio,
          profile_image: data.profile_picture,
          followers_count: data.followers_count,
          engagement_rate: data.engagement_rate,
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', influencerId)
      
      if (updateError) {
        console.error('Supabase update error:', updateError)
        return NextResponse.json({ 
          error: 'DB 업데이트 실패' 
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        metrics: data 
      })
    }
    
    return NextResponse.json({ 
      error: result.error || '프로필 정보를 가져올 수 없습니다.' 
    }, { status: 400 })
    
  } catch (error: any) {
    console.error('Instagram refresh error:', error)
    return NextResponse.json({ 
      error: error.message || 'Instagram 데이터 동기화 실패' 
    }, { status: 500 })
  }
}