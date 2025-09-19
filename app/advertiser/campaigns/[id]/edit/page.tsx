'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2, FileText, DollarSign } from 'lucide-react'

export default function EditCampaignPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    budget_min: '',
    budget_max: '',
    category: '전체',
    start_date: '',
    end_date: ''
  })

  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const categories = ['전체', '패션', '뷰티', '음식', '여행', '피트니스', '테크', '라이프스타일', '육아', '기타']

  useEffect(() => {
    if (params.id) {
      loadCampaign(params.id as string)
    }
  }, [params.id])

  const loadCampaign = async (campaignId: string) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          requirements: data.requirements || '',
          budget_min: data.budget_min?.toString() || '',
          budget_max: data.budget_max?.toString() || '',
          category: data.category || '전체',
          start_date: data.start_date || '',
          end_date: data.end_date || ''
        })
      }
    } catch (error) {
      console.error('Error loading campaign:', error)
      alert('캠페인을 불러오는 중 오류가 발생했습니다')
      router.push('/advertiser/campaigns')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          budget_min: parseInt(formData.budget_min) || 0,
          budget_max: parseInt(formData.budget_max) || 0,
          category: formData.category === '전체' ? null : formData.category,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (error) throw error

      alert('캠페인이 수정되었습니다')
      router.push('/advertiser/campaigns')
    } catch (error) {
      console.error('Error updating campaign:', error)
      alert('캠페인 수정 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
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
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/advertiser/campaigns')}
              disabled={saving}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">캠페인 수정</h1>
              <p className="text-xs text-gray-500">캠페인 정보를 수정하세요</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                캠페인 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">캠페인 제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">카테고리</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">캠페인 설명 *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="requirements">인플루언서 요구사항</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                예산 및 일정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="budget_min">최소 예산 (원)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="budget_max">최대 예산 (원)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start_date">시작일</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">종료일</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={saving || !formData.title || !formData.description}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  수정하기
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/advertiser/campaigns')}
              disabled={saving}
            >
              취소
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}