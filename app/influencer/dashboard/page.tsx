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
  LogOut,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Camera,
  Hash,
  Sparkles,
  TrendingUp,
  UserPlus,
  ArrowRight,
  ImageIcon,
  UserCircle,
  Check,
  RefreshCw,
  Calendar,
  Heart,
  MessageCircle,
  BarChart3,
  Zap,
  Target,
  Activity,
  Plus
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
  cover_image?: string
  portfolio_urls?: string[]
  last_synced_at?: string
}

// 샘플 이미지 데이터
const sampleProfileImages = [
  { id: 1, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', label: '여성 프로필 1' },
  { id: 2, url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', label: '남성 프로필 1' },
  { id: 3, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', label: '여성 프로필 2' },
  { id: 4, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', label: '여성 프로필 3' },
  { id: 5, url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', label: '남성 프로필 2' },
  { id: 6, url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', label: '여성 프로필 4' }
]

const sampleCoverImages = [
  { id: 1, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200', label: '파스텔 그라데이션' },
  { id: 2, url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200', label: '추상 패턴' },
  { id: 3, url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200', label: '플루이드 아트' },
  { id: 4, url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200', label: '블루 그라데이션' },
  { id: 5, url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200', label: '퍼플 드림' },
  { id: 6, url: 'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1200', label: '네온 웨이브' }
]

const samplePortfolioImages = [
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600',
  'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600',
  'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=600',
  'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600',
  'https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?w=600',
  'https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=600'
]

export default function InfluencerDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [influencer, setInfluencer] = useState<InfluencerData | null>(null)
  const [similarInfluencers, setSimilarInfluencers] = useState<InfluencerData[]>([])
  const [editing, setEditing] = useState(false)
  const [completionScore, setCompletionScore] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  
  // 이미지 선택 모달 상태
  const [showProfileImageSelector, setShowProfileImageSelector] = useState(false)
  const [showCoverImageSelector, setShowCoverImageSelector] = useState(false)
  const [showPortfolioSelector, setShowPortfolioSelector] = useState(false)
  const [customUrlInput, setCustomUrlInput] = useState('')
  
  // 미디어 상태
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
      setProfileImage(data?.profile_image || '')
      setCoverImage(data?.cover_image || '')
      setPortfolioUrls(data?.portfolio_urls?.slice(0, 2) || [])
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
      { value: influencer.category, weight: 10 },
      { value: influencer.bio, weight: 10 },
      { value: influencer.followers_count > 0, weight: 10 },
      { value: profileImage, weight: 10 },
      { value: coverImage, weight: 10 },
      { value: portfolioUrls.length >= 2, weight: 10 }
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

  const syncInstagramData = async () => {
    if (!influencer?.instagram_handle) return
    
    setSyncing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/instagram/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: influencer.instagram_handle })
      })
      
      const result = await response.json()
      
      if (result.success) {
        const { error } = await supabase
          .from('influencers')
          .update({
            followers_count: result.data.followers_count,
            engagement_rate: result.data.engagement_rate,
            last_synced_at: new Date().toISOString()
          })
          .eq('id', influencer.id)
        
        if (!error) {
          setInfluencer({
            ...influencer,
            followers_count: result.data.followers_count,
            engagement_rate: result.data.engagement_rate,
            last_synced_at: new Date().toISOString()
          })
          setSuccess('인스타그램 데이터가 동기화되었습니다.')
          setTimeout(() => setSuccess(null), 3000)
        }
      } else {
        setError('인스타그램 데이터 동기화에 실패했습니다.')
      }
    } catch (error) {
      console.error('Sync error:', error)
      setError('동기화 중 오류가 발생했습니다.')
    } finally {
      setSyncing(false)
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!influencer) {
    return null
  }

  const lastSyncDate = influencer.last_synced_at 
    ? new Date(influencer.last_synced_at).toLocaleDateString('ko-KR')
    : '동기화 필요'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/20">
      {/* 네비게이션 헤더 */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-green-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="h-10 w-10 rounded-full object-cover border-2 border-green-400 shadow-sm"
                />
              ) : (
                <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-800">인플루언서 대시보드</h1>
                <p className="text-sm text-green-600">@{influencer.instagram_handle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={syncInstagramData}
                disabled={syncing}
                variant="outline"
                size="sm"
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                {syncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    동기화
                  </>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-gray-600 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 스탯 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">팔로워</p>
                  <p className="text-2xl font-bold text-gray-800">{influencer.followers_count.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">참여율</p>
                  <p className="text-2xl font-bold text-gray-800">{influencer.engagement_rate || 0}%</p>
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-teal-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">프로필 완성도</p>
                  <p className="text-2xl font-bold text-gray-800">{completionScore}%</p>
                </div>
                <div className="h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-lime-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">마지막 동기화</p>
                  <p className="text-lg font-semibold text-gray-800">{lastSyncDate}</p>
                </div>
                <div className="h-12 w-12 bg-lime-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-lime-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 프로필 완성도 알림 */}
        {completionScore < 100 && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Zap className="h-5 w-5 text-green-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">프로필을 완성해주세요!</h3>
                    <p className="text-sm text-gray-600">
                      프로필, 배경, 포트폴리오를 모두 채워 매력적인 프로필을 만드세요
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => {setActiveTab('profile'); setEditing(true);}}
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm"
                >
                  완성하기
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <Progress 
                value={completionScore} 
                className="mt-4 h-2 bg-green-100"
              />
            </CardContent>
          </Card>
        )}

        {/* 메인 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur border border-green-100">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-gray-600"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              개요
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-gray-600"
            >
              <User className="h-4 w-4 mr-2" />
              프로필
            </TabsTrigger>
            <TabsTrigger 
              value="discover" 
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-gray-600"
            >
              <Users className="h-4 w-4 mr-2" />
              탐색
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* 개요 탭 내용 */}
            <Card className="bg-white border-green-100">
              <CardHeader>
                <CardTitle className="text-gray-800">빠른 통계</CardTitle>
                <CardDescription className="text-gray-500">
                  최근 30일간의 성과 요약
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                    <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">
                      {Math.floor(influencer.followers_count * 0.05)}
                    </p>
                    <p className="text-sm text-gray-600">평균 좋아요</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">
                      {Math.floor(influencer.followers_count * 0.01)}
                    </p>
                    <p className="text-sm text-gray-600">평균 댓글</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">
                      +{Math.floor(Math.random() * 20 + 5)}%
                    </p>
                    <p className="text-sm text-gray-600">성장률</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {!editing ? (
              /* 프로필 미리보기 */
              <Card className="bg-white border-green-100 overflow-hidden">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-r from-green-100 to-emerald-100">
                    {coverImage && (
                      <img 
                        src={coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="absolute -bottom-16 left-6">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center border-4 border-white shadow-lg">
                        <Instagram className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => setEditing(true)}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 shadow-sm"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    편집
                  </Button>
                </div>
                
                <CardContent className="pt-20 pb-6">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">{influencer.name || '이름 미설정'}</h2>
                      <p className="text-green-600 font-medium">@{influencer.instagram_handle}</p>
                      {influencer.category && (
                        <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                          {influencer.category}
                        </Badge>
                      )}
                    </div>
                    
                    {influencer.bio && (
                      <p className="text-gray-600">{influencer.bio}</p>
                    )}
                    
                    {portfolioUrls && portfolioUrls.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">포트폴리오</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {portfolioUrls.map((url, index) => (
                            <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              <img 
                                src={url} 
                                alt={`Portfolio ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-110 transition-transform"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* 편집 모드 */
              <Card className="bg-white border-green-100">
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

                  {/* 미디어 섹션 */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b">미디어 설정</h3>
                    
                    {/* 프로필 사진 */}
                    <div className="bg-green-50/30 p-4 rounded-lg border border-green-100">
                      <Label className="flex items-center gap-2 mb-3">
                        <UserCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">프로필 사진</span>
                        <Badge className="bg-green-100 text-green-700 text-xs">필수 1장</Badge>
                      </Label>
                      <p className="text-sm text-gray-600 mb-4">정사각형 프로필 이미지를 업로드하세요</p>
                      
                      {profileImage ? (
                        <div className="flex items-center gap-4">
                          <img 
                            src={profileImage} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full object-cover border-2 border-green-200 shadow-sm"
                          />
                          <div className="flex flex-col gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowProfileImageSelector(true)}
                              className="border-green-200 text-green-700 hover:bg-green-50"
                            >
                              변경
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setProfileImage('')}
                              className="text-red-600 hover:bg-red-50"
                            >
                              제거
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => setShowProfileImageSelector(true)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          프로필 사진 선택
                        </Button>
                      )}
                    </div>

                    {/* 배경 사진 */}
                    <div className="bg-emerald-50/30 p-4 rounded-lg border border-emerald-100">
                      <Label className="flex items-center gap-2 mb-3">
                        <ImageIcon className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">배경 이미지</span>
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">필수 1장</Badge>
                      </Label>
                      <p className="text-sm text-gray-600 mb-4">프로필 상단에 표시될 와이드 이미지를 업로드하세요</p>
                      
                      {coverImage ? (
                        <div className="space-y-3">
                          <div className="relative aspect-[4/1] bg-gray-100 rounded-lg overflow-hidden border border-emerald-100">
                            <img 
                              src={coverImage} 
                              alt="Cover" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 flex gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                onClick={() => setShowCoverImageSelector(true)}
                                className="bg-white/90 hover:bg-white"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                type="button"
                                variant="secondary"
                                size="icon"
                                onClick={() => setCoverImage('')}
                                className="bg-white/90 hover:bg-white text-red-600"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => setShowCoverImageSelector(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          배경 사진 선택
                        </Button>
                      )}
                    </div>

                    {/* 어필용 미디어 */}
                    <div className="bg-teal-50/30 p-4 rounded-lg border border-teal-100">
                      <Label className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-teal-600" />
                        <span className="font-medium">어필용 콘텐츠</span>
                        <Badge className="bg-teal-100 text-teal-700 text-xs">필수 2개</Badge>
                      </Label>
                      <p className="text-sm text-gray-600 mb-4">브랜드에게 보여줄 대표 콘텐츠 2개를 선택하세요</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {portfolioUrls[0] ? (
                          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-teal-100">
                            <img 
                              src={portfolioUrls[0]} 
                              alt="Portfolio 1"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  const newUrls = [...portfolioUrls]
                                  newUrls[0] = ''
                                  setPortfolioUrls(newUrls.filter(Boolean))
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              콘텐츠 1
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowPortfolioSelector(true)}
                            className="aspect-square bg-white border-2 border-dashed border-teal-200 rounded-lg flex flex-col items-center justify-center hover:bg-teal-50 transition-colors"
                          >
                            <Plus className="h-8 w-8 text-teal-500 mb-2" />
                            <span className="text-sm text-gray-600">콘텐츠 1 추가</span>
                          </button>
                        )}

                        {portfolioUrls[1] ? (
                          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-teal-100">
                            <img 
                              src={portfolioUrls[1]} 
                              alt="Portfolio 2"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  const newUrls = [...portfolioUrls]
                                  newUrls[1] = ''
                                  setPortfolioUrls(newUrls.filter(Boolean))
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              콘텐츠 2
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowPortfolioSelector(true)}
                            className="aspect-square bg-white border-2 border-dashed border-teal-200 rounded-lg flex flex-col items-center justify-center hover:bg-teal-50 transition-colors"
                            disabled={portfolioUrls.length >= 2}
                          >
                            <Plus className="h-8 w-8 text-teal-500 mb-2" />
                            <span className="text-sm text-gray-600">콘텐츠 2 추가</span>
                          </button>
                        )}
                      </div>

                      {portfolioUrls.length < 2 && (
                        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-700 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {2 - portfolioUrls.length}개의 콘텐츠를 더 추가해주세요
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 완성도 체크 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">프로필 완성도 체크</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {profileImage ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                          <span className="text-sm text-gray-600">프로필 사진</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {coverImage ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                          <span className="text-sm text-gray-600">배경 이미지</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {portfolioUrls.length >= 2 ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                          <span className="text-sm text-gray-600">어필 콘텐츠 (2개)</span>
                        </div>
                      </div>
                    </div>
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
                        setPortfolioUrls(influencer.portfolio_urls?.slice(0, 2) || [])
                      }}
                      disabled={saving}
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {saving ? '저장 중...' : '저장'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <Card className="bg-white border-green-100">
              <CardHeader>
                <CardTitle className="text-gray-800">다른 인플루언서 둘러보기</CardTitle>
                <CardDescription className="text-gray-500">
                  비슷한 카테고리의 인플루언서들
                </CardDescription>
              </CardHeader>
              <CardContent>
                {similarInfluencers.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {similarInfluencers.map((inf) => (
                      <Card key={inf.id} className="bg-white border-green-100 hover:shadow-md hover:border-green-200 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {inf.profile_image ? (
                              <img 
                                src={inf.profile_image}
                                alt={inf.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-green-100"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-green-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800">{inf.name}</h3>
                              <p className="text-sm text-gray-500">@{inf.instagram_handle}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                                  {inf.category}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {inf.followers_count.toLocaleString()} 팔로워
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">아직 비슷한 인플루언서가 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 이미지 선택 모달들 */}
        {showProfileImageSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>프로필 사진 선택</CardTitle>
                <CardDescription>샘플 이미지를 선택하거나 URL을 입력하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {sampleProfileImages.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => {
                        setProfileImage(img.url)
                        setShowProfileImageSelector(false)
                        setSuccess('프로필 사진이 선택되었습니다')
                        setTimeout(() => setSuccess(null), 3000)
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 hover:border-green-500 transition-colors ${
                        profileImage === img.url ? 'border-green-500' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={img.url} 
                        alt={img.label}
                        className="w-full h-full object-cover"
                      />
                      {profileImage === img.url && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <Check className="h-8 w-8 text-green-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <Label htmlFor="custom-url">또는 이미지 URL 직접 입력</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="custom-url"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        if (customUrlInput) {
                          setProfileImage(customUrlInput)
                          setCustomUrlInput('')
                          setShowProfileImageSelector(false)
                          setSuccess('프로필 사진이 설정되었습니다')
                          setTimeout(() => setSuccess(null), 3000)
                        }
                      }}
                    >
                      적용
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowProfileImageSelector(false)
                      setCustomUrlInput('')
                    }}
                  >
                    취소
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showCoverImageSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>배경 이미지 선택</CardTitle>
                <CardDescription>프로필 상단에 표시될 배경을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {sampleCoverImages.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => {
                        setCoverImage(img.url)
                        setShowCoverImageSelector(false)
                        setSuccess('배경 이미지가 선택되었습니다')
                        setTimeout(() => setSuccess(null), 3000)
                      }}
                      className={`relative aspect-[4/1] rounded-lg overflow-hidden border-2 hover:border-green-500 transition-colors ${
                        coverImage === img.url ? 'border-green-500' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={img.url} 
                        alt={img.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs">
                        {img.label}
                      </div>
                      {coverImage === img.url && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <Check className="h-8 w-8 text-green-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <Label htmlFor="custom-cover-url">또는 이미지 URL 직접 입력</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="custom-cover-url"
                      type="url"
                      placeholder="https://example.com/cover.jpg"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        if (customUrlInput) {
                          setCoverImage(customUrlInput)
                          setCustomUrlInput('')
                          setShowCoverImageSelector(false)
                          setSuccess('배경 이미지가 설정되었습니다')
                          setTimeout(() => setSuccess(null), 3000)
                        }
                      }}
                    >
                      적용
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCoverImageSelector(false)
                      setCustomUrlInput('')
                    }}
                  >
                    취소
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showPortfolioSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>포트폴리오 이미지 추가</CardTitle>
                <CardDescription>브랜드에게 어필할 수 있는 콘텐츠를 선택하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {samplePortfolioImages.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (portfolioUrls.length < 2) {
                          setPortfolioUrls([...portfolioUrls, url])
                          setShowPortfolioSelector(false)
                          setSuccess('포트폴리오 이미지가 추가되었습니다')
                          setTimeout(() => setSuccess(null), 3000)
                        }
                      }}
                      disabled={portfolioUrls.includes(url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 hover:border-green-500 transition-colors ${
                        portfolioUrls.includes(url) ? 'border-gray-300 opacity-50' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={url} 
                        alt={`Sample ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {portfolioUrls.includes(url) && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Check className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <Label htmlFor="custom-portfolio-url">또는 이미지 URL 직접 입력</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="custom-portfolio-url"
                      type="url"
                      placeholder="https://example.com/portfolio.jpg"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        if (customUrlInput && portfolioUrls.length < 2) {
                          setPortfolioUrls([...portfolioUrls, customUrlInput])
                          setCustomUrlInput('')
                          setShowPortfolioSelector(false)
                          setSuccess('포트폴리오 이미지가 추가되었습니다')
                          setTimeout(() => setSuccess(null), 3000)
                        }
                      }}
                      disabled={portfolioUrls.length >= 2}
                    >
                      추가
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">
                    {portfolioUrls.length}/2개 선택됨
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPortfolioSelector(false)
                      setCustomUrlInput('')
                    }}
                  >
                    닫기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}