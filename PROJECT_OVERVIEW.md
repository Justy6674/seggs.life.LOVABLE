# 🔥 SEGGS.LIFE - PROJECT OVERVIEW

## 🎯 **WHAT IS SEGGS.LIFE?**

**Blueprint-Powered Intimacy Idea Engine** - The first AI app that generates endless personalized intimate suggestions based on couples' unique erotic blueprint combinations.

**User Question:** *"What should we try tonight?"*  
**App Answer:** *"Here's something perfect for your Energetic+Kinky combination..."*

---

## 🚀 **CURRENT APP STATE & FLOW**

### **✅ WHAT'S BUILT & WORKING**

**1. Solo-Friendly Onboarding Flow**
- Individual takes 40-question Erotic Blueprint Quiz
- Gets immediate results (primary/secondary blueprint)
- **Choice Point**: "Invite Partner" OR "Explore Solo First"
- Solo mode: Can predict partner's blueprint for combined suggestions

**2. Core Blueprint System**
- 5 Blueprint Types: Sensual, Sexual, Energetic, Kinky, Shapeshifter
- Individual analysis and couple combination insights
- CombinedAnalysisHero component (270 lines) - 1-click blueprint access

**3. AI Suggestion Engine**
- OpenAI GPT-4 integration via IntimacyActionsService
- 19 intimacy categories currently (need 1 more for 20 total)
- Blueprint-aware suggestion generation
- Heat level customization (Sweet → Wild)

**4. Dashboard & Navigation**
- Home page with solo-friendly messaging
- ContextHeader with navigation to all key pages
- Responsive design with Tailwind CSS

**5. Key Pages Built**
- `/blueprint` - Blueprint quiz and results
- `/understanding-partner` - Partner analysis (505 lines)
- `/relationship-insights` - AI insights (398 lines)  
- `/our-connection` - Living document (432 lines)
- `/relationship-timeline` - Evolution tracking
- `/weekly-insights` - Ongoing AI coaching
- `/monthly-checkin` - Progress tracking

**6. Supporting Systems**
- ProactiveCheckInSystem (155 lines) - Smart timing
- SmartMessagingSystem (175+ lines) - Engagement-aware
- GentleReEntryFlow - Asymmetric engagement handling
- PartnerSpecificContentStreams - Personalized content

---

## 🔧 **TECHNICAL STACK**

**Frontend**
- Next.js 15.3.3 with TypeScript
- Tailwind CSS for styling
- Custom components (no external UI library)
- Responsive mobile-first design

**Backend & AI**  
- Supabase (PostgreSQL database)
- OpenAI GPT-4 for AI suggestions
- Next.js API routes
- Vercel deployment

**Authentication**
- Supabase Auth
- Couple account linking system
- Privacy-first approach

---

## ⚠️ **CURRENT TECHNICAL ISSUES**

**1. Multiple Dev Servers**
- Ports 3000-3008 all in use due to conflicts
- Need to consolidate to single instance

**2. Build Warnings**
- Duplicate boudoir page (page.js vs page.tsx)
- Missing useAuth hook in AppLayout.tsx (but compiles successfully)

**3. File Structure**
- Some duplicate/legacy files need cleanup
- Navigation components spread across multiple files

---

## 🎯 **THE 20 INTIMACY CATEGORIES** (Core Feature)

**Currently: 19 categories exist, need 1 more**

**🔥 Physical Intimacy (5)**
- Sensual Touch & Massage
- Physical Challenges & Games  
- Temperature & Sensation Play
- Creative Positioning & Spaces
- *[Need 1 more - likely "Playful Wrestling" or "Body Exploration"]*

**💭 Mental & Emotional (5)**
- Deep Conversation Starters
- Fantasy & Roleplay Scenarios
- Truth Games & Dares
- Emotional Vulnerability Exercises
- Communication & Intimacy

**🎨 Creative & Playful (4)**
- Surprise & Spontaneity Ideas
- Creative Date Concepts  
- Food & Beverage Experiences
- Art & Music Integration

**⚡ Advanced & Experimental (3)**
- Power Dynamics & Control
- Costume & Roleplay Props
- Technology Integration

**🌟 Spiritual & Connection (2)**
- Mindfulness & Presence
- Tantric & Sacred Practices

---

## 🗺️ **USER JOURNEY FLOW**

```
🚀 ONBOARDING
┌─ User arrives at seggs.life
├─ Takes Blueprint Quiz (40 questions)
├─ Gets Results + Primary/Secondary Blueprint
└─ CHOICE POINT:
   ├─ "Invite Partner" → Couple Mode
   └─ "Explore Solo" → Solo Mode w/ Partner Prediction

💡 CORE EXPERIENCE  
┌─ Dashboard: "Tonight's Suggestion" 
├─ Browse 20 Categories
├─ "Surprise Me" Random Generator
├─ Save Favorites & Collections
└─ Track "Love it" / "Not for us"

🤖 AI INTELLIGENCE
┌─ Blueprint-Aware Suggestions
├─ Heat Level Customization  
├─ Learning from Feedback
└─ Never-Repeat System

👥 COUPLE EVOLUTION
┌─ Partner Joins → Enhanced Dual-Blueprint
├─ Couple's Compatibility Analysis
├─ Shared Discovery Journey  
└─ Joint Favorites & Milestones
```

---

## 🎯 **IMMEDIATE PRIORITIES** (From TODO.md)

**Week 1: Core Engine Fixes**
1. ☐ Fix duplicate boudoir page warning
2. ☐ Complete 20th intimacy category
3. ☐ Enhance AI to use BOTH partner blueprints
4. ☐ Kill multiple dev servers (use single port)

**Week 2: Blueprint Integration**
1. ☐ Make dashboard blueprint-combination-centered
2. ☐ Create `/blueprint-combo` dedicated page
3. ☐ Build endless refresh system
4. ☐ Add heat level progression

**Weeks 3-4: Idea Engine Polish**
1. ☐ Advanced AI personalization
2. ☐ Category browsing with blueprint filtering
3. ☐ Favorites collections by category
4. ☐ Success tracking and analytics

---

## 💰 **BUSINESS MODEL**

**Revenue:** $25/month premium subscription  
**Free Tier:** Blueprint quiz + 3 suggestions/week  
**Premium:** Unlimited AI suggestions + advanced features

**Unit Economics:**
- COGS: ~$0.65/user/month (mostly OpenAI)
- Gross Margin: 97%+
- Target LTV: $300+ per couple

---

## 🎨 **BRAND & POSITIONING**

**Tagline:** *"What should we try tonight? AI knows."*  
**Positioning:** The intimacy idea generator couples return to weekly  
**Tone:** Personalized, exciting, never crude  
**Voice:** *"Here's something perfect for you two..."*

**Design:**
- Sophisticated gray/beige/red palette
- Cormorant Garamond typography
- Clean, elegant, therapeutic feel

---

## 🔥 **SUCCESS VISION**

**User Behavior:** Couples opening the app 3x/week asking *"What's new for us?"*  
**Core Value:** Never running out of fresh, personalized intimate ideas  
**Differentiation:** Blueprint-powered personalization that actually works  
**Market:** The "Netflix for intimacy ideas" - endless, curated, personal 