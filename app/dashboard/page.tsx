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
    } catch (error) {
      console.error('Save error:', error)
      setError('프로필 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isProfileComplete = completionScore >= 100

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-bold brand-primary-text">인플루언서 대시보드</h1>
              {influencer?.category && (
                <Badge className="bg-green-100 text-green-700">
                  {influencer.category}
                </Badge>
              )}
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
                  <Sparkles className="h-7 w-7 text-yellow-600" />
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
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
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

        {/* 알림 메시지들 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6">
            <div className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
              {/* 프로필 탭 */}
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
                        <Sparkles className={`h-5 w-5 transition-colors duration-300 ${activeTab === 'profile' ? 'text-yellow-600' : 'text-yellow-500'}`} />
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
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-lg' 
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
                            <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-300" />
                            </div>
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full cursor-pointer hover:bg-green-700 transition-colors shadow-lg">
                          <Camera className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
                        </label>
                      </div>
                      
                      <div className="flex-1 space-y-4">
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
                          <Label htmlFor="instagram">인스타그램 핸들</Label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                              @
                            </span>
                            <Input
                              id="instagram"
                              value={formData.instagram_handle}
                              onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                              placeholder="instagram_handle"
                              className="rounded-l-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 카테고리 선택 */}
                    <div>
                      <Label htmlFor="category">카테고리</Label>
                      <Select 
                        value={formData.category}
                        onValueChange={(value) => setFormData({...formData, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 소개글 */}
                    <div>
                      <Label htmlFor="bio">소개</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="브랜드에게 어필할 수 있는 소개를 작성해주세요"
                        rows={4}
                      />
                    </div>

                    {/* 포트폴리오 업로드 */}
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

                    {/* 저장 버튼 */}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setEditing(false)}
                        disabled={saving}
                      >
                        취소
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saving ? '저장 중...' : '저장하기'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* 프로필 헤더 */}
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-xl border-4 border-green-100">
                        {profileImage ? (
                          <img src={profileImage} alt={influencer?.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <UserCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{influencer?.name || '이름 미설정'}</h2>
                        <div className="flex items-center gap-2 mb-3">
                          <Instagram className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-600 font-medium">@{influencer?.instagram_handle || 'instagram'}</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Badge className="bg-green-100 text-green-700 border border-green-200 font-semibold px-3 py-1">
                            {influencer?.category || '카테고리 미설정'}
                          </Badge>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-5 w-5" />
                            <span className="font-semibold">
                              {influencer?.followers_count?.toLocaleString() || 0} 팔로워
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 통계 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-6 bg-green-50 rounded-2xl border-2 border-green-100">
                        <p className="text-3xl font-bold text-gray-800">
                          {influencer?.followers_count?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-gray-600 font-semibold">팔로워</p>
                      </div>
                      <div className="text-center p-6 bg-green-50 rounded-2xl border-2 border-green-100">
                        <p className="text-3xl font-bold text-gray-800">
                          {influencer?.engagement_rate || 0}%
                        </p>
                        <p className="text-sm text-gray-600 font-semibold">참여율</p>
                      </div>
                    </div>

                    {/* 소개 */}
                    {influencer?.bio && (
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
                                <div className="relative w-full h-full bg-black flex items-center justify-center">
                                  <Play className="w-10 h-10 text-white opacity-80" />
                                </div>
                              ) : (
                                <img src={url} alt={`포트폴리오 ${index + 1}`} className="w-full h-full object-cover" />
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

          <TabsContent value="discover" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>다른 인플루언서 둘러보기</CardTitle>
                <CardDescription>비슷한 카테고리의 인플루언서들을 만나보세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similarInfluencers.map((inf) => (
                    <Card key={inf.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                            {inf.profile_image ? (
                              <img src={inf.profile_image} alt={inf.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{inf.name}</h4>
                            <p className="text-sm text-gray-600">@{inf.instagram_handle}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {inf.category}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {inf.followers_count?.toLocaleString()} 팔로워
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}