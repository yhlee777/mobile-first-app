'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestNotificationPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const supabase = createClient()

  const createTestNotification = async () => {
    setLoading(true)
    setResult(null)
    try {
      // 현재 로그인한 사용자 정보
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setResult({ error: '로그인이 필요합니다' })
        return
      }

      console.log('Current user:', user.id)

      // 알림 생성
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'application_approved',
          title: '🎉 테스트 알림!',
          message: '알림이 정상 작동합니다!',
          is_read: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error:', error)
        setResult({ error: error.message })
      } else {
        console.log('Success:', data)
        setResult({ success: true, data })
      }
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const checkNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    console.log('내 알림 목록:', data)
    setResult({ notifications: data })
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>알림 시스템 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={createTestNotification}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? '생성 중...' : '테스트 알림 생성'}
            </Button>
            
            <Button 
              onClick={checkNotifications}
              variant="outline"
            >
              내 알림 확인
            </Button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-2">
            <p>👉 이 페이지에서 알림 생성을 테스트할 수 있습니다</p>
            <p>👉 생성 후 헤더의 알림 벨을 확인하세요</p>
            <p>👉 /notifications 페이지로 가서 확인할 수도 있습니다</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}