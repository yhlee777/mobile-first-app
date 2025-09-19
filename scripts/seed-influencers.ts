import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const instagramToken = process.env.INSTAGRAM_ACCESS_TOKEN!
const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 추출된 인스타그램 계정 리스트 (랜덤 순서)
const instagramAccounts = [
  { handle: 'matgool_', name: '맛집발굴', category: '음식' },
  { handle: 'hj_foodie', name: '혜띠 맛집리뷰', category: '음식' },
  { handle: 'chopchop_univ', name: '참참대학', category: '음식' },
  { handle: 'sleepdish_', name: '슬립디쉬', category: '음식' },
  { handle: 'jack93kim', name: '잭키형', category: '육아' },
  { handle: 'mukbosskim', name: '먹보스킴', category: '음식' },
  { handle: 'cafe.ing', name: '카페ing', category: '음식' },
  { handle: 'themukeou', name: '더먹어유', category: '음식' },
  { handle: '_plan_book', name: '플랜북', category: '라이프스타일' },
  { handle: 'food._slimee', name: '푸드의 먹스타그램', category: '음식' },
  { handle: 'muk_suhyun', name: '먹수현', category: '음식' },
  { handle: 'yummy.mukstagram', name: '먹스타남남', category: '음식' },
  { handle: 'healthypig12', name: '헬시피그', category: '피트니스' },
  { handle: 'sol_magazine', name: 'SOL 매거진', category: '라이프스타일' },
  { handle: 'matzip_hyena', name: '맛집 하이에나', category: '음식' },
  { handle: 'dongs97', name: '동쓰맛집', category: '음식' },
  { handle: 'moonchelin.chef', name: '문슐랭의 맛집', category: '음식' },
  { handle: 's2yumyam', name: '먹스타', category: '음식' },
  { handle: 'honeymuksta', name: '허니 먹스타', category: '음식' },
  { handle: 'bbo_muksta', name: '뽀 먹스타그램', category: '음식' },
  { handle: 'zzang_mukk', name: '짱이의 먹스타', category: '음식' },
  { handle: 'hihee.e', name: '고남희 히희', category: '음식' },
  { handle: 'tastyroad_mong', name: '맛집몽', category: '음식' },
  { handle: 'muk_summary', name: '맛집 요약.zip', category: '음식' },
  { handle: '_foodmoa_', name: '푸드모아', category: '음식' },
  { handle: 'mat_bangee', name: '맛집방범대', category: '음식' },
  { handle: 'eunsomishungry', name: '은솜이즈헝그리', category: '음식' },
  { handle: 'so_yummyum', name: '쏘야미 먹스타그램', category: '음식' },
  { handle: 'todays_pick_', name: '오늘의픽', category: '음식' },
  { handle: 'missikaga', name: '미식가', category: '음식' },
  { handle: 'biteofyommy', name: '요미 먹스타그램', category: '음식' },
  { handle: 'food_writer_jw', name: '재슬램 가이드', category: '음식' },
  { handle: 'otter_minsudal', name: '민수달', category: '음식' },
  { handle: 'kim_nyamsik', name: '김남식 먹스타', category: '음식' },
  { handle: 'tallman189_el', name: '키다리멜', category: '음식' },
  { handle: 'chloe__story', name: '클로이 스토리', category: '라이프스타일' },
  { handle: 'hye_foodie_', name: '지혜푸디', category: '음식' },
  { handle: 'matpamine_', name: '맛파민', category: '음식' },
  { handle: '95.01.19', name: '육이 먹스타', category: '음식' },
  { handle: 'muk_.suzy_', name: '먹수지', category: '음식' },
  { handle: 'hyehwa.___.hankki', name: '혜화한끼', category: '음식' },
  { handle: 'sabuzak_it', name: '사분좌잇', category: '음식' },
  { handle: 'food._Jan', name: '푸드란', category: '음식' },
  { handle: 'misikmann', name: '미식맨', category: '음식' },
  { handle: 'hid_zip', name: '히든 데이트 맛집', category: '음식' },
  { handle: 'taste_goyang', name: '고양시 맛집', category: '음식' },
  { handle: 'mukja_muksta', name: '먹자 먹스타', category: '음식' },
  { handle: 'muckboeun', name: '먹보은', category: '음식' },
  { handle: 'hoon_yummy', name: '훈남의 맛집투어', category: '음식' }
]

// 배열 셔플 함수 (Fisher-Yates 알고리즘)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Instagram Business Discovery API로 프로필 정보 가져오기
async function fetchInstagramProfile(username: string) {
  try {
    const cleanUsername = username.replace('@', '').replace(/[._]/g, '')
    
    const url = `https://graph.facebook.com/v18.0/${businessAccountId}?fields=business_discovery.username(${cleanUsername}){username,name,biography,profile_picture_url,followers_count,media_count}&access_token=${instagramToken}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.business_discovery) {
      const profile = data.business_discovery
      return {
        profileImage: profile.profile_picture_url || null,
        realName: profile.name || null,
        bio: profile.biography || null,
        followers: profile.followers_count || 0
      }
    }
  } catch (error) {
    console.log(`    ⚠️  Instagram API 실패, 기본값 사용`)
  }
  
  return null
}

// 팔로워 수 및 참여율 생성 함수
function generateMetrics(index: number) {
  const seed = index + 1
  const followerRanges = [
    { min: 10000, max: 50000 },
    { min: 50000, max: 100000 },
    { min: 100000, max: 200000 },
    { min: 200000, max: 500000 }
  ]
  
  const range = followerRanges[seed % followerRanges.length]
  const followers = Math.floor(range.min + Math.random() * (range.max - range.min))
  const engagementRate = Number((2 + Math.random() * 8).toFixed(1))
  
  return { followers, engagementRate }
}

// 위치 랜덤 생성
function getRandomLocation() {
  const locations = ['서울', '경기', '부산', '대구', '인천', '광주', '대전', '울산', '제주']
  return locations[Math.floor(Math.random() * locations.length)]
}

// 기존 프로필 사진 확인
async function checkExistingProfileImage(userId: string) {
  const { data } = await supabase
    .from('influencers')
    .select('profile_image')
    .eq('user_id', userId)
    .single()
  
  // ui-avatars.com 이면 프로필 사진이 없는 것으로 판단
  if (data?.profile_image && data.profile_image.includes('ui-avatars.com')) {
    return null
  }
  
  return data?.profile_image
}

async function seedInfluencers() {
  console.log('🚀 인플루언서 회원가입 (프로필 사진 포함) 시작...')
  console.log(`📍 환경: ${supabaseUrl}`)
  console.log('🖼️  Instagram 프로필 사진 가져오기 활성화')
  console.log('🎲 랜덤 순서 처리 모드')
  console.log('========================================\n')
  
  // 배열을 실행시마다 랜덤하게 섞기
  const randomAccounts = shuffleArray(instagramAccounts)
  console.log('🔀 계정 순서가 랜덤하게 섞였습니다.')
  console.log(`첫 5개 계정: ${randomAccounts.slice(0, 5).map(a => '@' + a.handle).join(', ')}\n`)
  
  let successCount = 0
  let errorCount = 0
  let skipCount = 0
  let photoCount = 0
  let updatePhotoCount = 0
  
  for (let i = 0; i < randomAccounts.length; i++) {
    const account = randomAccounts[i]
    const location = getRandomLocation()
    
    try {
      // @ 제거 및 특수문자 처리
      const cleanHandle = account.handle.replace('@', '').toLowerCase()
      
      // 임시 이메일 생성
      const tempEmail = `${cleanHandle.replace(/[^a-z0-9]/g, '')}@temp.instagram.com`
      const password = '123456'
      
      console.log(`[${i + 1}/${randomAccounts.length}] @${cleanHandle}`)
      
      // Instagram 프로필 정보 가져오기
      console.log(`  🔍 Instagram 프로필 조회 중...`)
      const instagramData = await fetchInstagramProfile(cleanHandle)
      
      let profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&background=51a66f&color=fff&size=200&rounded=true`
      let followers = generateMetrics(i).followers
      let bio = `${account.category} 전문 크리에이터 | ${location} | 일상을 특별하게`
      
      if (instagramData) {
        if (instagramData.profileImage) {
          profileImage = instagramData.profileImage
          console.log(`  ✓ Instagram 프로필 사진 발견!`)
        }
        if (instagramData.followers > 0) {
          followers = instagramData.followers
        }
        if (instagramData.bio) {
          bio = instagramData.bio.substring(0, 500)
        }
        if (instagramData.realName) {
          account.name = instagramData.realName
        }
      }
      
      const engagementRate = Number((2 + Math.random() * 8).toFixed(1))
      
      console.log(`  📧 ${tempEmail}`)
      
      // 1. 회원가입 시도
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: password,
        options: {
          data: {
            instagram_handle: cleanHandle,
            user_type: 'influencer',
            profile_image: profileImage
          }
        }
      })
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`  ⏭️  이미 등록됨 - 프로필 확인 중...`)
          skipCount++
          
          // 기존 계정 로그인
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: tempEmail,
            password: password
          })
          
          if (signInData?.user) {
            // 기존 프로필 사진 확인
            const existingImage = await checkExistingProfileImage(signInData.user.id)
            
            if (!existingImage && instagramData?.profileImage) {
              // 프로필 사진이 없거나 기본 이미지인 경우 업데이트
              console.log(`  🖼️  프로필 사진 없음 - 업데이트 중...`)
              
              const { error: updateError } = await supabase
                .from('influencers')
                .update({
                  profile_image: profileImage,
                  bio: bio,
                  followers_count: followers,
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', signInData.user.id)
              
              if (!updateError) {
                console.log(`  ✓ 프로필 사진 업데이트 완료!`)
                updatePhotoCount++
              } else {
                console.log(`  ✗ 업데이트 실패:`, updateError.message)
              }
            } else if (existingImage) {
              console.log(`  ✓ 이미 프로필 사진 있음`)
              
              // 팔로워 수와 bio만 업데이트
              await supabase
                .from('influencers')
                .update({
                  followers_count: followers,
                  bio: bio,
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', signInData.user.id)
            } else {
              console.log(`  ⚠️  Instagram에서 프로필 사진을 가져올 수 없음`)
            }
          }
          
          continue
        } else {
          console.error(`  ✗ 회원가입 실패:`, authError.message)
          errorCount++
          continue
        }
      }
      
      if (!authData.user) {
        throw new Error('회원가입에 실패했습니다')
      }
      
      const userId = authData.user.id
      console.log(`  ✓ 회원가입 성공`)
      
      // 2. users 테이블에 추가
      await supabase.from('users').insert([
        {
          user_id: userId,
          user_type: 'influencer',
          name: account.name
        }
      ])
      
      // 3. influencers 테이블에 추가
      const { error: influencerError } = await supabase
        .from('influencers')
        .insert([
          {
            user_id: userId,
            instagram_handle: cleanHandle,
            name: account.name,
            bio: bio,
            category: account.category,
            location: location,
            followers_count: followers,
            engagement_rate: engagementRate,
            is_verified: followers > 100000,
            is_active: true,
            profile_image: profileImage,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
      
      if (influencerError) {
        console.error(`  ✗ Influencers 테이블:`, influencerError.message)
        errorCount++
      } else {
        console.log(`  ✓ 프로필 생성 완료`)
        console.log(`     팔로워: ${followers.toLocaleString()} | ${location}`)
        if (instagramData?.profileImage) {
          console.log(`     🖼️  실제 프로필 사진 적용됨`)
          photoCount++
        }
        successCount++
      }
      
    } catch (error: any) {
      console.error(`  ✗ 오류:`, error.message)
      errorCount++
    }
    
    // API 제한 방지
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n========================================')
  console.log(`✅ 완료!`)
  console.log(`  신규 가입: ${successCount}`)
  console.log(`  기존 계정: ${skipCount}`)
  console.log(`  실패: ${errorCount}`)
  console.log(`  🖼️  새로 추가된 프로필 사진: ${photoCount}개`)
  console.log(`  🖼️  업데이트된 프로필 사진: ${updatePhotoCount}개`)
  console.log('\n📱 테스트 로그인:')
  console.log(`  아이디: 인스타그램 핸들 (@ 제외)`)
  console.log(`  비밀번호: 123456`)
  console.log('\n예시:')
  console.log(`  ${randomAccounts[0].handle} / 123456`)
  console.log(`  ${randomAccounts[1].handle} / 123456`)
  console.log('========================================')
}

// 실행
seedInfluencers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })