// 1. lib/ai-assistant.ts - AI 어시스턴트 클래스
import Anthropic from '@anthropic-ai/sdk';

class AIAssistant {
  private anthropic: Anthropic;
  private model = 'claude-3-opus-20240229'; // 또는 'claude-3-sonnet-20240229'

  constructor() {
    // API 키는 서버사이드에서만 사용
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  // 자동 답장 생성
  async suggestReply(message: string, context?: string) {
    try {
      const prompt = `
        사용자가 받은 메시지: "${message}"
        ${context ? `대화 맥락: ${context}` : ''}
        
        이 메시지에 대한 3가지 답장 옵션을 제안해주세요.
        각 옵션은 다른 톤으로 작성하세요:
        1. 친근하고 캐주얼한 답장
        2. 정중하고 공식적인 답장
        3. 짧고 간단한 답장
        
        JSON 형식으로 응답하세요:
        {"suggestions": ["답장1", "답장2", "답장3"]}
      `;

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
      });

      const content = response.content[0].text;
      return JSON.parse(content);
    } catch (error) {
      console.error('AI 답장 생성 실패:', error);
      return {
        suggestions: [
          "알겠습니다!",
          "확인했습니다. 감사합니다.",
          "넵!"
        ]
      };
    }
  }

  // 긴 텍스트 요약
  async summarize(longText: string, maxLength: number = 200) {
    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: maxLength,
        messages: [{
          role: 'user',
          content: `다음 텍스트를 ${maxLength}자 이내로 핵심만 요약해주세요:\n\n${longText}`
        }],
        temperature: 0.3,
      });

      return response.content[0].text;
    } catch (error) {
      console.error('요약 실패:', error);
      return longText.substring(0, maxLength) + '...';
    }
  }

  // 이미지 설명 (Claude Vision)
  async describeImage(imageBase64: string) {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229', // Vision 지원 모델
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: '이 이미지를 자세히 설명해주세요. 무엇이 보이나요?',
            },
          ],
        }],
      });

      return response.content[0].text;
    } catch (error) {
      console.error('이미지 설명 실패:', error);
      return '이미지를 분석할 수 없습니다.';
    }
  }

  // 텍스트 개선/교정
  async improveText(text: string, style: 'casual' | 'formal' | 'professional' = 'casual') {
    try {
      const styleGuide = {
        casual: '친근하고 편안한 톤으로',
        formal: '정중하고 격식있는 톤으로',
        professional: '전문적이고 비즈니스적인 톤으로'
      };

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `다음 텍스트를 ${styleGuide[style]} 개선해주세요. 맞춤법과 문법도 교정해주세요:\n\n${text}`
        }],
        temperature: 0.5,
      });

      return response.content[0].text;
    } catch (error) {
      console.error('텍스트 개선 실패:', error);
      return text;
    }
  }

  // 감정 분석
  async analyzeSentiment(text: string) {
    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `다음 텍스트의 감정을 분석하고 JSON으로 응답하세요:
          {"sentiment": "positive|negative|neutral", "confidence": 0.0-1.0, "emotions": ["emotion1", "emotion2"]}
          
          텍스트: ${text}`
        }],
        temperature: 0.2,
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('감정 분석 실패:', error);
      return { sentiment: 'neutral', confidence: 0.5, emotions: [] };
    }
  }
}

// 싱글톤 인스턴스
let assistantInstance: AIAssistant | null = null;

export function getAIAssistant() {
  if (!assistantInstance) {
    assistantInstance = new AIAssistant();
  }
  return assistantInstance;
}

// =================================================================
// 2. pages/api/ai/suggest-reply.ts - API 엔드포인트
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const assistant = getAIAssistant();
    const suggestions = await assistant.suggestReply(message, context);
    
    res.status(200).json(suggestions);
  } catch (error) {
    console.error('API 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// =================================================================
// 3. pages/api/ai/summarize.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, maxLength } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const assistant = getAIAssistant();
    const summary = await assistant.summarize(text, maxLength);
    
    res.status(200).json({ summary });
  } catch (error) {
    console.error('API 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// =================================================================
// 4. pages/api/ai/describe-image.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const assistant = getAIAssistant();
    const description = await assistant.describeImage(imageBase64);
    
    res.status(200).json({ description });
  } catch (error) {
    console.error('API 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// =================================================================
// 5. hooks/useAIAssistant.ts - React Hook (클라이언트용)
import { useState, useCallback } from 'react';

export function useAIAssistant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 답장 제안 받기
  const suggestReply = useCallback(async (message: string, context?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/suggest-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
      });

      if (!response.ok) throw new Error('Failed to get suggestions');
      
      const data = await response.json();
      return data.suggestions;
    } catch (err) {
      setError('답장 제안을 가져올 수 없습니다');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 텍스트 요약
  const summarize = useCallback(async (text: string, maxLength?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, maxLength }),
      });

      if (!response.ok) throw new Error('Failed to summarize');
      
      const data = await response.json();
      return data.summary;
    } catch (err) {
      setError('요약을 생성할 수 없습니다');
      return text.substring(0, 200) + '...';
    } finally {
      setLoading(false);
    }
  }, []);

  // 이미지 설명
  const describeImage = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      // 파일을 base64로 변환
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // data:image/jpeg;base64, 제거
        };
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/ai/describe-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      if (!response.ok) throw new Error('Failed to describe image');
      
      const data = await response.json();
      return data.description;
    } catch (err) {
      setError('이미지를 분석할 수 없습니다');
      return '';
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    suggestReply,
    summarize,
    describeImage,
    loading,
    error,
  };
}

// =================================================================
// 6. components/ChatInput.tsx - 실제 사용 예시
import { useState } from 'react';
import { useAIAssistant } from '@/hooks/useAIAssistant';

export function ChatInput({ onSend }: { onSend: (message: string) => void }) {
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestReply, loading } = useAIAssistant();

  // AI 답장 제안 받기
  const handleGetSuggestions = async () => {
    const receivedMessage = "오늘 저녁에 시간 있어?"; // 예시
    const suggestions = await suggestReply(receivedMessage);
    setSuggestions(suggestions);
    setShowSuggestions(true);
  };

  // 제안 선택
  const handleSelectSuggestion = (suggestion: string) => {
    setMessage(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="chat-input-container">
      {/* AI 제안 버튼 */}
      <button 
        onClick={handleGetSuggestions}
        disabled={loading}
        className="ai-suggest-btn"
      >
        {loading ? '생각 중...' : '✨ AI 답장 제안'}
      </button>

      {/* 제안된 답장들 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-list">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="suggestion-item"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* 메시지 입력 */}
      <div className="input-group">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지 입력..."
          className="message-input"
        />
        <button 
          onClick={() => {
            onSend(message);
            setMessage('');
          }}
          className="send-btn"
        >
          전송
        </button>
      </div>
    </div>
  );
}

// =================================================================
// 7. components/ImageUploader.tsx - 이미지 설명 예시
import { useAIAssistant } from '@/hooks/useAIAssistant';

export function ImageUploader() {
  const [description, setDescription] = useState('');
  const { describeImage, loading } = useAIAssistant();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // AI로 이미지 설명 생성
    const desc = await describeImage(file);
    setDescription(desc);
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={loading}
      />
      
      {loading && <p>AI가 이미지를 분석하고 있습니다...</p>}
      
      {description && (
        <div className="image-description">
          <h3>AI 이미지 설명:</h3>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
}