const accessToken = 'EAAKbCcZC3EDMBPfAvmNiGoxRUNCU5vVxP5SZBRCIyPzZCyZC2j2RSTm8KzzyOwC1miIs6lr5MZCpZAyq4ytrNxLIKSR5PHzrw3LsgSwH2KfJznNZCJeGAqNgpdKo2AvE6J0yJzXQrTG7KZCpZAyVcydQwZB6U1pZCOlH5kessOwD476zBO1iZAi7QWSfieOZAT1C0';
const igBusinessAccountId = '17841476342964177';

// 테스트할 인스타그램 계정들 (공개 비즈니스 계정)
const testAccounts = ['nike', 'adidas', 'samsung', 'cristiano'];

async function testBusinessDiscovery(username) {
  const url = `https://graph.facebook.com/v18.0/${igBusinessAccountId}`;
  const params = new URLSearchParams({
    fields: `business_discovery.username(${username}){
      username,
      website,
      name,
      ig_id,
      id,
      profile_picture_url,
      biography,
      follows_count,
      followers_count,
      media_count,
      media{
        id,
        caption,
        like_count,
        comments_count,
        media_type,
        media_url,
        permalink,
        thumbnail_url,
        timestamp,
        username
      }
    }`,
    access_token: accessToken
  });

  try {
    console.log(`\n🔍 조회 중: @${username}`);
    const response = await fetch(`${url}?${params}`);
    const data = await response.json();
    
    if (data.error) {
      console.error(`❌ Error for @${username}:`, data.error.message);
      return null;
    }
    
    if (data.business_discovery) {
      const discovery = data.business_discovery;
      console.log(`✅ 성공!`);
      console.log(`  - Name: ${discovery.name}`);
      console.log(`  - Followers: ${discovery.followers_count?.toLocaleString()}`);
      console.log(`  - Posts: ${discovery.media_count}`);
      
      if (discovery.media?.data?.length > 0) {
        const posts = discovery.media.data.slice(0, 3);
        const totalLikes = posts.reduce((sum, post) => sum + (post.like_count || 0), 0);
        const avgLikes = Math.round(totalLikes / posts.length);
        console.log(`  - Avg Likes (recent 3): ${avgLikes.toLocaleString()}`);
      }
      
      return discovery;
    }
  } catch (error) {
    console.error(`❌ Request failed for @${username}:`, error.message);
  }
  
  return null;
}

async function runTests() {
  console.log('🚀 Instagram Business Discovery API 테스트');
  console.log('=========================================');
  
  let successCount = 0;
  
  for (const username of testAccounts) {
    const result = await testBusinessDiscovery(username);
    if (result) successCount++;
    
    // API 제한 피하기 위해 1초 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=========================================');
  console.log(`📊 결과: ${successCount}/${testAccounts.length} 계정 조회 성공`);
  
  if (successCount > 0) {
    console.log('\n✨ Instagram API 연동 성공!');
    console.log('이제 앱에서 실제 인스타그램 데이터를 볼 수 있습니다.');
  } else {
    console.log('\n⚠️  API 연동 확인 필요');
    console.log('- Business Discovery 권한이 있는지 확인하세요');
    console.log('- 앱이 개발 모드인 경우 일부 제한이 있을 수 있습니다');
  }
}

// 테스트 실행
runTests();