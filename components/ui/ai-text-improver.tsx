'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface AITextImproverProps {
  text: string;
  category?: string;  // 카테고리 추가
  onImproved: (improvedText: string) => void;
  className?: string;
}

export function AITextImprover({ text, category, onImproved, className }: AITextImproverProps) {
  const [loading, setLoading] = useState(false);

  const handleImprove = async () => {
    if (!text || loading) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'improveText',
          data: { 
            text,
            category  // 카테고리도 전달
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.improved) {
          onImproved(data.improved);
        }
      }
    } catch (error) {
      console.error('AI 텍스트 개선 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleImprove}
      disabled={loading || !text}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          AI가 개선 중...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          AI로 글 다듬기
        </>
      )}
    </Button>
  );
}