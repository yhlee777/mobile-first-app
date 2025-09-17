'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Heart, MessageSquare, Video } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface InstagramMetricsProps {
  influencerId: string
  instagramHandle: string
}

export function InstagramMetrics({ influencerId, instagramHandle }: InstagramMetricsProps) {
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    fetchMetrics()
  }, [influencerId])

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ig/metrics?handle=${instagramHandle}&influencerId=${influencerId}`)
      if (!response.ok) throw new Error('Failed to fetch metrics')
      const data = await response.json()
      setMetrics(data.metrics)
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshMetrics = async () => {
    setRefreshing(true)
    try {
      const response = await fetch(`/api/ig/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: instagramHandle, influencerId })
      })
      if (!response.ok) throw new Error('Failed to refresh metrics')
      const data = await response.json()
      setMetrics(data.metrics)
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error refreshing metrics:', error)
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>인스타그램 통계</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshMetrics}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </CardHeader>
        <CardContent>
          {metrics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{metrics.total_posts || 0}</p>
                <p className="text-sm text-gray-600">전체 게시물</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{formatNumber(metrics.avg_likes_per_post || 0)}</p>
                <p className="text-sm text-gray-600">평균 좋아요</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{formatNumber(metrics.avg_comments_per_post || 0)}</p>
                <p className="text-sm text-gray-600">평균 댓글</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{(metrics.engagement_rate || 0).toFixed(2)}%</p>
                <p className="text-sm text-gray-600">참여율</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">데이터를 불러올 수 없습니다.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>최근 게시물</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {posts.slice(0, 9).map((post: any, index: number) => (
                <div key={post.id || index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                  {post.media_url ? (
                    <img 
                      src={post.media_url} 
                      alt={post.caption?.slice(0, 50) || 'Instagram post'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Video className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="flex items-center gap-4 justify-center">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {formatNumber(post.like_count || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {formatNumber(post.comments_count || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {post.media_type === 'VIDEO' && (
                    <Video className="absolute top-2 right-2 h-5 w-5 text-white drop-shadow-lg" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">게시물을 불러올 수 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}