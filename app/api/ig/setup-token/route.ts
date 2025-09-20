import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const appId = '733416399507507' // 귀하의 앱 ID
    const appSecret = process.env.FACEBOOK_APP_SECRET // .env.local에 추가 필요
    
    // Step 1: User Token을 장기 토큰으로 변환
    const longLivedUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${userToken}`
    
    const longLivedRes = await fetch(longLivedUrl)
    const longLivedData = await longLivedRes.json()
    
    if (longLivedData.error) {
      return NextResponse.json({ 
        step: 'Long-lived token failed',
        error: longLivedData.error 
      })
    }
    
    const longLivedUserToken = longLivedData.access_token
    
    // Step 2: 장기 User Token으로 Page Token 가져오기
    const pageTokenUrl = `https://graph.facebook.com/v18.0/748722021662486?fields=access_token&access_token=${longLivedUserToken}`
    const pageTokenRes = await fetch(pageTokenUrl)
    const pageTokenData = await pageTokenRes.json()
    
    if (pageTokenData.error) {
      return NextResponse.json({ 
        step: 'Page token failed',
        error: pageTokenData.error 
      })
    }
    
    const longLivedPageToken = pageTokenData.access_token
    
    // Step 3: 테스트
    const testUrl = `https://graph.instagram.com/v18.0/17841476342964177?fields=business_discovery.username(cristiano){username,followers_count}&access_token=${longLivedPageToken}`
    const testRes = await fetch(testUrl)
    const testData = await testRes.json()
    
    return NextResponse.json({
      success: true,
      longLivedPageToken: longLivedPageToken,
      testResult: testData,
      instruction: '아래 longLivedPageToken을 복사해서 .env.local의 INSTAGRAM_ACCESS_TOKEN에 넣으세요'
    })
    
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}