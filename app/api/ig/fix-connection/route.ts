import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN!
  const pageId = '748722021662486'
  
  const steps = []
  
  // Step 1: Page의 Instagram Business Account 확인
  try {
    const pageUrl = `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${token}`
    const pageRes = await fetch(pageUrl)
    const pageData = await pageRes.json()
    
    steps.push({
      step: '1. Page의 Instagram 연결 확인',
      data: pageData,
      hasInstagram: !!pageData.instagram_business_account
    })
    
    if (pageData.instagram_business_account?.id) {
      // Step 2: Instagram Business Account 직접 접근
      const igId = pageData.instagram_business_account.id
      const igUrl = `https://graph.facebook.com/v18.0/${igId}?fields=id,username,name,followers_count&access_token=${token}`
      const igRes = await fetch(igUrl)
      const igData = await igRes.json()
      
      steps.push({
        step: '2. Instagram Account 정보 (Facebook API)',
        data: igData
      })
      
      // Step 3: Instagram Graph API로 시도
      const igGraphUrl = `https://graph.instagram.com/v18.0/${igId}?fields=username&access_token=${token}`
      const igGraphRes = await fetch(igGraphUrl)
      const igGraphData = await igGraphRes.json()
      
      steps.push({
        step: '3. Instagram Graph API 테스트',
        status: igGraphRes.status,
        data: igGraphData
      })
      
      // Step 4: Business Discovery 테스트
      const bdUrl = `https://graph.instagram.com/v18.0/${igId}?fields=business_discovery.username(cristiano){username,followers_count}&access_token=${token}`
      const bdRes = await fetch(bdUrl)
      const bdData = await bdRes.json()
      
      steps.push({
        step: '4. Business Discovery 테스트',
        status: bdRes.status,
        data: bdData
      })
    }
  } catch (e) {
    steps.push({ error: String(e) })
  }
  
  // 해결 방법 제안
  const solution = getSolution(steps)
  
  return NextResponse.json({ 
    steps, 
    solution,
    instructions: getInstructions()
  })
}

function getSolution(steps: any[]) {
  if (!steps[0]?.hasInstagram) {
    return "❌ Instagram Business Account가 연결되지 않았습니다"
  }
  if (steps[2]?.data?.error?.code === 190) {
    return "❌ Instagram API 접근 권한 문제입니다"
  }
  if (steps[3]?.data?.business_discovery) {
    return "✅ Business Discovery가 작동합니다!"
  }
  return "⚠️ 알 수 없는 문제입니다"
}

function getInstructions() {
  return {
    manual_fix: [
      "1. Facebook Business Manager로 이동",
      "2. 비즈니스 설정 > Instagram 계정",
      "3. Instagram 계정 추가 또는 재연결",
      "4. 페이지와 Instagram 연결 확인"
    ],
    token_regeneration: [
      "1. https://developers.facebook.com/tools/explorer/",
      "2. 앱 선택: itda",
      "3. User or Page: Page Access Token 선택",
      "4. 페이지 선택 후 Generate Access Token",
      "5. 새 토큰을 .env.local에 업데이트"
    ]
  }
}