'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIReplyButtonProps {
  message: string;
  onSelectReply: (reply: string) => void;
}

export function AIReplyButton({ message, onSelectReply }: AIReplyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGetSuggestions = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggestReply',
          data: { message }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.replies) {
          setSuggestions(data.replies);
          setShowSuggestions(true);
        }
      }
    } catch (error) {
      console.error('AI 답장 제안 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGetSuggestions}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            생각 중...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            AI 답장 제안
          </>
        )}
      </Button>

      {showSuggestions && suggestions.length > 0 && (
        <div className="space-y-1 p-3 border rounded-lg bg-gray-50">
          {suggestions.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectReply(reply);
                setShowSuggestions(false);
              }}
              className="block w-full text-left p-2 text-sm hover:bg-white rounded transition"
            >
              {reply}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}