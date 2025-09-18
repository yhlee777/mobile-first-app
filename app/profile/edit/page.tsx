'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageUpload } from '@/components/ui/image-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  Save, 
  UserCircle,
  Instagram,
  MapPin,
  Plus,
  X,
  CheckCircle,
  Sparkles,
  Loader2,
  Trash2,
  Check,
  RefreshCw
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export default function ProfileEditPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [profileImage, setProfileImage] = useState('')
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('edit')
  const [hasChanges, setHasChanges] = useState(false)
  
  const [formData, setFormData] = useState({
    id: '',
    user_id: '',
    name: '',
    instagram_handle: '',
    category: '',
    bio: '',
    location: '서울',
    followers_count: 0,
    engagement_rate: 0,
    is_verified: false
  })

  // 원본 데이터 저장 (변경사항 체크용)
  const [originalData, setOriginalData] = useState({
    formData: { ...formData },
    profileImage: '',
    portfolioUrls: [] as string[]
  })

  const categories = ['패션', '뷰티', '라이프스타일', '여행', '음식', '피트니스', '테크', '육아', '기타']
  const locations = ['서울', '경기', '부산', '대구', '인천', '광주', '대전', '울산', '제주', '기타']

  const categoryColor = {
    '패션': 'bg-pink-100 text-pink-700',
    '뷰티': 'bg-purple-100 text-purple-700',
    '음식': 'bg-orange-100 text-orange-700',
    '여행': 'bg-blue-100 text-blue-700',
    '피트니스': 'bg-green-100 text-green-700',
    '테크': 'bg-gray-100 text-gray-700',
    '라이프스타일': 'bg-amber-100 text-amber-700',
    '육아': 'bg-yellow-100 text-yellow-700',
    '기타': 'bg-gray-100 text-gray-700'
  }[formData.category] || 'bg-gray-100 text-gray-700'

  // 변경사항 감지
  useEffect(() => {
    const dataChanged = 
      JSON.stringify(formData) !== JSON.stringify(originalData.formData) ||
      profileImage !== originalData.profileImage ||
      JSON.stringify(portfolioUrls) !== JSON.stringify(originalData.portfolioUrls)
    
    setHasChanges(dataChanged)
  }, [formData, profileImage, portfolioUrls, originalData])

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
        .from('influencers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      if (data) {
        const loadedData = {
          id: data.id,
          user_id: data.user_id,
          name: data.name || '',
          instagram_handle: data.instagram_handle || '',
          category: data.category || '',
          bio: data.bio || '',
          location: data.location || '서울',
          followers_count: data.followers_count || 0,
          engagement_rate: data.engagement_rate || 0,
          is_verified: data.is_verified || false
        }
        
        setFormData(loadedData)
        setProfileImage(data.profile_image || '')
        setPortfolioUrls(data.portfolio_urls || [])
        
        // 원본 데이터 저장
        setOriginalData({
          formData: { ...loadedData },
          profileImage: data.profile_image || '',
          portfolioUrls: data.portfolio_urls || []
        })
      }
    } catch (error) {
      console.error('Error in loadProfile:', error)
    }
  }

  const handleSave = async () => {
    if (!hasChanges) {
      alert('변경사항이 없습니다')
      return
    }

    setLoading(true)
    setSaveSuccess(false)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('로그인이 필요합니다')
        return
      }

      const { error } = await supabase
        .from('influencers')
        .update({
          name: formData.name,
          bio: formData.bio,
          category: formData.category,
          location: formData.location,
          profile_image: profileImage,
          portfolio_urls: portfolioUrls.filter(url => url), // 빈 값 제거
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        alert('프로필 업데이트 실패')
      } else {
        // 성공 시 원본 데이터 업데이트
        setOriginalData({
          formData: { ...formData },
          profileImage: profileImage,
          portfolioUrls: [...portfolioUrls]
        })
        
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        
        // 성공 알림
        alert('프로필이 성공적으로 저장되었습니다')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncInstagram = async () => {
    if (!formData.instagram_handle || !formData.id) {
      alert('Instagram 아이디가 없습니다')
      return
    }

    setSyncing(true)
    try {
      const response = await fetch('/api/ig/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          handle: formData.instagram_handle,
          influencerId: formData.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // 동기화된 데이터로 업데이트
        const updatedData = {
          ...formData,
          followers_count: data.metrics?.followers_count || formData.followers_count,
          engagement_rate: data.metrics?.engagement_rate || formData.engagement_rate,
          is_verified: data.metrics?.is_verified || formData.is_verified
        }
        
        setFormData(updatedData)
        
        // 프로필 이미지가 비어있고 Instagram에서 가져온 이미지가 있으면 설정
        if (!profileImage && data.metrics?.profile_picture_url) {
          setProfileImage(data.metrics.profile_picture_url)
        }
        
        // bio가 비어있고 Instagram에서 가져온 bio가 있으면 설정
        if (!formData.bio && data.metrics?.bio) {
          setFormData(prev => ({
            ...prev,
            bio: data.metrics.bio
          }))
        }
        
        alert('Instagram 데이터가 동기화되었습니다')
      } else {
        alert('동기화에 실패했습니다')
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('동기화 중 오류가 발생했습니다')
    } finally {
      setSyncing(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addPortfolioSlot = () => {
    if (portfolioUrls.length < 10) {
      setPortfolioUrls([...portfolioUrls, ''])
    }
  }

  const updatePortfolioUrl = (index: number, url: string) => {
    const updated = [...portfolioUrls]
    updated[index] = url
    setPortfolioUrls(updated)
  }

  const removePortfolioUrl = (index: number) => {
    setPortfolioUrls(portfolioUrls.filter((_, i) => i !== index))
  }

  const handleReset = () => {
    if (confirm('모든 변경사항을 취소하시겠습니까?')) {
      setFormData({ ...originalData.formData })
      setProfileImage(originalData.profileImage)
      setPortfolioUrls([...originalData.portfolioUrls])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b">
        <div className="container mx-auto px-3 py-2 sm:px-4 sm:py-4">
          {/* 모바일 레이아웃 */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-1 px-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">뒤로</span>
              </Button>
              
              <div className="flex items-center gap-1">
                {saveSuccess && (
                  <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5">
                    <Check className="h-3 w-3" />
                  </Badge>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSyncInstagram}
                  disabled={syncing}
                  className="p-2"
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Instagram className="h-4 w-4" />
                  )}
                </Button>
                
                {hasChanges && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  onClick={handleSave}
                  disabled={loading || !hasChanges}
                  size="sm"
                  className={`px-3 py-1.5 ${hasChanges ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      <span className="text-sm">저장</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* 데스크톱 레이아웃 */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                대시보드
              </Button>
              {saveSuccess && (
                <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  저장됨
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSyncInstagram}
                disabled={syncing}
                className="flex items-center gap-2"
              >
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    동기화 중...
                  </>
                ) : (
                  <>
                    <Instagram className="h-4 w-4" />
                    Instagram 동기화
                  </>
                )}
              </Button>
              {hasChanges && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                >
                  <X className="h-4 w-4 mr-2" />
                  취소
                </Button>
              )}
              <Button 
                onClick={handleSave}
                disabled={loading || !hasChanges}
                className={`${hasChanges ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {hasChanges ? '저장하기' : '변경사항 없음'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="edit" className="text-sm sm:text-base">
              프로필 수정
              {hasChanges && (
                <div className="ml-2 w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-sm sm:text-base">미리보기</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block text-sm">프로필 사진</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <ImageUpload
                      value={profileImage}
                      onChange={setProfileImage}
                      type="profile"
                    />
                    <div className="text-xs sm:text-sm text-gray-500">
                      <p>• JPG, PNG 형식</p>
                      <p>• 최대 5MB</p>
                      <p>• 권장: 정사각형 이미지</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm">이름 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="이름을 입력하세요"
                      required
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram" className="text-sm">
                      인스타그램 ID 
                      {formData.is_verified && (
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 inline-block ml-1" />
                      )}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-gray-500" />
                      <Input
                        id="instagram"
                        value={formData.instagram_handle}
                        placeholder="@없이 입력"
                        disabled
                        className="bg-gray-50 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="category" className="text-sm">카테고리 *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm">활동 지역</Label>
                    <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="지역 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(loc => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-sm">소개</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="자기소개를 작성하세요"
                    rows={3}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.bio.length}/500
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">팔로워</p>
                    <p className="text-lg sm:text-xl font-bold">{formatNumber(formData.followers_count)}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">참여율</p>
                    <p className="text-lg sm:text-xl font-bold">{formData.engagement_rate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">포트폴리오</CardTitle>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {portfolioUrls.filter(url => url).length}/10
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {portfolioUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <ImageUpload
                        value={url}
                        onChange={(newUrl) => updatePortfolioUrl(index, newUrl)}
                        type="portfolio"
                      />
                      {url && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 sm:top-2 sm:right-2 rounded-full h-6 w-6 sm:h-8 sm:w-8 p-0 z-10"
                          onClick={() => removePortfolioUrl(index)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {portfolioUrls.length < 10 && (
                    <button
                      onClick={addPortfolioSlot}
                      className="aspect-[3/4] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all"
                    >
                      <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-1 sm:mb-2" />
                      <span className="text-xs sm:text-sm text-gray-500">포트폴리오 추가</span>
                    </button>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                  최대 10개의 포트폴리오 이미지를 업로드할 수 있습니다
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-6">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt={formData.name} 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserCircle className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{formData.name || '이름 미설정'}</h2>
                      {formData.is_verified && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-gray-600">@{formData.instagram_handle}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge className={categoryColor}>
                        {formData.category || '카테고리 미설정'}
                      </Badge>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {formData.location}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">{formData.bio || '소개를 작성해주세요'}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatNumber(formData.followers_count)}</p>
                    <p className="text-sm text-gray-500">팔로워</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formData.engagement_rate}%</p>
                    <p className="text-sm text-gray-500">참여율</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{portfolioUrls.filter(url => url).length}</p>
                    <p className="text-sm text-gray-500">포트폴리오</p>
                  </div>
                </div>

                {portfolioUrls.filter(url => url).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">포트폴리오</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {portfolioUrls.filter(url => url).map((url, index) => (
                        <div key={index} className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
                          <img src={url} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
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