'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AITextImprover } from '@/components/ui/ai-text-improver';
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
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Send, Loader2, Calendar, DollarSign, FileText } from 'lucide-react'

export default function NewCampaignPage() {
  const [loading, setLoading] = useState(false)
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
  const supabase = createClient()

  const categories = ['전체', '패션', '뷰티', '음식', '여행', '피트니스', '테크', '라이프스타일', '육아', '기타']

  const handleSubmit = async (status: 'draft' | 'active') => {
    setLoading(true)
    try {
      // 현재 사용자의 브랜드 ID 가져오기
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!brand) {
        // 브랜드 프로필이 없으면 생성 페이지로
        alert('먼저 브랜드 프로필을 작성해주세요')
        router.push('/advertiser/profile')
        return
      }

      // 캠페인 생성
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          brand_id: brand.id,
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          budget_min: parseInt(formData.budget_min) || 0,
          budget_max: parseInt(formData.budget_max) || 0,
          category: formData.category === '전체' ? null : formData.category,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          status: status
        })
        .select()

      if (error) throw error

      if (data) {
        alert(status === 'draft' ? '캠페인이 임시저장되었습니다' : '캠페인이 게시되었습니다')
        router.push('/advertiser/campaigns')
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('캠페인 생성 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 오늘 날짜를 YYYY-MM-DD 형식으로
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/advertiser/campaigns')}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">새 캠페인 만들기</h1>
              <p className="text-xs text-gray-500">인플루언서를 모집할 캠페인을 작성하세요</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {/* 기본 정보 */}
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
                  placeholder="예: 여름 신제품 SNS 홍보 캠페인"
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

              {/* 캠페인 설명 입력 부분 */}
<div>
  <Label htmlFor="description">캠페인 설명 *</Label>
  <Textarea
    id="description"
    value={formData.description}
    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    placeholder="캠페인 설명을 입력하세요"
    rows={4}
    required
  />
  {/* AI 버튼 추가 - 카테고리도 함께 전달 */}
  <div className="mt-2">
    <AITextImprover 
      text={formData.description}
      category={formData.category}  // 선택한 카테고리 전달
      onImproved={(improved) => setFormData({ ...formData, description: improved })}
    />
  </div>
</div>
            </CardContent>
          </Card>

          {/* 예산 및 일정 */}
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
                    placeholder="100000"
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
                    placeholder="500000"
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
                    min={today}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">종료일</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date || today}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 버튼 영역 */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleSubmit('draft')}
              disabled={loading || !formData.title || !formData.description}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              임시저장
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleSubmit('active')}
              disabled={loading || !formData.title || !formData.description}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              캠페인 게시
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push('/advertiser/campaigns')}
            disabled={loading}
          >
            취소
          </Button>
        </div>
      </main>
    </div>
  )
}