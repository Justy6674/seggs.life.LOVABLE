'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CombinedBlueprintAnalysis, CATEGORIES, type SuggestionRequest } from '@/lib/combinedBlueprintAnalysis';
import { UserService } from '@/lib/database';

export default function SuggestionsPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<'romantic' | 'soft' | 'daring' | 'erotic'>('romantic');
  const [suggestions, setSuggestions] = useState<{[key: string]: string}>({});
  const [loadingCategories, setLoadingCategories] = useState<{[key: string]: boolean}>({});
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
    }
  };

  const generateSuggestionForCategory = async (category: string) => {
    if (!userData?.eroticBlueprintPrimary) return;
    
    const partnerBlueprint = partnerData?.eroticBlueprintPrimary || predictedPartnerBlueprint;
    if (!partnerBlueprint) return;

    setLoadingCategories(prev => ({ ...prev, [category]: true }));
    
    const request: SuggestionRequest = {
      category,
      eroticLevel: selectedLevel,
      userBlueprint: userData.eroticBlueprintPrimary,
      partnerBlueprint: partnerBlueprint
    };

    const generatedSuggestion = await CombinedBlueprintAnalysis.generateSuggestion(request);
    setSuggestions(prev => ({ ...prev, [category]: generatedSuggestion }));
    setLoadingCategories(prev => ({ ...prev, [category]: false }));
  };

  const generateAllSuggestions = async () => {
    for (const category of CATEGORIES) {
      if (!suggestions[category]) {
        await generateSuggestionForCategory(category);
        // Small delay to avoid hitting API too hard
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
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

  const partnerBlueprint = partnerData?.eroticBlueprintPrimary || predictedPartnerBlueprint;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Personalized Suggestions
          </h1>
          <p className="text-lg text-gray-700">
            Your blueprint: <span className="font-semibold capitalize">{userData.eroticBlueprintPrimary}</span>
            {partnerBlueprint && (
              <span> • Partner: <span className="font-semibold capitalize">{partnerBlueprint}</span></span>
            )}
          </p>
        </div>

        {/* Partner Setup */}
        {!partnerBlueprint && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Partner Blueprint Required</h2>
            <p className="text-gray-700 mb-4">
              To get personalized suggestions, we need your partner's blueprint:
            </p>
            
            <select
              value={predictedPartnerBlueprint}
              onChange={(e) => setPredictedPartnerBlueprint(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 mb-4"
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
                <strong>Better accuracy:</strong> Send your partner the invite code so they can take the real assessment!
              </p>
              {userData.inviteCode && (
                <p className="text-blue-700 text-sm mt-2">
                  Your invite code: <strong>{userData.inviteCode}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {partnerBlueprint && (
          <>
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Erotic Creation Level:
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value as any);
                      setSuggestions({}); // Clear previous suggestions
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="romantic">🌹 Romantic - Sweet and loving</option>
                    <option value="soft">💕 Soft - Gentle and intimate</option>
                    <option value="daring">🔥 Daring - Adventurous and bold</option>
                    <option value="erotic">💋 Erotic - Intense and passionate</option>
                  </select>
                </div>
                
                <button
                  onClick={generateAllSuggestions}
                  className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 whitespace-nowrap"
                >
                  Generate All Suggestions
                </button>
              </div>
            </div>

            {/* 20 Category Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.map((category) => (
                <div key={category} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4">
                    <h3 className="text-xl font-bold text-white">{category}</h3>
                  </div>
                  
                  <div className="p-6">
                    {suggestions[category] ? (
                      <div className="text-gray-700 mb-4">
                        <p className="whitespace-pre-wrap">{suggestions[category]}</p>
                      </div>
                    ) : (
                      <div className="text-gray-500 mb-4 italic">
                        Click to generate a personalized suggestion for {category.toLowerCase()}
                      </div>
                    )}
                    
                    <button
                      onClick={() => generateSuggestionForCategory(category)}
                      disabled={loadingCategories[category]}
                      className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loadingCategories[category] ? 'Generating...' : 
                       suggestions[category] ? 'Generate New' : 'Get Suggestion'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Level Descriptions */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Erotic Creation Levels</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-pink-50 rounded-lg">
                  <h4 className="font-semibold text-pink-800">🌹 Romantic</h4>
                  <p className="text-pink-700">Sweet, loving, emotional connection focused</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800">💕 Soft</h4>
                  <p className="text-purple-700">Gentle, intimate, comfortable exploration</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800">🔥 Daring</h4>
                  <p className="text-red-700">Adventurous, bold, pushing boundaries</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-indigo-800">💋 Erotic</h4>
                  <p className="text-indigo-700">Intense, passionate, highly sexual</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 