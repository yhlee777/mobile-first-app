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
  Hash,
  Sparkles,
  TrendingUp,
  UserPlus,
  ArrowRight,
  Image,
  Play,
  Plus,
  Trash2,
  ImageIcon,
  UserCircle
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
  profile_image?: string  // 프로필 사진
  cover_image?: string    // 배경 이미지
  portfolio_urls?: string[]  // 포트폴리오 미디어 (최대 7개)
}

export default function InfluencerDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [influencer, setInfluencer] = useState<InfluencerData | null>(null)
  const [similarInfluencers, setSimilarInfluencers] = useState<InfluencerData[]>([])
  const [editing, setEditing] = useState(false)
  const [completionScore, setCompletionScore] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [uploadingMedia, setUploadingMedia] = useState(false)
  
  // 미디어 상태 분리
  const [profileImage, setProfileImage] = useState<string>('')
  const [coverImage, setCoverImage] = useState<string>('')
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    instagram_handle: '',
    category: '',
    bio: '',
    followers_count: 0,
  })

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    calculateCompletion()
    if (influencer?.followers_count) {
      fetchSimilarInfluencers()
    }
  }, [influencer, profileImage, coverImage, portfolioUrls])

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
      
      if (error) {
        console.error('Error fetching influencer:', error)
        if (error.code === 'PGNULL') {
          router.push('/influencer/onboarding')
        }
        return
      }
      
      setInfluencer(data)
      setFormData({
        name: data.name || '',
        instagram_handle: data.instagram_handle || '',
        category: data.category || '',
        bio: data.bio || '',
        followers_count: data.followers_count || 0,
      })
      setProfileImage(data.profile_image || '')
      setCoverImage(data.cover_image || '')
      setPortfolioUrls(data.portfolio_urls || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCompletion = () => {
    if (!influencer) return
    
    let score = 0
    const fields = [
      { value: influencer.name, weight: 15 },
      { value: influencer.instagram_handle, weight: 15 },
      { value: influencer.category, weight: 15 },
      { value: influencer.bio, weight: 15 },
      { value: influencer.followers_count > 0, weight: 10 },
      { value: profileImage, weight: 10 },  // 프로필 사진
      { value: coverImage, weight: 10 },    // 배경 이미지
      { value: portfolioUrls.length >= 3, weight: 10 }  // 포트폴리오 3개 이상
    ]
    
    fields.forEach(field => {
      if (field.value) score += field.weight
    })
    
    setCompletionScore(score)
  }

  const fetchSimilarInfluencers = async () => {
    try {
      const { data } = await supabase
        .from('influencers')
        .select('*')
        .neq('id', influencer?.id)
        .limit(6)
        .order('followers_count', { ascending: false })
      
      if (data) {
        setSimilarInfluencers(data)
      }
    } catch (error) {
      console.error('Error fetching similar influencers:', error)
    }
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadingMedia(true)
    try {
      // 파일 유효성 검사
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('프로필 사진은 이미지 파일만 가능합니다.')
        return
      }
      
      // 실제 업로드 또는 임시 URL 생성
      const tempUrl = URL.createObjectURL(file)
      setProfileImage(tempUrl)
      setSuccess('프로필 사진이 업로드되었습니다.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Profile upload error:', error)
      setError('프로필 사진 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadingMedia(true)
    try {
      // 파일 유효성 검사
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('배경 이미지는 이미지 파일만 가능합니다.')
        return
      }
      
      // 실제 업로드 또는 임시 URL 생성
      const tempUrl = URL.createObjectURL(file)
      setCoverImage(tempUrl)
      setSuccess('배경 이미지가 업로드되었습니다.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Cover upload error:', error)
      setError('배경 이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploadingMedia(false)
    }
  }

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    setUploadingMedia(true)
    setError(null)
    const newPortfolioUrls: string[] = []
    
    try {
      for (const file of Array.from(files)) {
        // 최대 7개 제한
        if (portfolioUrls.length + newPortfolioUrls.length >= 7) {
          setError('포트폴리오는 최대 7개까지 업로드 가능합니다.')
          break
        }
        
        // 파일 유효성 검사
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
        if (!validTypes.includes(file.type)) {
          setError(`${file.name}은(는) 지원하지 않는 파일 형식입니다.`)
          continue
        }
        
        // 파일 크기 제한
        const maxSize = file.type.startsWith('video') ? 50 * 1024 * 1024 : 5 * 1024 * 1024
        if (file.size > maxSize) {
          setError(`${file.name}의 크기가 너무 큽니다.`)
          continue
        }
        
        const tempUrl = URL.createObjectURL(file)
        newPortfolioUrls.push(tempUrl)
      }
      
      const updatedUrls = [...portfolioUrls, ...newPortfolioUrls].slice(0, 7)
      setPortfolioUrls(updatedUrls)
      setSuccess('포트폴리오가 추가되었습니다.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Portfolio upload error:', error)
      setError('포트폴리오 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploadingMedia(false)
    }
  }

  const removePortfolio = (index: number) => {
    const updatedUrls = portfolioUrls.filter((_, i) => i !== index)
    setPortfolioUrls(updatedUrls)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      const updateData = {
        name: formData.name,
        instagram_handle: formData.instagram_handle,
        category: formData.category,
        bio: formData.bio,
        followers_count: formData.followers_count,
        profile_image: profileImage,
        cover_image: coverImage,
        portfolio_urls: portfolioUrls
      }
      
      const { error } = await supabase
        .from('influencers')
        .update(updateData)
        .eq('id', influencer?.id)
      
      if (error) throw error
      
      setInfluencer({ 
        ...influencer!, 
        ...updateData
      })
      setEditing(false)
      setSuccess('프로필이 성공적으로 업데이트되었습니다.')
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      console.error('Save error:', error)
      setError(error.message || '저장 중 오류가 발생했습니다.')
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!influencer) {
    return null
  }

  const totalMediaCount = (profileImage ? 1 : 0) + (coverImage ? 1 : 0) + portfolioUrls.length
  const isMediaComplete = profileImage && coverImage && portfolioUrls.length >= 3

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="h-10 w-10 rounded-full object-cover border-2 border-green-500"
                />
              ) : (
                <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-900">인플루언서 대시보드</h1>
                <p className="text-sm text-gray-500">@{influencer.instagram_handle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">{influencer.name}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 프로필 완성도 알림 */}
        {completionScore < 100 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Sparkles className="h-5 w-5 text-green-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">프로필을 완성해주세요!</h3>
                  <p className="text-sm text-gray-600">
                    프로필, 배경, 포트폴리오를 모두 채워 매력적인 프로필을 만드세요
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-600">{completionScore}%</span>
                <Button 
                  onClick={() => {setActiveTab('profile'); setEditing(true);}}
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  완성하기
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-2xl mx-auto h-auto p-1 bg-gray-100/50">
            <TabsTrigger 
              value="profile" 
              className="relative flex items-center justify-center gap-2 py-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2">
                {completionScore < 100 ? (
                  <>
                    <Sparkles className="h-5 w-5 text-green-500 animate-pulse" />
                    <span className="font-semibold">프로필 완성하기</span>
                    <Badge className="bg-green-500 text-white animate-pulse">
                      {100 - completionScore}% 남음
                    </Badge>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">내 프로필</span>
                    <Badge className="bg-green-500 text-white">완성</Badge>
                  </>
                )}
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="discover" 
              className="relative flex items-center justify-center gap-2 py-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <span className="font-semibold">다른 인플루언서</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {similarInfluencers.length}명
                </Badge>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* 프로필 완성도 카드 */}
            <Card className={completionScore < 100 ? 'border-green-300 shadow-lg' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  프로필 완성도
                  {completionScore < 100 && (
                    <Sparkles className="h-5 w-5 text-green-500 animate-pulse" />
                  )}
                </CardTitle>
                <CardDescription>
                  {completionScore < 100 
                    ? '모든 항목을 완성하여 브랜드에게 어필하세요'
                    : '축하합니다! 프로필이 완성되었습니다'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress 
                    value={completionScore} 
                    className={`flex-1 h-3 ${completionScore < 100 ? '[&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-emerald-500' : ''}`}
                  />
                  <span className={`text-lg font-bold text-green-600`}>
                    {completionScore}%
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '이름', value: influencer.name, icon: User },
                      { label: '인스타그램', value: influencer.instagram_handle, icon: Instagram },
                      { label: '카테고리', value: influencer.category, icon: Hash },
                      { label: '소개', value: influencer.bio, icon: Edit },
                      { label: '팔로워', value: influencer.followers_count > 0, icon: Users },
                      { label: '프로필 사진', value: profileImage, icon: UserCircle },
                      { label: '배경 이미지', value: coverImage, icon: ImageIcon },
                      { label: `포트폴리오 (${portfolioUrls.length}/3+)`, value: portfolioUrls.length >= 3, icon: Camera }
                    ].map((item) => (
                      <div 
                        key={item.label} 
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          item.value 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-green-50/50 border border-green-200 animate-pulse'
                        }`}
                      >
                        {item.value ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-green-500" />
                        )}
                        <item.icon className="h-4 w-4 text-gray-500" />
                        <span className={`text-sm font-medium ${item.value ? 'text-green-700' : 'text-green-600'}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {completionScore < 100 && (
                    <Button 
                      onClick={() => setEditing(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      프로필 완성하기
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 프로필 편집/미리보기 */}
            {editing ? (
              /* 편집 모드 */
              <Card>
                <CardHeader>
                  <CardTitle>프로필 편집</CardTitle>
                  <CardDescription>정보를 입력하여 프로필을 완성하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 기본 정보 섹션 */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b">기본 정보</h3>
                    
                    <div>
                      <Label htmlFor="name">이름</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="홍길동"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="instagram">인스타그램 핸들</Label>
                      <Input
                        id="instagram"
                        value={formData.instagram_handle}
                        onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                        placeholder="@username"
                      />
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
                          <SelectItem value="fashion">패션</SelectItem>
                          <SelectItem value="beauty">뷰티</SelectItem>
                          <SelectItem value="food">푸드</SelectItem>
                          <SelectItem value="travel">여행</SelectItem>
                          <SelectItem value="lifestyle">라이프스타일</SelectItem>
                          <SelectItem value="fitness">피트니스</SelectItem>
                          <SelectItem value="tech">테크</SelectItem>
                          <SelectItem value="other">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">소개</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="브랜드에게 어필할 수 있는 소개를 작성하세요"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="followers">팔로워 수</Label>
                      <Input
                        id="followers"
                        type="number"
                        value={formData.followers_count}
                        onChange={(e) => setFormData({...formData, followers_count: parseInt(e.target.value) || 0})}
                        placeholder="10000"
                      />
                    </div>
                  </div>

                  {/* 이미지 업로드 섹션 */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b">이미지 설정</h3>
                    
                    {/* 프로필 사진 */}
                    <div>
                      <Label>프로필 사진</Label>
                      <p className="text-sm text-gray-500 mb-3">정사각형 프로필 사진을 업로드하세요</p>
                      <div className="flex items-center gap-4">
                        {profileImage ? (
                          <img 
                            src={profileImage} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full object-cover border-2 border-green-200"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-green-50 border-2 border-dashed border-green-300 flex items-center justify-center">
                            <UserCircle className="h-8 w-8 text-green-500" />
                          </div>
                        )}
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfileImageUpload}
                            disabled={uploadingMedia}
                          />
                          <Button type="button" variant="outline" disabled={uploadingMedia}>
                            {uploadingMedia ? '업로드 중...' : '프로필 사진 선택'}
                          </Button>
                        </label>
                        {profileImage && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setProfileImage('')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 배경 이미지 */}
                    <div>
                      <Label>배경 이미지</Label>
                      <p className="text-sm text-gray-500 mb-3">프로필 상단에 표시될 배경 이미지를 업로드하세요</p>
                      <div className="space-y-3">
                        {coverImage ? (
                          <div className="relative aspect-[4/1] bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={coverImage} 
                              alt="Cover" 
                              className="w-full h-full object-cover"
                            />
                            <Button 
                              type="button"
                              variant="destructive" 
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => setCoverImage('')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <label className="block aspect-[4/1] bg-green-50 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleCoverImageUpload}
                              disabled={uploadingMedia}
                            />
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-green-500 mb-2" />
                              <span className="text-sm text-green-600">배경 이미지 업로드</span>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 포트폴리오 섹션 */}
                  <div>
                    <Label>포트폴리오 (사진/동영상)</Label>
                    <p className="text-sm text-gray-500 mb-3">
                      브랜드에게 어필할 수 있는 대표 콘텐츠를 업로드하세요 (최소 3개, 최대 7개)
                    </p>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {/* 업로드된 포트폴리오 미리보기 */}
                      {portfolioUrls.map((url, index) => (
                        <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {url.includes('video') ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Play className="h-8 w-8 text-gray-500" />
                            </div>
                          ) : (
                            <img 
                              src={url} 
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            onClick={() => removePortfolio(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      
                      {/* 업로드 버튼 */}
                      {portfolioUrls.length < 7 && (
                        <label className="aspect-square bg-green-50 border-2 border-dashed border-green-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-green-100 transition-colors">
                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={handlePortfolioUpload}
                            disabled={uploadingMedia}
                          />
                          {uploadingMedia ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                          ) : (
                            <>
                              <Plus className="h-8 w-8 text-green-500 mb-1" />
                              <span className="text-xs text-green-600 text-center px-2">
                                포트폴리오 추가
                              </span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                    
                    {portfolioUrls.length < 3 && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        최소 3개 이상의 포트폴리오를 업로드해주세요 ({portfolioUrls.length}/3)
                      </p>
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
                        setProfileImage(influencer.profile_image || '')
                        setCoverImage(influencer.cover_image || '')
                        setPortfolioUrls(influencer.portfolio_urls || [])
                      }}
                      disabled={saving}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {saving ? '저장 중...' : '저장'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* 프로필 미리보기 */
              <Card className="overflow-hidden">
                <div className="relative">
                  {/* 배경 이미지 */}
                  <div className="aspect-[4/1] bg-gradient-to-r from-green-100 to-emerald-100">
                    {coverImage && (
                      <img 
                        src={coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* 프로필 사진 오버레이 */}
                  <div className="absolute -bottom-12 left-6">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center border-4 border-white shadow-lg">
                        <Instagram className="h-10 w-10 text-green-600" />
                      </div>
                    )}
                  </div>
                  
                  {/* 편집 버튼 */}
                  <Button 
                    onClick={() => setEditing(true)}
                    className="absolute top-4 right-4 bg-white/90 text-gray-700 hover:bg-white"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    편집
                  </Button>
                </div>
                
                <CardContent className="pt-16 pb-6">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold">{influencer.name || '이름 미설정'}</h2>
                      <p className="text-green-600 font-medium">@{influencer.instagram_handle || 'username'}</p>
                      <div className="flex items-center gap-4 mt-2">
                        {influencer.category && (
                          <Badge className="bg-green-100 text-green-700">{influencer.category}</Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
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

                    {influencer.bio && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">소개</h3>
                        <p className="text-gray-600">{influencer.bio}</p>
                      </div>
                    )}

                    {/* 포트폴리오 갤러리 */}
                    {portfolioUrls && portfolioUrls.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">포트폴리오</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {portfolioUrls.map((url, index) => (
                            <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              {url.includes('video') ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <Play className="h-6 w-6 text-gray-500" />
                                </div>
                              ) : (
                                <img 
                                  src={url} 
                                  alt={`Portfolio ${index + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            {/* 다른 인플루언서 탭 내용 유지 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  비슷한 인플루언서 둘러보기
                </CardTitle>
                <CardDescription>
                  당신과 비슷한 카테고리의 다른 인플루언서들입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {similarInfluencers.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {similarInfluencers.map((inf) => (
                      <Card key={inf.id} className="hover:shadow-lg transition-shadow cursor-pointer border-green-100">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {inf.profile_image ? (
                              <img 
                                src={inf.profile_image}
                                alt={inf.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                                <User className="h-6 w-6 text-green-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold">{inf.name}</h3>
                              <p className="text-sm text-gray-500">@{inf.instagram_handle}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                                  {inf.category}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {inf.followers_count.toLocaleString()} 팔로워
                                </span>
                              </div>
                            </div>
                          </div>
                          {inf.bio && (
                            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                              {inf.bio}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">아직 비슷한 인플루언서가 없습니다</p>
                    <Button 
                      variant="outline" 
                      onClick={fetchSimilarInfluencers}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      다시 불러오기
                    </Button>
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