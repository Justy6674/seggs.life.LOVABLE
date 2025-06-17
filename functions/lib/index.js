"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldNotifications = exports.onCoupleUpdate = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const generative_ai_1 = require("@google/generative-ai");
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Initialize Gemini AI
const genAI = new generative_ai_1.GoogleGenerativeAI(((_a = functions.config().gemini) === null || _a === void 0 ? void 0 : _a.api_key) || process.env.GEMINI_API_KEY || '');
/**
 * Triggered when a couple document is updated
 * Checks if both partners have completed their quizzes and generates analysis
 */
exports.onCoupleUpdate = functions.firestore
    .document('couples/{coupleId}')
    .onUpdate(async (change, context) => {
    const coupleId = context.params.coupleId;
    const afterData = change.after.data();
    console.log(`🔍 Couple update detected for ${coupleId}`);
    // Skip if analysis is already in progress or completed
    if (afterData.analysisInProgress || afterData.analysis) {
        console.log('⏭️ Analysis already in progress or completed, skipping...');
        return null;
    }
    // Check if both partners have completed their quizzes
    const { partnerA, partnerB } = afterData;
    if (!partnerA || !partnerB) {
        console.log('⏳ Waiting for both partners to complete their quizzes...');
        return null;
    }
    console.log('🎉 Both partners have completed! Starting analysis...');
    try {
        // Set analysis in progress flag to prevent duplicate runs
        await change.after.ref.update({
            analysisInProgress: true
        });
        // Get user data for both partners
        const [user1Doc, user2Doc] = await Promise.all([
            db.collection('users').doc(partnerA.userId).get(),
            db.collection('users').doc(partnerB.userId).get()
        ]);
        if (!user1Doc.exists || !user2Doc.exists) {
            throw new Error('User documents not found');
        }
        const user1Data = user1Doc.data();
        const user2Data = user2Doc.data();
        // Generate AI analysis
        const analysis = await generateCouplesAnalysis(Object.assign(Object.assign({}, partnerA), { name: user1Data.displayName || 'Partner A' }), Object.assign(Object.assign({}, partnerB), { name: user2Data.displayName || 'Partner B' }));
        // Save analysis to couple document
        await change.after.ref.update({
            analysis: analysis,
            analysisReady: true,
            analysisInProgress: admin.firestore.FieldValue.delete(),
            alerted: false
        });
        console.log('✅ Analysis generated and saved successfully');
        // Create notifications for both partners
        await Promise.all([
            createNotification(partnerA.userId, coupleId, user2Data.displayName || 'Your partner'),
            createNotification(partnerB.userId, coupleId, user1Data.displayName || 'Your partner')
        ]);
        console.log('📧 Notifications sent to both partners');
    }
    catch (error) {
        console.error('❌ Error generating couples analysis:', error);
        // Clear the in-progress flag if there's an error
        await change.after.ref.update({
            analysisInProgress: admin.firestore.FieldValue.delete()
        });
        throw error;
    }
    return null;
});
/**
 * Generate couples analysis using Gemini AI
 */
async function generateCouplesAnalysis(partnerA, partnerB) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `You are an expert relationship coach specializing in intimate connections and erotic blueprints. Create a warm, encouraging, and actionable couples compatibility analysis.

PARTNER A (${partnerA.name}):
- Primary Blueprint: ${partnerA.primaryBlueprint}
- Secondary Blueprint: ${partnerA.secondaryBlueprint || 'None strong'}
- Scores: Energetic(${partnerA.scores.energetic}), Sensual(${partnerA.scores.sensual}), Sexual(${partnerA.scores.sexual}), Kinky(${partnerA.scores.kinky}), Shapeshifter(${partnerA.scores.shapeshifter})

PARTNER B (${partnerB.name}):
- Primary Blueprint: ${partnerB.primaryBlueprint}
- Secondary Blueprint: ${partnerB.secondaryBlueprint || 'None strong'}
- Scores: Energetic(${partnerB.scores.energetic}), Sensual(${partnerB.scores.sensual}), Sexual(${partnerB.scores.sexual}), Kinky(${partnerB.scores.kinky}), Shapeshifter(${partnerB.scores.shapeshifter})

EROTIC BLUEPRINT REFERENCE:
- Energetic: Turned on by anticipation, tease, energy, space, slow build-up
- Sensual: Loves senses, touch, comfort, setting, emotional connection
- Sexual: Direct, visual, physical, straightforward, genital-focused
- Kinky: Taboo, power play, rules, boundaries, psychological games
- Shapeshifter: Variety, change, all of the above at different times

Please provide a JSON response with the following structure:
{
  "summary": "Brief overview of your combined connection profile and what makes you compatible",
  "sharedCompatibility": "Detailed analysis of your natural compatibility areas and how your blueprints complement each other",
  "partnerATips": "Specific advice for ${partnerA.name} on how to honor ${partnerB.name}'s blueprint",
  "partnerBTips": "Specific advice for ${partnerB.name} on how to honor ${partnerA.name}'s blueprint", 
  "exercises": ["3-4 specific intimate exercises you can try together this week"],
  "suggestions": ["3-4 conversation starters and ongoing relationship practices"],
  "revisitPrompt": "Encouraging message about checking back in and evolving together"
}

TONE: Warm, sex-positive, encouraging, non-judgmental, practical. Avoid clinical language. Make it feel like advice from a wise, supportive friend.`;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Parse JSON response
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        const analysisData = JSON.parse(cleanText);
        return {
            summary: analysisData.summary || 'Your unique blueprint combination creates beautiful opportunities for connection.',
            sharedCompatibility: analysisData.sharedCompatibility || 'You both bring wonderful qualities to your intimate relationship.',
            partnerATips: analysisData.partnerATips || `Tips for honoring your partner's ${partnerB.primaryBlueprint} blueprint`,
            partnerBTips: analysisData.partnerBTips || `Tips for honoring your partner's ${partnerA.primaryBlueprint} blueprint`,
            exercises: analysisData.exercises || ['Try a slow, sensual massage', 'Have an open conversation about desires', 'Plan a romantic evening together'],
            suggestions: analysisData.suggestions || ['Weekly check-ins about satisfaction', 'Take turns planning intimate time', 'Practice expressing desires openly'],
            generatedAt: admin.firestore.Timestamp.now(),
            revisitPrompt: analysisData.revisitPrompt || 'Remember that blueprints can evolve! Check back in regularly and keep growing together.'
        };
    }
    catch (error) {
        console.error('Error parsing AI response:', error);
        // Fallback analysis
        return {
            summary: `${partnerA.name} (${partnerA.primaryBlueprint}) and ${partnerB.name} (${partnerB.primaryBlueprint}) have completed their blueprints!`,
            sharedCompatibility: `Your different blueprint styles create opportunities to learn from and complement each other beautifully.`,
            partnerATips: `Honor ${partnerB.name}'s ${partnerB.primaryBlueprint} nature by taking time to understand what lights them up.`,
            partnerBTips: `Honor ${partnerA.name}'s ${partnerA.primaryBlueprint} nature by paying attention to their unique turn-on style.`,
            exercises: [
                'Share what you learned about each other from these results',
                'Try one activity that speaks to each of your primary blueprints',
                'Have a conversation about your most surprising results'
            ],
            suggestions: [
                'Use your blueprint results as a conversation starter',
                'Be curious about how your styles can complement each other',
                'Celebrate the unique ways you each experience pleasure'
            ],
            generatedAt: admin.firestore.Timestamp.now(),
            revisitPrompt: 'Your blueprints may evolve over time. Check back in with each other regularly!'
        };
    }
}
/**
 * Create a notification for a user when couples analysis is ready
 */
async function createNotification(userId, coupleId, partnerName) {
    const notificationData = {
        userId: userId,
        type: 'couple_analysis_ready',
        coupleId: coupleId,
        title: '💕 Your Couple Analysis is Ready!',
        message: `You and ${partnerName} have both completed your blueprints. Your personalized compatibility analysis is waiting for you!`,
        read: false,
        createdAt: admin.firestore.Timestamp.now(),
        actionUrl: `/couple-results/${coupleId}`,
        metadata: {
            partnerName: partnerName,
            type: 'initial_analysis'
        }
    };
    await db.collection('notifications').add(notificationData);
}
/**
 * Clean up old notifications (optional maintenance function)
 */
exports.cleanupOldNotifications = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
    const cutoffDate = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    );
    const oldNotifications = await db.collection('notifications')
        .where('createdAt', '<', cutoffDate)
        .where('read', '==', true)
        .get();
    const batch = db.batch();
    oldNotifications.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    if (!oldNotifications.empty) {
        await batch.commit();
        console.log(`🧹 Cleaned up ${oldNotifications.size} old notifications`);
    }
    return null;
});
//# sourceMappingURL=index.js.map