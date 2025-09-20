'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Bell, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Loader2,
  CheckCheck,
  Users,
  Eye
} from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  related_id: string
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (!error) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
    }
  }

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_application':
        return <Users className="h-5 w-5 text-blue-500" />
      case 'application_viewed':
        return <Eye className="h-5 w-5 text-purple-500" />
      case 'application_approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'application_rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'new_message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const formatTime = (date: string) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffMs = now.getTime() - notificationDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    return notificationDate.toLocaleDateString('ko-KR')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">알림</h1>
                <p className="text-xs text-gray-500">새로운 소식을 확인하세요</p>
              </div>
            </div>
            {notifications.some(n => !n.is_read) && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                모두 읽음
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">알림이 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all ${
                  !notification.is_read ? 'bg-green-50/50 border-green-200' : ''
                }`}
                onClick={() => {
                  if (!notification.is_read) markAsRead(notification.id)
                  // 관련 페이지로 이동
                  if (notification.type === 'application_approved' && notification.related_id) {
                    router.push(`/influencer/campaigns/${notification.related_id}`)
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 pt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <Badge className="bg-green-500 text-white text-xs ml-2">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}