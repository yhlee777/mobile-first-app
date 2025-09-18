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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  Camera, 
  Save, 
  UserCircle,
  Instagram,
  MapPin,
  Plus,
  X,
  Play,
  Eye,
  Heart,
  MessageCircle,
  Users,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Edit
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export default function ProfileEditPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState('')
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('edit')
  
  const [formData, setFormData] = useState({
    name: '',
    instagram_handle: '',
    category: '',
    bio: '',
    location: '서울',
    followers_count: 0,
    engagement_rate: 0,
    is_verified: false
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

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('influencers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setFormData({
        name: data.name || '',
        instagram_handle: data.instagram_handle || '',
        category: data.category || '',
        bio: data.bio || '',
        location: data.location || '서울',
        followers_count: data.followers_count || 0,
        engagement_rate: data.engagement_rate || 0,
        is_verified: data.is_verified || false
      })
      setProfileImage(data.profile_image || '')
      setPortfolioUrls(data.portfolio_urls || [])
    }
  }

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase
        .from('influencers')
        .update({
          ...formData,
          profile_image: profileImage,
          portfolio_urls: portfolioUrls,
          is_active: true
        })
        .eq('user_id', user.id)
    }
    
    setLoading(false)
    router.push('/dashboard')
  }

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setProfileImage(url)
    }
  }

  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newUrls = Array.from(files).map(file => URL.createObjectURL(file))
      setPortfolioUrls(prev => [...prev, ...newUrls].slice(0, 7))
    }
  }

  const removePortfolio = (index: number) => {
    setPortfolioUrls(prev => prev.filter((_, i) => i !== index))
  }

  // 예상 도달 수와 평균 좋아요 계산
  const totalReach = Math.floor(formData.followers_count * (formData.engagement_rate / 100))
  const averageLikes = Math.floor(totalReach * 0.8)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold">프로필 편집</h1>
            </div>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              편집
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              미리보기
            </TabsTrigger>
          </TabsList>

          {/* 편집 탭 */}
          <TabsContent value="edit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>프로필 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 프로필 이미지 */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                      {profileImage ? (
                        <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UserCircle className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-1.5 bg-green-600 text-white rounded-full cursor-pointer hover:bg-green-700">
                      <Camera className="w-4 h-4" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
                    </label>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">프로필 사진</h3>
                    <p className="text-sm text-gray-500">JPG, PNG 최대 5MB</p>
                  </div>
                </div>

                {/* 기본 정보 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="이름을 입력하세요"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram">인스타그램</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        @
                      </span>
                      <Input
                        id="instagram"
                        value={formData.instagram_handle}
                        onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                        className="rounded-l-none"
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">카테고리</Label>
                    <Select 
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">지역</Label>
                    <Select 
                      value={formData.location}
                      onValueChange={(value) => setFormData({...formData, location: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="지역 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="followers">팔로워 수</Label>
                    <Input
                      id="followers"
                      type="number"
                      value={formData.followers_count}
                      onChange={(e) => setFormData({...formData, followers_count: parseInt(e.target.value) || 0})}
                      placeholder="팔로워 수"
                    />
                  </div>

                  <div>
                    <Label htmlFor="engagement">참여율 (%)</Label>
                    <Input
                      id="engagement"
                      type="number"
                      step="0.1"
                      value={formData.engagement_rate}
                      onChange={(e) => setFormData({...formData, engagement_rate: parseFloat(e.target.value) || 0})}
                      placeholder="참여율"
                    />
                  </div>
                </div>

                {/* 소개 */}
                <div>
                  <Label htmlFor="bio">소개</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="자기소개를 작성해주세요"
                    rows={4}
                  />
                </div>

                {/* 포트폴리오 */}
                <div>
                  <Label>포트폴리오 (최대 7개)</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-2">
                    {portfolioUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {url.includes('video') ? (
                            <div className="relative w-full h-full bg-black flex items-center justify-center">
                              <Play className="w-8 h-8 text-white opacity-80" />
                            </div>
                          ) : (
                            <img src={url} alt={`포트폴리오 ${index + 1}`} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <button
                          onClick={() => removePortfolio(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    {portfolioUrls.length < 7 && (
                      <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors">
                        <Plus className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">추가</span>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          accept="image/*,video/*"
                          onChange={handlePortfolioUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 미리보기 탭 - 광고주가 보는 화면 */}
          <TabsContent value="preview" className="mt-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">광고주에게 보여질 프로필 화면입니다</p>
            </div>
            
            {/* 프로필 정보 카드 */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>프로필 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                        {profileImage ? (
                          <img src={profileImage} alt="프로필" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <Instagram className="h-10 w-10 text-green-600" />
                        )}
                      </div>
                      {formData.is_verified && (
                        <CheckCircle className="absolute -bottom-1 -right-1 h-6 w-6 text-blue-500 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">{formData.name || '이름 미입력'}</h2>
                      <p className="text-green-600 font-medium">@{formData.instagram_handle}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary" className={categoryColor}>
                          {formData.category || '카테고리 미선택'}
                        </Badge>
                        {formData.location && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {formData.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(formData.followers_count)}
                      </p>
                      <p className="text-sm text-gray-500">팔로워</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {formData.engagement_rate}%
                      </p>
                      <p className="text-sm text-gray-500">참여율</p>
                    </div>
                  </div>

                  {formData.bio && (
                    <div>
                      <h3 className="font-semibold mb-2">소개</h3>
                      <p className="text-gray-600">{formData.bio}</p>
                    </div>
                  )}

                  <div>
                    <button 
                      type="button"
                      className="inline-flex items-center gap-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram 프로필 보기
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 성과 지표 카드 */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>성과 지표</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">예상 도달</span>
                    </div>
                    <p className="text-xl font-bold">{formatNumber(totalReach)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">평균 좋아요</span>
                    </div>
                    <p className="text-xl font-bold">{formatNumber(averageLikes)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">평균 댓글</span>
                    </div>
                    <p className="text-xl font-bold">{formatNumber(Math.floor(averageLikes * 0.05))}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm">콘텐츠 품질</span>
                    </div>
                    <p className="text-xl font-bold">우수</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 포트폴리오 갤러리 */}
            {portfolioUrls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>포트폴리오</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {portfolioUrls.map((url, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {url.includes('video') ? (
                          <div className="relative w-full h-full bg-black flex items-center justify-center">
                            <Play className="w-8 h-8 text-white opacity-80" />
                          </div>
                        ) : (
                          <img src={url} alt={`포트폴리오 ${index + 1}`} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}