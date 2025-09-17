'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Instagram, 
  Users, 
  Heart,
  LogOut,
  Settings,
  Edit,
  Save,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  Camera,
  Video,
  MapPin,
  Hash
} from 'lucide-react'

interface InfluencerData {
  id: string
  user_id: string
  name: string
  instagram_handle: string
  category: string
  bio: string
  followers_count: number
  engagement_rate: number
  is_active: boolean
  media_urls?: string[]
  location?: string
}

export default function InfluencerDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [influencer, setInfluencer] = useState<InfluencerData | null>(null)
  const [similarInfluencers, setSimilarInfluencers] = useState<InfluencerData[]>([])
  const [editing, setEditing] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [completionScore, setCompletionScore] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    instagram_handle: '',
    category: '',
    bio: '',
    followers_count: 0,
    location: ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    calculateCompletion()
    if (influencer?.followers_count) {
      fetchSimilarInfluencers()
    }
  }, [influencer])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/influencer/login')
        return
      }

      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        router.push('/influencer/onboarding')
        return
      }

      setInfluencer(data)
      setFormData({
        name: data.name || '',
        instagram_handle: data.instagram_handle || '',
        category: data.category || '',
        bio: data.bio || '',
        followers_count: data.followers_count || 0,
        location: data.location || ''
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSimilarInfluencers = async () => {
    if (!influencer) return
    
    const min = influencer.followers_count * 0.5
    const max = influencer.followers_count * 1.5
    
    const { data } = await supabase
      .from('influencers')
      .select('*')
      .gte('followers_count', min)
      .lte('followers_count', max)
      .neq('id', influencer.id)
      .limit(6)
    
    if (data) {
      setSimilarInfluencers(data)
    }
  }

  const calculateCompletion = () => {
    if (!influencer) return
    
    let score = 0
    const fields = [
      { value: influencer.name, weight: 15 },
      { value: influencer.instagram_handle, weight: 20 },
      { value: influencer.category, weight: 15 },
      { value: influencer.bio, weight: 15 },
      { value: influencer.followers_count > 0, weight: 10 },
      { value: influencer.location, weight: 10 },
      { value: influencer.media_urls && influencer.media_urls.length > 0, weight: 15 }
    ]
    
    fields.forEach(field => {
      if (field.value) score += field.weight
    })
    
    setCompletionScore(score)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      const isUnder10MB = file.size <= 10 * 1024 * 1024
      return (isImage || isVideo) && isUnder10MB
    })
    
    if (validFiles.length !== files.length) {
      setError('일부 파일이 조건에 맞지 않습니다. (이미지/동영상, 10MB 이하)')
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5))
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      if (!influencer) return
      
      const { error: updateError } = await supabase
        .from('influencers')
        .update({
          name: formData.name,
          instagram_handle: formData.instagram_handle.replace('@', ''),
          category: formData.category,
          bio: formData.bio,
          followers_count: formData.followers_count,
          location: formData.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', influencer.id)
      
      if (updateError) throw updateError
      
      setSuccess('프로필이 성공적으로 업데이트되었습니다.')
      setEditing(false)
      await checkUser()
    } catch (error: any) {
      console.error('Save error:', error)
      setError('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/influencer/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!influencer) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-green-600">itda</div>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600">인플루언서</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{influencer.name}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="profile">프로필 완성하기</TabsTrigger>
            <TabsTrigger value="discover">다른 인플루언서</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* 프로필 완성도 */}
            <Card>
              <CardHeader>
                <CardTitle>프로필 완성도</CardTitle>
                <CardDescription>
                  완성된 프로필은 브랜드에게 더 많은 관심을 받습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Progress value={completionScore} className="flex-1" />
                    <span className="text-sm font-medium w-12 text-right">{completionScore}%</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { label: '이름', value: influencer.name },
                      { label: '인스타그램', value: influencer.instagram_handle },
                      { label: '카테고리', value: influencer.category },
                      { label: '소개', value: influencer.bio },
                      { label: '팔로워', value: influencer.followers_count > 0 },
                      { label: '지역', value: influencer.location },
                      { label: '미디어', value: influencer.media_urls?.length > 0 }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        {item.value ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={item.value ? 'text-green-600' : 'text-gray-500'}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 프로필 편집 */}
            {editing ? (
              <Card>
                <CardHeader>
                  <CardTitle>프로필 편집</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">이름</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="instagram">인스타그램</Label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input
                          id="instagram"
                          value={formData.instagram_handle}
                          onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>카테고리</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fashion">패션</SelectItem>
                          <SelectItem value="beauty">뷰티</SelectItem>
                          <SelectItem value="food">푸드</SelectItem>
                          <SelectItem value="travel">여행</SelectItem>
                          <SelectItem value="lifestyle">라이프스타일</SelectItem>
                          <SelectItem value="fitness">피트니스</SelectItem>
                          <SelectItem value="tech">테크</SelectItem>
                          <SelectItem value="parenting">육아</SelectItem>
                          <SelectItem value="pet">반려동물</SelectItem>
                          <SelectItem value="other">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">활동 지역</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input
                          id="location"
                          placeholder="서울"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="followers">팔로워 수</Label>
                      <Input
                        id="followers"
                        type="number"
                        value={formData.followers_count}
                        onChange={(e) => setFormData({...formData, followers_count: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">소개</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="브랜드에게 어필할 수 있는 소개"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>어필 미디어 (최대 5개)</Label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="media-upload"
                      />
                      <label
                        htmlFor="media-upload"
                        className="flex flex-col items-center justify-center cursor-pointer"
                      >
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">클릭하여 업로드</p>
                        <p className="text-xs text-gray-500">이미지/동영상 (최대 10MB)</p>
                      </label>
                    </div>
                    
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              {file.type.startsWith('image/') ? (
                                <Camera className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Video className="h-4 w-4 text-gray-500" />
                              )}
                              <span className="text-sm truncate max-w-xs">{file.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                      {success}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false)
                        setSelectedFiles([])
                        setError(null)
                        setSuccess(null)
                      }}
                    >
                      취소
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? '저장 중...' : '저장'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* 프로필 미리보기 (광고주가 보는 뷰) */
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>프로필 미리보기</CardTitle>
                      <CardDescription>광고주에게 보여지는 프로필입니다</CardDescription>
                    </div>
                    <Button onClick={() => setEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      편집
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* 헤더 섹션 */}
                    <div className="flex items-start gap-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                        <Instagram className="h-10 w-10 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold">{influencer.name || '이름 미설정'}</h2>
                        <p className="text-green-600 font-medium">@{influencer.instagram_handle || 'username'}</p>
                        <div className="flex items-center gap-4 mt-2">
                          {influencer.category && (
                            <Badge variant="secondary">{influencer.category}</Badge>
                          )}
                          {influencer.location && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {influencer.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 통계 섹션 */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {influencer.followers_count.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">팔로워</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {influencer.engagement_rate || 0}%
                        </p>
                        <p className="text-sm text-gray-500">참여율</p>
                      </div>
                    </div>

                    {/* 소개 섹션 */}
                    {influencer.bio && (
                      <div>
                        <h3 className="font-semibold mb-2">소개</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{influencer.bio}</p>
                      </div>
                    )}

                    {/* 미디어 섹션 (placeholder) */}
                    <div>
                      <h3 className="font-semibold mb-2">포트폴리오</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <Camera className="h-6 w-6 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>비슷한 인플루언서 둘러보기</CardTitle>
                <CardDescription>
                  나와 비슷한 팔로워 규모의 인플루언서들을 확인해보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                {similarInfluencers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {similarInfluencers.map((inf) => (
                      <Card key={inf.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <Instagram className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{inf.name}</h4>
                              <p className="text-sm text-green-600">@{inf.instagram_handle}</p>
                              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                <span>{inf.followers_count.toLocaleString()} 팔로워</span>
                                {inf.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {inf.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    비슷한 규모의 인플루언서가 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}