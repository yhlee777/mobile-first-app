'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  User, 
  Mail, 
  Instagram, 
  MapPin, 
  Users, 
  Heart,
  Activity,
  TrendingUp,
  Eye,
  MessageCircle,
  LogOut,
  Camera,
  Edit,
  Save,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ImageIcon,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function InfluencerDashboard() {
  const [activeTab, setActiveTab] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [influencer, setInfluencer] = useState({
    id: '',
    user_id: '',
    name: '김민지',
    bio: '일상과 패션을 사랑하는 인플루언서입니다 ✨',
    category: '패션',
    instagram_handle: 'minji_fashion',
    followers_count: 15234,
    engagement_rate: 4.8,
    profile_image: '',
    cover_image: '',
    portfolio_urls: []
  })
  
  const [editForm, setEditForm] = useState({ ...influencer })
  const [profileImage, setProfileImage] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([])
  const [showProfileImageSelector, setShowProfileImageSelector] = useState(false)
  const [showCoverImageSelector, setShowCoverImageSelector] = useState(false)
  const [showPortfolioSelector, setShowPortfolioSelector] = useState<number | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const categories = ['패션', '뷰티', '라이프스타일', '여행', '음식', '피트니스', '테크', '육아', '기타']
  
  const completionScore = 33 + (profileImage ? 33 : 0) + (coverImage ? 17 : 0) + (portfolioUrls.length >= 2 ? 17 : 0)
  const isMediaComplete = profileImage && coverImage && portfolioUrls.length >= 2

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (data) {
        setInfluencer(data)
        setEditForm(data)
        setProfileImage(data.profile_image || '')
        setCoverImage(data.cover_image || '')
        setPortfolioUrls(data.portfolio_urls || [])
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleSyncInstagram = async () => {
    setSyncing(true)
    // Instagram API 연동 시뮬레이션
    setTimeout(() => {
      setInfluencer(prev => ({
        ...prev,
        followers_count: 15789,
        engagement_rate: 5.2
      }))
      setSyncing(false)
    }, 2000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const updateData = {
        ...editForm,
        profile_image: profileImage,
        cover_image: coverImage,
        portfolio_urls: portfolioUrls.filter(url => url)
      }

      const { error } = await supabase
        .from('influencers')
        .update(updateData)
        .eq('user_id', session.user.id)

      if (!error) {
        setInfluencer(updateData)
        setEditing(false)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const sampleImages = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
  ]

  const sampleCovers = [
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop'
  ]

  const samplePortfolios = [
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">인플루언서 대시보드</h1>
              <Badge className="bg-green-100 text-green-700">
                {influencer.category}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSyncInstagram}
                disabled={syncing}
                className="hidden sm:flex items-center gap-2"
              >
                {syncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
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
        {/* 프로필 완성도 알림 - 모바일 최적화 */}
        {completionScore < 100 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Sparkles className="h-5 w-5 text-green-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">프로필을 완성해주세요!</h3>
                  <p className="text-sm text-gray-600 hidden sm:block">
                    프로필, 배경, 포트폴리오를 모두 채워 매력적인 프로필을 만드세요
                  </p>
                  <p className="text-sm text-gray-600 sm:hidden">
                    모든 항목을 채워주세요
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
                  <span className="hidden sm:inline">완성하기</span>
                  <ArrowRight className="ml-0 sm:ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 스탯 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">팔로워</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {influencer.followers_count.toLocaleString()}
                  </p>
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
                  <p className="text-2xl font-bold text-gray-800">{influencer.engagement_rate}%</p>
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">프로필 조회</p>
                  <p className="text-2xl font-bold text-gray-800">1,234</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-purple-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">메시지</p>
                  <p className="text-2xl font-bold text-gray-800">8</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-2xl mx-auto h-auto p-1 bg-gray-100/50">
            <TabsTrigger 
              value="profile" 
              className="relative flex items-center justify-center gap-2 py-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2">
                {completionScore < 100 ? (
                  <div className="relative">
                    <User className="h-5 w-5" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <User className="h-5 w-5 text-green-600" />
                )}
                <span className="font-medium">프로필 관리</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center justify-center gap-2 py-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">분석</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>프로필 정보</CardTitle>
                  {!editing ? (
                    <Button 
                      onClick={() => setEditing(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditing(false)
                          setEditForm({ ...influencer })
                          setProfileImage(influencer.profile_image || '')
                          setCoverImage(influencer.cover_image || '')
                          setPortfolioUrls(influencer.portfolio_urls || [])
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        취소
                      </Button>
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        저장
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {editing ? (
                  <>
                    {/* 프로필 이미지 */}
                    <div>
                      <Label>프로필 사진</Label>
                      <div className="mt-3 space-y-3">
                        {profileImage ? (
                          <div className="relative w-32 h-32">
                            <img 
                              src={profileImage} 
                              alt="Profile" 
                              className="w-full h-full rounded-full object-cover border-4 border-green-500"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              onClick={() => setShowProfileImageSelector(true)}
                              className="absolute bottom-0 right-0 rounded-full"
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
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
                    </div>

                    {/* 배경 이미지 */}
                    <div>
                      <Label>배경 이미지</Label>
                      <div className="mt-3">
                        {coverImage ? (
                          <div className="relative aspect-[4/1] bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={coverImage} 
                              alt="Cover" 
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              onClick={() => setShowCoverImageSelector(true)}
                              className="absolute top-2 right-2"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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
                    </div>

                    {/* 포트폴리오 이미지 */}
                    <div>
                      <Label>포트폴리오 이미지 (최소 2개)</Label>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        {[0, 1].map((index) => (
                          <div key={index}>
                            {portfolioUrls[index] ? (
                              <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                  src={portfolioUrls[index]} 
                                  alt={`Portfolio ${index + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon"
                                  onClick={() => setShowPortfolioSelector(index)}
                                  className="absolute top-2 right-2"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                onClick={() => setShowPortfolioSelector(index)}
                                className="aspect-[3/4] w-full bg-teal-600 hover:bg-teal-700 text-white"
                              >
                                <Camera className="h-6 w-6" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="name">이름</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">소개</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="mt-2"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">카테고리</Label>
                      <Select
                        value={editForm.category}
                        onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
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
                      <Label htmlFor="instagram">Instagram 핸들</Label>
                      <div className="flex items-center mt-2">
                        <span className="text-gray-500">@</span>
                        <Input
                          id="instagram"
                          value={editForm.instagram_handle}
                          onChange={(e) => setEditForm({ ...editForm, instagram_handle: e.target.value })}
                          className="ml-2"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 프로필 보기 모드 */}
                    <div className="flex items-center gap-6">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt={influencer.name} 
                          className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                          <User className="h-12 w-12 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">{influencer.name}</h2>
                        <p className="text-gray-600 flex items-center gap-2 mt-1">
                          <Instagram className="h-4 w-4" />
                          @{influencer.instagram_handle}
                        </p>
                        <Badge className="mt-2 bg-green-100 text-green-700">
                          {influencer.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-gray-600">소개</Label>
                      <p className="mt-2 text-gray-900">{influencer.bio}</p>
                    </div>
                    
                    {coverImage && (
                      <div>
                        <Label className="text-gray-600">배경 이미지</Label>
                        <div className="mt-2 aspect-[4/1] bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={coverImage} 
                            alt="Cover" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    {portfolioUrls.filter(url => url).length > 0 && (
                      <div>
                        <Label className="text-gray-600">포트폴리오</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          {portfolioUrls.filter(url => url).map((url, index) => (
                            <div key={index} className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                              <img 
                                src={url} 
                                alt={`Portfolio ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 이미지 선택 모달들 */}
                {showProfileImageSelector && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                      <h3 className="text-lg font-semibold mb-4">프로필 사진 선택</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {sampleImages.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setProfileImage(img)
                              setShowProfileImageSelector(false)
                            }}
                            className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-green-500"
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                      <Button
                        onClick={() => setShowProfileImageSelector(false)}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}

                {showCoverImageSelector && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                      <h3 className="text-lg font-semibold mb-4">배경 이미지 선택</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {sampleCovers.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setCoverImage(img)
                              setShowCoverImageSelector(false)
                            }}
                            className="aspect-[4/1] rounded-lg overflow-hidden hover:ring-2 hover:ring-green-500"
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                      <Button
                        onClick={() => setShowCoverImageSelector(false)}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}

                {showPortfolioSelector !== null && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                      <h3 className="text-lg font-semibold mb-4">포트폴리오 이미지 선택</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {samplePortfolios.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              const newUrls = [...portfolioUrls]
                              newUrls[showPortfolioSelector] = img
                              setPortfolioUrls(newUrls)
                              setShowPortfolioSelector(null)
                            }}
                            className="aspect-[3/4] rounded-lg overflow-hidden hover:ring-2 hover:ring-green-500"
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                      <Button
                        onClick={() => setShowPortfolioSelector(null)}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>성과 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">분석 데이터 준비 중</h3>
                  <p className="text-gray-500 mt-2">곧 상세한 분석 데이터를 확인하실 수 있습니다</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}