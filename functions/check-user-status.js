const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || '{}');
admin.initializeApp({ 
  credential: admin.credential.cert(serviceAccount) 
});

const db = admin.firestore();

async function checkStatus() {
  try {
    console.log('🔍 Checking couple and user status...\n');
    
    // Check the couple we linked earlier
    const coupleDoc = await db.collection('couples').doc('demoCouple_2').get();
    console.log('📑 Couple Status:');
    if (coupleDoc.exists) {
      const data = coupleDoc.data();
      console.log('✅ Couple found!');
      console.log('   userA:', data.userA);
      console.log('   userB:', data.userB);
      console.log('   Status:', data.status);
    } else {
      console.log('❌ Couple document not found!');
    }
    
    // Check your user account
    console.log('\n👤 Your User Account:');
    const usersSnapshot = await db.collection('users').where('email', '==', 'downscaleweightloss@gmail.com').get();
    if (!usersSnapshot.empty) {
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log('✅ User found!');
        console.log('   ID:', doc.id);
        console.log('   Email:', data.email);
        console.log('   Display Name:', data.displayName);
        console.log('   Blueprint:', data.eroticBlueprintPrimary);
        console.log('   Partner ID:', data.partnerId);
        console.log('   Couple ID:', data.coupleId);
      });
    } else {
      console.log('❌ User account not found!');
    }
    
    // Check partner account too
    console.log('\n💕 Partner Account:');
    const partnerSnapshot = await db.collection('users').where('email', '==', 'b.burstow83@gmail.com').get();
    if (!partnerSnapshot.empty) {
      partnerSnapshot.forEach(doc => {
        const data = doc.data();
        console.log('✅ Partner found!');
        console.log('   ID:', doc.id);
        console.log('   Email:', data.email);
        console.log('   Display Name:', data.displayName);
        console.log('   Blueprint:', data.eroticBlueprintPrimary);
        console.log('   Partner ID:', data.partnerId);
        console.log('   Couple ID:', data.coupleId);
      });
    } else {
      console.log('❌ Partner account not found!');
    }
    
  } catch (error) {
    console.error('❌ Error checking status:', error);
  }
}

checkStatus().then(() => {
  console.log('\n✅ Status check complete');
  process.exit(0);
}); 