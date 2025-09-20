import { NextResponse } from 'next/server';
import { improveTextWithAI } from '@/lib/ai/assistant';

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'improveText': {
        // 카테고리도 함께 전달
        const improved = await improveTextWithAI(data.text, data.category);
        return NextResponse.json({ improved });
      }
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json({ error: 'AI 처리 실패' }, { status: 500 });
  }
}