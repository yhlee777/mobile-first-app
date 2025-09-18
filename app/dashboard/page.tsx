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
  UserCircle,
  Zap,
  Target,
  Star
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
  profile_image?: string
  portfolio_urls?: string[]
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
  
  // 미디어 상태
  const [profileImage, setProfileImage] = useState<string>('')
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    instagram_handle: '',
    category: '',
    bio: '',
    followers_count: 0,
  })

  const categories = ['패션', '뷰티', '라이프스타일', '여행', '음식', '피트니스', '테크', '육아', '기타']

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    calculateCompletion()
    if (influencer?.followers_count) {
      fetchSimilarInfluencers()
    }
  }, [influencer, profileImage, portfolioUrls])

  const checkUser = async () => {
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
      { value: influencer.name, weight: 20 },
      { value: influencer.instagram_handle, weight: 20 },
      { value: influencer.category, weight: 20 },
      { value: influencer.bio, weight: 20 },
      { value: influencer.followers_count > 0, weight: 10 },
      { value: profileImage, weight: 10 }
    ]
    
    fields.forEach(field => {
      if (field.value) score += field.weight
    })
    
    // 포트폴리오는 별도 처리 (0개=0점, 1-2개=5점, 3개이상=10점)
    if (portfolioUrls.length >= 3) {
      score += 10
    } else if (portfolioUrls.length >= 1) {
      score += 5
    }
    
    setCompletionScore(Math.min(100, score))
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
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('프로필 사진은 이미지 파일만 가능합니다.')
        return
      }
      
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

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    setUploadingMedia(true)
    setError(null)
    const newPortfolioUrls: string[] = []
    
    try {
      for (const file of Array.from(files)) {
        if (portfolioUrls.length + newPortfolioUrls.length >= 7) {
          setError('포트폴리오는 최대 7개까지 업로드 가능합니다.')
          break
        }
        
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
        if (!validTypes.includes(file.type)) {
          setError(`${file.name}은(는) 지원하지 않는 파일 형식입니다.`)
          continue
        }
        
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
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
          <p className="text-green-800 font-semibold">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!influencer) {
    return null
  }

  const isProfileComplete = completionScore >= 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-green-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-green-700">잇다</h1>
              <div className="hidden sm:block w-px h-6 bg-green-200"></div>
              <span className="text-base sm:text-lg font-semibold text-gray-700 hidden sm:block">대시보드</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* 프로필 완성도 배너 */}
        {!isProfileComplete && (
          <div className="mb-8 p-6 sm:p-8 bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-3xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-yellow-200 rounded-2xl shadow-sm">
                  <Sparkles className="h-7 w-7 text-yellow-600 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">프로필을 완성해보세요!</h3>
                  <p className="text-gray-700 text-base sm:text-lg mb-4 font-medium">
                    완성도 <span className="text-yellow-600 font-bold text-xl">{completionScore}%</span> - 브랜드들에게 어필할 수 있는 매력적인 프로필을 만들어보세요
                  </p>
                  <div className="w-full sm:w-96 bg-white rounded-full h-3 shadow-inner border border-yellow-200">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-700 shadow-sm relative overflow-hidden"
                      style={{ width: `${completionScore}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">프로필 사진, 기본정보, 포트폴리오를 모두 채워주세요</p>
                </div>
              </div>
              <Button 
                onClick={() => {setActiveTab('profile'); setEditing(true);}}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-base sm:text-lg"
              >
                <Zap className="h-5 w-5 mr-3" />
                지금 완성하기
              </Button>
            </div>
          </div>
        )}

        {/* 성공 완료 배너 */}
        {isProfileComplete && (
          <div className="mb-8 p-6 sm:p-8 bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-300 rounded-3xl shadow-lg">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-green-300 rounded-2xl shadow-sm">
                <CheckCircle className="h-7 w-7 text-green-700" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">🎉 프로필 완성!</h3>
                <p className="text-gray-700 text-base sm:text-lg font-medium">
                  완성도 100% 달성! 이제 브랜드들이 당신을 주목할 준비가 되었습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 에러 및 성공 메시지 */}
        {error && (
          <div className="mb-6 p-5 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-4 shadow-md">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-red-800 font-semibold flex-1">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="text-red-500 hover:bg-red-100 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-5 bg-green-50 border-2 border-green-100 rounded-2xl flex items-center gap-4 shadow-md">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-green-800 font-semibold flex-1">{success}</p>
            <Button variant="ghost" size="sm" onClick={() => setSuccess(null)} className="text-green-500 hover:bg-green-100 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* 메인 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4 p-2 bg-white rounded-3xl h-20 sm:h-24 shadow-lg border-2 border-green-100">
              {/* 프로필 완성하기 탭 */}
              <button
                onClick={() => setActiveTab('profile')}
                className={`
                  flex items-center justify-center gap-3 py-3 px-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 ease-out
                  ${activeTab === 'profile' 
                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-gray-800 shadow-lg border-2 border-green-300 transform scale-105' 
                    : 'bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700 shadow-sm border-2 border-gray-100 hover:border-green-200 hover:scale-102'
                  }
                `}
              >
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex items-center gap-2">
                    {!isProfileComplete ? (
                      <>
                        <Sparkles className={`h-5 w-5 transition-colors duration-300 ${activeTab === 'profile' ? 'text-yellow-600 animate-pulse' : 'text-yellow-500 animate-pulse'}`} />
                        <span className="font-bold text-xs sm:text-sm lg:text-base">프로필 완성하기</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className={`h-5 w-5 transition-colors duration-300 ${activeTab === 'profile' ? 'text-green-600' : 'text-green-500'}`} />
                        <span className="font-bold text-xs sm:text-sm lg:text-base">내 프로필</span>
                      </>
                    )}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm transition-all duration-300 ${
                    !isProfileComplete
                      ? (activeTab === 'profile' 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-red-100 text-red-600 border border-red-200')
                      : (activeTab === 'profile' 
                          ? 'bg-green-200 text-green-700 border border-green-300' 
                          : 'bg-green-100 text-green-600 border border-green-200')
                  }`}>
                    {!isProfileComplete ? `${100 - completionScore}% 남음` : '완성'}
                  </span>
                </div>
              </button>

              {/* 다른 인플루언서 탭 */}
              <button
                onClick={() => setActiveTab('discover')}
                className={`
                  flex items-center justify-center gap-3 py-3 px-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 ease-out
                  ${activeTab === 'discover' 
                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-gray-800 shadow-lg border-2 border-green-300 transform scale-105' 
                    : 'bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700 shadow-sm border-2 border-gray-100 hover:border-green-200 hover:scale-102'
                  }
                `}
              >
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Users className={`h-5 w-5 transition-colors duration-300 ${activeTab === 'discover' ? 'text-green-600' : 'text-green-500'}`} />
                    <span className="font-bold text-xs sm:text-sm lg:text-base">다른 인플루언서</span>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm transition-all duration-300 ${
                    activeTab === 'discover' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    {similarInfluencers.length}명
                  </span>
                </div>
              </button>
            </div>
          </div>

          <TabsContent value="profile" className="space-y-6 mt-0">
            {/* 프로필 완성하기/편집 버튼 */}
            {!editing && (
              <div className="flex justify-end mb-6">
                <Button
                  onClick={() => setEditing(true)}
                  className={`${!isProfileComplete 
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-lg animate-pulse' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md'
                  } px-8 py-4 rounded-2xl font-bold text-base transform hover:scale-105 transition-all duration-200`}
                >
                  <Edit className="h-5 w-5 mr-3" />
                  {!isProfileComplete ? '🌟 프로필 완성하러 가기' : '프로필 편집하기'}
                </Button>
              </div>
            )}

            <Card className="overflow-hidden shadow-xl border-2 border-green-100 bg-white">
              <CardContent className="p-6 sm:p-8">
                {editing ? (
                  <div className="space-y-6">
                    {/* 프로필 이미지 업로드 */}
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-green-50 overflow-hidden border-4 border-white shadow-xl">
                          {profileImage ? (
                            <img 
                              src={profileImage} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-green-100">
                              <UserCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-400" />
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 shadow-lg bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => document.getElementById('profile-upload')?.click()}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <input 
                          id="profile-upload"
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                        />
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-bold text-gray-700">이름 *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-2 h-12 border-2 border-green-100 focus:border-green-300 rounded-xl"
                            placeholder="실명 또는 활동명을 입력하세요"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="instagram" className="text-sm font-bold text-gray-700">Instagram 핸들 *</Label>
                          <div className="flex items-center mt-2">
                            <span className="text-gray-600 bg-green-50 px-3 h-12 flex items-center rounded-l-xl border-2 border-r-0 border-green-100">@</span>
                            <Input
                              id="instagram"
                              value={formData.instagram_handle}
                              onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                              className="rounded-l-none h-12 border-2 border-green-100 focus:border-green-300"
                              placeholder="your_handle"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category" className="text-sm font-bold text-gray-700">카테고리 *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="mt-2 h-12 border-2 border-green-100 focus:border-green-300 rounded-xl">
                            <SelectValue placeholder="카테고리를 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="followers" className="text-sm font-bold text-gray-700">팔로워 수</Label>
                        <Input
                          id="followers"
                          type="number"
                          value={formData.followers_count || ''}
                          onChange={(e) => setFormData({ ...formData, followers_count: parseInt(e.target.value) || 0 })}
                          className="mt-2 h-12 border-2 border-green-100 focus:border-green-300 rounded-xl"
                          placeholder="예: 10000"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bio" className="text-sm font-bold text-gray-700">소개</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="mt-2 min-h-24 border-2 border-green-100 focus:border-green-300 rounded-xl"
                        placeholder="자신을 소개하는 매력적인 문구를 작성해보세요"
                        rows={4}
                      />
                    </div>

                    {/* 포트폴리오 업로드 */}
                    <div>
                      <Label className="text-sm font-bold text-gray-700 mb-4 block">
                        포트폴리오 (최대 7개)
                        <span className="text-xs text-gray-500 ml-2 font-normal">브랜드들에게 어필할 수 있는 대표 작품을 업로드하세요</span>
                      </Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {portfolioUrls.map((url, index) => (
                          <div key={index} className="relative aspect-square bg-green-50 rounded-2xl overflow-hidden group border-2 border-green-100">
                            {url.includes('video') ? (
                              <div className="w-full h-full flex items-center justify-center bg-green-100">
                                <Play className="h-8 w-8 text-green-500" />
                              </div>
                            ) : (
                              <img 
                                src={url} 
                                alt={`Portfolio ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2 w-7 h-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                              onClick={() => removePortfolio(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        {portfolioUrls.length < 7 && (
                          <Button
                            variant="outline"
                            className="aspect-square border-2 border-dashed border-green-200 hover:border-green-400 hover:bg-green-50 flex flex-col items-center justify-center gap-2 text-green-600 hover:text-green-700 transition-all rounded-2xl"
                            onClick={() => document.getElementById('portfolio-upload')?.click()}
                          >
                            <Plus className="h-6 w-6" />
                            <span className="text-xs font-semibold">추가</span>
                          </Button>
                        )}
                      </div>
                      <input 
                        id="portfolio-upload"
                        type="file" 
                        multiple
                        className="hidden" 
                        accept="image/*,video/*"
                        onChange={handlePortfolioUpload}
                      />
                    </div>

                    {/* 저장/취소 버튼 */}
                    <div className="flex gap-4 pt-6 border-t-2 border-green-100">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-14 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                      >
                        {saving ? (
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            저장 중...
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Save className="h-5 w-5" />
                            {!isProfileComplete ? '🎉 프로필 완성하기' : '변경사항 저장하기'}
                          </div>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditing(false)}
                        disabled={saving}
                        className="px-8 h-14 rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-semibold"
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* 프로필 보기 모드 */
                  <div className="space-y-6">
                    {/* 프로필 정보 */}
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-green-50 overflow-hidden border-4 border-white shadow-xl">
                        {profileImage ? (
                          <img 
                            src={profileImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-green-100">
                            <UserCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
                            {influencer.name || '이름 미설정'}
                            {isProfileComplete && <CheckCircle className="h-7 w-7 text-green-500" />}
                          </h2>
                          <p className="text-green-600 font-semibold text-lg">
                            @{influencer.instagram_handle || 'handle_미설정'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <Badge className="bg-green-100 text-green-700 border border-green-200 font-semibold px-3 py-1">
                            {influencer.category || '카테고리 미설정'}
                          </Badge>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-5 w-5" />
                            <span className="font-semibold">
                              {influencer.followers_count?.toLocaleString() || 0} 팔로워
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 통계 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-6 bg-green-50 rounded-2xl border-2 border-green-100">
                        <p className="text-3xl font-bold text-gray-800">
                          {influencer.followers_count?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-gray-600 font-semibold">팔로워</p>
                      </div>
                      <div className="text-center p-6 bg-green-50 rounded-2xl border-2 border-green-100">
                        <p className="text-3xl font-bold text-gray-800">
                          {influencer.engagement_rate || 0}%
                        </p>
                        <p className="text-sm text-gray-600 font-semibold">참여율</p>
                      </div>
                    </div>

                    {/* 소개 */}
                    {influencer.bio && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-3">소개</h3>
                        <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl">{influencer.bio}</p>
                      </div>
                    )}

                    {/* 포트폴리오 갤러리 */}
                    {portfolioUrls && portfolioUrls.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-4">포트폴리오</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                          {portfolioUrls.map((url, index) => (
                            <div key={index} className="aspect-square bg-green-50 rounded-2xl overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-md hover:shadow-lg border-2 border-green-100">
                              {url.includes('video') ? (
                                <div className="w-full h-full flex items-center justify-center bg-green-100">
                                  <Play className="h-8 w-8 text-green-500" />
                                </div>
                              ) : (
                                <img 
                                  src={url} 
                                  alt={`Portfolio ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6 mt-0">
            <Card className="overflow-hidden shadow-xl border-2 border-green-100 bg-white">
              <CardHeader className="pb-6 bg-gradient-to-r from-green-100 to-green-200 border-b border-green-200">
                <CardTitle className="flex items-center gap-4 text-2xl sm:text-3xl font-bold text-gray-800">
                  <div className="p-3 bg-green-200 rounded-2xl">
                    <TrendingUp className="h-7 w-7 text-green-700" />
                  </div>
                  <span>비슷한 인플루언서 둘러보기</span>
                </CardTitle>
                <CardDescription className="text-gray-700 text-base font-medium ml-16">
                  당신과 비슷한 카테고리의 다른 인플루언서들을 만나보세요
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 bg-gradient-to-br from-green-50 to-white">
                {similarInfluencers.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {similarInfluencers.map((inf) => (
                      <Card 
                        key={inf.id} 
                        className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-green-100 hover:border-green-300 bg-white hover:bg-green-50 transform hover:scale-105 rounded-2xl"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-green-50 overflow-hidden flex-shrink-0 border-2 border-green-100 group-hover:border-green-300 transition-colors duration-300 shadow-md">
                              {inf.profile_image ? (
                                <img 
                                  src={inf.profile_image} 
                                  alt={inf.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-green-100">
                                  <UserCircle className="h-10 w-10 text-green-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-800 truncate text-lg group-hover:text-green-700 transition-colors duration-300">
                                {inf.name}
                              </h4>
                              <p className="text-sm text-green-600 font-semibold">@{inf.instagram_handle}</p>
                              <div className="flex items-center justify-between mt-3">
                                <Badge className="text-xs font-semibold bg-green-100 text-green-700 border border-green-200 group-hover:bg-green-200 group-hover:border-green-300 transition-colors duration-300 px-2 py-1">
                                  {inf.category}
                                </Badge>
                                <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full group-hover:bg-green-100 group-hover:text-green-700 transition-colors duration-300">
                                  {inf.followers_count?.toLocaleString()}명
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="p-8 bg-green-50 rounded-3xl inline-block border-2 border-green-100">
                      <Users className="h-20 w-20 mx-auto mb-4 text-green-400" />
                      <p className="text-xl font-bold text-gray-700">비슷한 인플루언서를 찾고 있습니다...</p>
                      <p className="text-gray-500 mt-2">잠시만 기다려주세요</p>
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