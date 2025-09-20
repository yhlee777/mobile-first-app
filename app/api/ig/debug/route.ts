import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  const businessId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '17841476342964177'
  
  // 1. 토큰 형식 확인
  const tokenInfo = {
    exists: !!token,
    length: token?.length,
    startsWithEAA: token?.startsWith('EAA'),
    first20: token?.substring(0, 20),
    last10: token?.substring(token.length - 10),
    hasLineBreak: token?.includes('\n'),
    hasSpace: token?.includes(' '),
    businessId: businessId
  }
  
  // 2. 토큰 유효성 검사
  let tokenValidation = null
  if (token) {
    try {
      const debugUrl = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`
      const debugRes = await fetch(debugUrl)
      tokenValidation = await debugRes.json()
    } catch (e) {
      tokenValidation = { error: String(e) }
    }
  }
  
  // 3. 간단한 API 호출 테스트
  let apiTest = null
  if (token) {
    try {
      const testUrl = `https://graph.instagram.com/v18.0/${businessId}?fields=username&access_token=${token}`
      const testRes = await fetch(testUrl)
      apiTest = {
        status: testRes.status,
        data: await testRes.json()
      }
    } catch (e) {
      apiTest = { error: String(e) }
    }
  }
  
  return NextResponse.json({
    tokenInfo,
    tokenValidation,
    apiTest,
    advice: getAdvice(tokenInfo, tokenValidation)
  })
}

function getAdvice(tokenInfo: any, validation: any) {
  const advice = []
  
  if (!tokenInfo.exists) {
    advice.push("❌ 토큰이 환경변수에 없습니다")
  }
  if (tokenInfo.hasLineBreak) {
    advice.push("⚠️ 토큰에 줄바꿈이 있습니다. 제거하세요")
  }
  if (tokenInfo.hasSpace) {
    advice.push("⚠️ 토큰에 공백이 있습니다. 제거하세요")
  }
  if (!tokenInfo.startsWithEAA) {
    advice.push("⚠️ 토큰이 'EAA'로 시작하지 않습니다")
  }
  if (validation?.data?.type === 'USER') {
    advice.push("❌ User Token입니다. Page Token이 필요합니다!")
  }
  if (validation?.data?.is_valid === false) {
    advice.push("❌ 토큰이 만료되었거나 무효합니다")
  }
  
  return advice.length > 0 ? advice : ["✅ 토큰 형식은 정상입니다"]
}