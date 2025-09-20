import Anthropic from '@anthropic-ai/sdk';

export async function improveTextWithAI(text: string, category?: string): Promise<string> {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    // 카테고리별 프롬프트 설정
    const categoryPrompts: { [key: string]: string } = {
      '패션': '패션/스타일 트렌드를 강조하고, 스타일링 팁이나 룩북 제작 등을 언급하세요.',
      '뷰티': '제품의 성분, 효과를 강조하고 비포/애프터 콘텐츠 제작을 언급하세요.',
      '음식': '맛 리뷰, 먹방, 레시피 콘텐츠 등 푸드 콘텐츠 특성을 반영하세요.',
      '여행': '여행지의 매력, 체험, 여행 팁 공유 등을 포함하세요.',
      '피트니스': '운동 루틴, 건강한 라이프스타일, 동기부여를 강조하세요.',
      '테크': '제품 리뷰, 언박싱, 기능 설명 등 테크 콘텐츠 특성을 반영하세요.',
      '육아': '부모들의 고민 해결, 실용적인 팁, 안전성을 강조하세요.',
      '기타': '일반적인 캠페인 설명으로 작성하세요.'
    };

    const categoryGuide = categoryPrompts[category || '기타'] || categoryPrompts['기타'];

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `당신은 ${category || '인플루언서'} 마케팅 전문가입니다.
        
다음 캠페인 설명을 개선해주세요:
- 카테고리: ${category || '일반'}
- ${categoryGuide}
- 200-300자로 간결하게
- 인플루언서가 참여하고 싶어하도록 매력적으로

원본 텍스트: ${text}`
      }],
      temperature: 0.7,
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : text;
  } catch (error) {
    console.error('Claude API 오류:', error);
    return text;
  }
}