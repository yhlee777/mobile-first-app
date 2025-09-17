const accessToken = 'EAAKbCcZC3EDMBPfAvmNiGoxRUNCU5vVxP5SZBRCIyPzZCyZC2j2RSTm8KzzyOwC1miIs6lr5MZCpZAyq4ytrNxLIKSR5PHzrw3LsgSwH2KfJznNZCJeGAqNgpdKo2AvE6J0yJzXQrTG7KZCpZAyVcydQwZB6U1pZCOlH5kessOwD476zBO1iZAi7QWSfieOZAT1C0';

async function getInstagramBusinessAccountId() {
  try {
    // 1. 먼저 연결된 페이지 찾기
    console.log('1. Facebook 페이지 찾는 중...');
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    );
    const pagesData = await pagesResponse.json();
    
    if (pagesData.error) {
      console.error('Pages Error:', pagesData.error);
      return;
    }
    
    console.log('연결된 페이지:', pagesData.data?.map(p => ({ 
      name: p.name, 
      id: p.id 
    })));
    
    // 2. 각 페이지의 Instagram Business Account 확인
    for (const page of pagesData.data || []) {
      console.log(`\n2. "${page.name}" 페이지의 Instagram 계정 확인 중...`);
      
      const igResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token || accessToken}`
      );
      const igData = await igResponse.json();
      
      if (igData.instagram_business_account) {
        console.log('✅ Instagram Business Account ID 발견!');
        console.log('Page Name:', page.name);
        console.log('Page ID:', page.id);
        console.log('Instagram Business Account ID:', igData.instagram_business_account.id);
        console.log('Page Access Token:', page.access_token);
        
        // 3. Instagram 계정 정보 가져오기
        const igInfoResponse = await fetch(
          `https://graph.facebook.com/v18.0/${igData.instagram_business_account.id}?fields=name,username,followers_count,media_count,profile_picture_url&access_token=${page.access_token || accessToken}`
        );
        const igInfo = await igInfoResponse.json();
        
        if (!igInfo.error) {
          console.log('\n📱 Instagram 계정 정보:');
          console.log('Username:', igInfo.username);
          console.log('Name:', igInfo.name);
          console.log('Followers:', igInfo.followers_count);
          console.log('Posts:', igInfo.media_count);
        }
        
        return {
          instagramBusinessAccountId: igData.instagram_business_account.id,
          pageAccessToken: page.access_token || accessToken
        };
      }
    }
    
    console.log('\n❌ Instagram Business Account를 찾을 수 없습니다.');
    console.log('Instagram이 Facebook 페이지와 연결되어 있는지 확인하세요.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// 실행
getInstagramBusinessAccountId().then(result => {
  if (result) {
    console.log('\n=================================');
    console.log('🎉 .env.local에 추가할 값:');
    console.log('=================================');
    console.log(`INSTAGRAM_ACCESS_TOKEN=${result.pageAccessToken}`);
    console.log(`INSTAGRAM_BUSINESS_ACCOUNT_ID=${result.instagramBusinessAccountId}`);
  }
});