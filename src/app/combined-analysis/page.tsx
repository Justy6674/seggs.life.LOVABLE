'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CombinedBlueprintAnalysis, CATEGORIES, type BlueprintAnalysis, type SuggestionRequest } from '@/lib/combinedBlueprintAnalysis';
import { UserService } from '@/lib/database';

export default function CombinedAnalysisPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<BlueprintAnalysis | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<'romantic' | 'soft' | 'daring' | 'erotic'>('romantic');
  const [suggestion, setSuggestion] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [predictedPartnerBlueprint, setPredictedPartnerBlueprint] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    const userData = await UserService.getUser(user.uid);
    setUserData(userData);
    
    if (userData?.partnerId) {
      const partnerData = await UserService.getPartnerData(user.uid);
      setPartnerData(partnerData);
      
      if (userData.eroticBlueprintPrimary && partnerData?.eroticBlueprintPrimary) {
        const analysisResult = CombinedBlueprintAnalysis.analyzeCompatibility(
          userData.eroticBlueprintPrimary, 
          partnerData.eroticBlueprintPrimary
        );
        setAnalysis(analysisResult);
        await CombinedBlueprintAnalysis.saveAnalysis(user.uid, analysisResult);
      }
    }
  };

  const generateSuggestion = async () => {
    if (!userData?.eroticBlueprintPrimary) return;
    
    const partnerBlueprint = partnerData?.eroticBlueprintPrimary || predictedPartnerBlueprint;
    if (!partnerBlueprint || !selectedCategory) return;

    setLoading(true);
    
    const request: SuggestionRequest = {
      category: selectedCategory,
      eroticLevel: selectedLevel,
      userBlueprint: userData.eroticBlueprintPrimary,
      partnerBlueprint: partnerBlueprint
    };

    const generatedSuggestion = await CombinedBlueprintAnalysis.generateSuggestion(request);
    setSuggestion(generatedSuggestion);
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to continue</h2>
        </div>
      </div>
    );
  }

  if (!userData?.eroticBlueprintPrimary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete your blueprint assessment first</h2>
          <a href="/assessment" className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700">
            Take Assessment
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Combined Blueprint Analysis
          </h1>
          <p className="text-lg text-gray-700">
            Your blueprint: <span className="font-semibold capitalize">{userData.eroticBlueprintPrimary}</span>
          </p>
        </div>

        {/* Partner Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {partnerData?.eroticBlueprintPrimary ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Partner Connected!</h2>
              <p className="text-lg text-gray-700 mb-6">
                Partner blueprint: <span className="font-semibold capitalize">{partnerData.eroticBlueprintPrimary}</span>
              </p>
              
              {analysis && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-green-600 mb-3">
                      Compatibility: {analysis.compatibility}%
                    </h3>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">What Works:</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {analysis.whatWorks.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">How to Proceed:</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {analysis.howToProceed.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Strengths:</h4>
                      <ul className="list-disc list-inside text-green-700 space-y-1">
                        {analysis.strengths.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Partner Blueprint</h2>
              <p className="text-gray-700 mb-4">
                Your partner hasn't taken the assessment yet. You can predict their blueprint to get suggestions:
              </p>
              
              <div className="space-y-4">
                <select
                  value={predictedPartnerBlueprint}
                  onChange={(e) => setPredictedPartnerBlueprint(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select predicted partner blueprint</option>
                  <option value="energetic">Energetic - Loves anticipation and buildup</option>
                  <option value="sensual">Sensual - Needs beauty and all senses engaged</option>
                  <option value="sexual">Sexual - Direct body appreciation and enthusiasm</option>
                  <option value="kinky">Kinky - Craves taboo and power dynamics</option>
                  <option value="shapeshifter">Shapeshifter - Variety and exploration</option>
                </select>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Tip:</strong> Send your partner the invite code to get their actual blueprint for better accuracy!
                  </p>
                  {userData.inviteCode && (
                    <p className="text-blue-700 text-sm mt-2">
                      Your invite code: <strong>{userData.inviteCode}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Generator */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Personalized Suggestions</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Erotic Level:
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="romantic">Romantic - Sweet and loving</option>
                <option value="soft">Soft - Gentle and intimate</option>
                <option value="daring">Daring - Adventurous and bold</option>
                <option value="erotic">Erotic - Intense and passionate</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={generateSuggestion}
            disabled={loading || !selectedCategory || (!partnerData?.eroticBlueprintPrimary && !predictedPartnerBlueprint)}
            className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Get Suggestion'}
          </button>
          
          {suggestion && (
            <div className="mt-6 bg-pink-50 border border-pink-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-pink-800 mb-3">
                Your Personalized Suggestion:
              </h3>
              <div className="text-pink-700 whitespace-pre-wrap">
                {suggestion}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 