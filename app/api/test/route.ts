// app/api/ig/test/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'API is working',
    token: process.env.INSTAGRAM_ACCESS_TOKEN ? 'Set' : 'Not set',
    businessId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || 'Not set'
  })
}