const admin = require('firebase-admin');

// Initialize Firebase Admin using service account from env
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || '{}');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'seggs-life'
  });
}

const db = admin.firestore();

async function fixCoupleLink() {
  try {
    console.log('🔍 Finding your user accounts...');
    
    // Get all users to find Leo and Marcus
    const usersSnapshot = await db.collection('users').get();
    let leoUser = null;
    let marcusUser = null;
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const displayName = userData.displayName?.toLowerCase() || '';
      const email = userData.email?.toLowerCase() || '';
      
      if (displayName.includes('leo') || email.includes('leo')) {
        leoUser = { id: doc.id, ...userData };
        console.log('📋 Found Leo:', doc.id, userData.email);
      }
      if (displayName.includes('marcus') || email.includes('marcus')) {
        marcusUser = { id: doc.id, ...userData };
        console.log('📋 Found Marcus:', doc.id, userData.email);
      }
    });
    
    if (!leoUser || !marcusUser) {
      console.log('❌ Could not find both user accounts');
      console.log('Leo found:', !!leoUser);
      console.log('Marcus found:', !!marcusUser);
      
      // List all users for debugging
      console.log('\n📋 All users in database:');
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        console.log(`  ${doc.id}: ${userData.displayName || 'No name'} (${userData.email})`);
      });
      return;
    }
    
    console.log('✅ Found both users');
    console.log(`Leo: ${leoUser.id} (${leoUser.email})`);
    console.log(`Marcus: ${marcusUser.id} (${marcusUser.email})`);
    
    // Update the couple record with proper user IDs
    console.log('🔄 Updating couple record...');
    await db.collection('couples').doc('demoCouple_2').update({
      user1Id: leoUser.id,
      user2Id: marcusUser.id,
      userA: leoUser.displayName || 'Leo',
      userB: marcusUser.displayName || 'Marcus',
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    // Update both user records
    console.log('🔄 Linking users to couple...');
    await Promise.all([
      db.collection('users').doc(leoUser.id).update({
        partnerId: marcusUser.id,
        coupleId: 'demoCouple_2',
        updatedAt: admin.firestore.Timestamp.now()
      }),
      db.collection('users').doc(marcusUser.id).update({
        partnerId: leoUser.id,
        coupleId: 'demoCouple_2',
        updatedAt: admin.firestore.Timestamp.now()
      })
    ]);
    
    console.log('✅ Couple linking completed!');
    console.log('🎉 Both users should now have access to couple features');
    
    // Check Blueprint completion
    console.log('\n🔍 Checking Blueprint completion...');
    const leoBlueprint = leoUser.eroticBlueprintPrimary ? '✅' : '❌';
    const marcusBlueprint = marcusUser.eroticBlueprintPrimary ? '✅' : '❌';
    
    console.log(`Leo Blueprint: ${leoBlueprint}`);
    console.log(`Marcus Blueprint: ${marcusBlueprint}`);
    
    if (!leoUser.eroticBlueprintPrimary || !marcusUser.eroticBlueprintPrimary) {
      console.log('\n💡 Note: Both partners need to complete their Blueprint quizzes to access all couple features');
    }
    
  } catch (error) {
    console.error('❌ Error fixing couple link:', error);
  }
}

// Run if called directly
if (require.main === module) {
  fixCoupleLink().then(() => {
    console.log('🏁 Script completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = { fixCoupleLink }; 