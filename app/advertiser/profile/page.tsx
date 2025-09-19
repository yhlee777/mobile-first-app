'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Store, Loader2, X, Plus } from 'lucide-react'

interface BrandProfile {
  id: string
  name: string
  description?: string
  website?: string
  portfolio_urls?: string[]
}

export default function AdvertiserProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<BrandProfile | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    portfolio_urls: [] as string[]
  })
  const [newImageUrl, setNewImageUrl] = useState('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('brands')
        .select('id, name, description, website, portfolio_urls')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // 브랜드가 없는 경우 (404 에러)
        if (error.code === 'PGRST116') {
          console.log('브랜드 프로필이 없습니다. 새로 생성할 수 있습니다.')
        } else {
          console.error('Error loading profile:', error)
        }
      }

      if (data) {
        setProfile(data)
        setFormData({
          name: data.name || '',
          description: data.description || '',
          website: data.website || '',
          portfolio_urls: data.portfolio_urls || []
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 필수 필드 검증
    if (!formData.name.trim()) {
      alert('브랜드명은 필수입니다')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      if (profile) {
        // 업데이트
        const { error } = await supabase
          .from('brands')
          .update({
            name: formData.name,
            description: formData.description || null,
            website: formData.website || null,
            portfolio_urls: formData.portfolio_urls,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)

        if (error) throw error
        alert('프로필이 업데이트되었습니다!')
      } else {
        // 새로 생성
        const { data, error } = await supabase
          .from('brands')
          .insert({
            user_id: user.id,
            name: formData.name,
            description: formData.description || null,
            website: formData.website || null,
            portfolio_urls: formData.portfolio_urls
          })
          .select()
          .single()

        if (error) throw error
        
        if (data) {
          setProfile(data)
          alert('브랜드 프로필이 생성되었습니다!')
        }
      }
      
      router.push('/advertiser')
    } catch (error: any) {
      console.error('Error saving profile:', error)
      alert(`저장 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const addImage = () => {
    if (newImageUrl && formData.portfolio_urls.length < 6) {
      setFormData({
        ...formData,
        portfolio_urls: [...formData.portfolio_urls, newImageUrl]
      })
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      portfolio_urls: formData.portfolio_urls.filter((_, i) => i !== index)
    })
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
              onClick={() => router.push('/advertiser')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">브랜드 프로필 관리</h1>
              <p className="text-xs text-gray-500">브랜드 정보를 입력해주세요</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">브랜드명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 나이키, 스타벅스"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">브랜드 소개</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="브랜드 스토리, 주요 제품, 타겟 고객 등을 소개해주세요"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="website">웹사이트 (선택)</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>브랜드 이미지 (선택)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {formData.portfolio_urls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Brand ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {formData.portfolio_urls.length < 6 && (
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="이미지 URL 입력"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addImage()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addImage}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                최대 6개까지 추가 가능합니다
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={saving || !formData.name}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {profile ? '수정하기' : '생성하기'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/advertiser')}
            >
              취소
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}