const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seed() {
  // User profile (1st example doc)
  await db.collection("users").doc("exampleUser").set({
    email: "test@example.com",
    displayName: "Example User",
    partnerId: "examplePartner",
    onboardingComplete: false,
    createdAt: new Date()
  });

  // Couples (pair of users linked)
  await db.collection("couples").doc("exampleCouple").set({
    userA: "exampleUser",
    userB: "examplePartner",
    status: "active",
    heatLevel: "flirty",
    boundaries: ["no public", "no photos"],
    createdAt: new Date()
  });

  // Prompts (AI/curated content)
  await db.collection("prompts").add({
    category: "flirty",
    promptType: "text",
    prompt: "Send your partner a cheeky compliment.",
    createdAt: new Date()
  });

  // Boundaries (per couple)
  await db.collection("boundaries").add({
    coupleId: "exampleCouple",
    safeWord: "pineapple",
    bannedTopics: ["ex-partners"],
    createdAt: new Date()
  });

  // Memories (shared by couple)
  await db.collection("memories").add({
    coupleId: "exampleCouple",
    memory: "First steamy date night",
    createdAt: new Date()
  });

  // Streaks/rewards (gamified)
  await db.collection("streaks").add({
    coupleId: "exampleCouple",
    daysActive: 5,
    lastPromptCompleted: new Date()
  });

  console.log("🔥 Firestore seeded with starter collections and docs.");
  process.exit();
}

seed();
