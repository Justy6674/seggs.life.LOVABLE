'use client';

import { useState, useEffect } from 'react';
import { Heart, Download, Share2, RefreshCw, Users, TrendingUp } from 'lucide-react';

interface BlueprintScore {
  sensual: number;
  sexual: number;
  energetic: number;
  kinky: number;
  shapeshifter: number;
}

interface BlueprintResultsProps {
  userResult: BlueprintScore & {
    dominantType: string;
    completedAt: Date;
  };
  partnerResult?: BlueprintScore & {
    dominantType: string;
    completedAt: Date;
  };
  userName?: string;
  partnerName?: string;
}

const blueprintDescriptions = {
  sensual: {
    title: "Sensual",
    color: "bg-green-500",
    description: "You connect through the five senses - touch, taste, smell, sight, and sound. Slow, deliberate experiences fuel your passion."
  },
  sexual: {
    title: "Sexual", 
    color: "bg-red-500",
    description: "You're turned on by the sexual - nudity, genitals, and sexual activities. Direct and straightforward intimacy appeals to you."
  },
  energetic: {
    title: "Energetic",
    color: "bg-purple-500", 
    description: "You're aroused by anticipation, space, and longing. The buildup and energy between you and your partner is everything."
  },
  kinky: {
    title: "Kinky",
    color: "bg-orange-500",
    description: "You're turned on by the taboo, psychological play, and pushing boundaries. Variety and exploration drive your passion."
  },
  shapeshifter: {
    title: "Shapeshifter",
    color: "bg-blue-500",
    description: "You can be turned on by all the types, depending on your mood, partner, and situation. Adaptability is your strength."
  }
};

export function BlueprintResults({ userResult, partnerResult, userName = "You", partnerName = "Partner" }: BlueprintResultsProps) {
  const [activeTab, setActiveTab] = useState<'individual' | 'couple'>('individual');
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (partnerResult) {
      setShowComparison(true);
    }
  }, [partnerResult]);

  const calculateCompatibility = () => {
    if (!partnerResult) return 0;
    
    const types = ['sensual', 'sexual', 'energetic', 'kinky', 'shapeshifter'] as const;
    let totalDifference = 0;
    
    types.forEach(type => {
      totalDifference += Math.abs(userResult[type] - partnerResult[type]);
    });
    
    // Convert to compatibility percentage (lower difference = higher compatibility)
    const compatibility = Math.max(0, 100 - (totalDifference / 5));
    return Math.round(compatibility);
  };

  const getTopThreeTypes = (scores: BlueprintScore) => {
    const types = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    return types;
  };

  const generateInsights = () => {
    const compatibility = calculateCompatibility();
    const userTop = getTopThreeTypes(userResult);
    const partnerTop = partnerResult ? getTopThreeTypes(partnerResult) : [];
    
    const insights = [];
    
    if (partnerResult) {
      if (compatibility >= 80) {
        insights.push("🔥 Excellent compatibility! You share very similar intimacy preferences.");
      } else if (compatibility >= 60) {
        insights.push("💫 Good compatibility with exciting differences to explore together.");
      } else {
        insights.push("🌟 Your differences create opportunities for growth and discovery.");
      }
      
      // Find common top types
      const commonTypes = userTop.filter(([userType]) => 
        partnerTop.some(([partnerType]) => partnerType === userType)
      );
      
      if (commonTypes.length > 0) {
        insights.push(`💝 You both resonate strongly with ${commonTypes[0][0]} experiences.`);
      }
    }
    
    // Individual insights
    if (userResult.dominantType === 'shapeshifter') {
      insights.push("🦋 As a Shapeshifter, you have the gift of versatility in intimacy.");
    }
    
    return insights;
  };

  const handleDownloadResults = () => {
    // This would generate and download a PDF report
    console.log('Downloading blueprint results...');
  };

  const handleShareResults = () => {
    // This would open sharing options
    console.log('Sharing blueprint results...');
  };

  const handleRetakeQuiz = () => {
    // This would navigate back to the quiz
    console.log('Retaking quiz...');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="bg-gradient-to-r from-primary to-accent w-20 h-20 rounded-full flex items-center justify-center mx-auto">
          <Heart className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-slate-900">
          Your Erotic Blueprint Results
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Discover your unique intimacy profile and learn how to deepen connection with your partner
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleDownloadResults}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download PDF</span>
        </button>
        <button
          onClick={handleShareResults}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          <span>Share Results</span>
        </button>
        <button
          onClick={handleRetakeQuiz}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retake Quiz</span>
        </button>
      </div>

      {/* Tabs */}
      {partnerResult && showComparison && (
        <div className="bg-white rounded-lg p-1 border border-slate-200 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab('individual')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'individual'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Individual Results
            </button>
            <button
              onClick={() => setActiveTab('couple')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'couple'
                  ? 'bg-primary text-white' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Couple Analysis
            </button>
          </div>
        </div>
      )}

      {activeTab === 'individual' ? (
        <>
          {/* Individual Results */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                Your Dominant Type: {userResult.dominantType}
              </h2>
              <p className="text-slate-600">
                {blueprintDescriptions[userResult.dominantType.toLowerCase() as keyof typeof blueprintDescriptions]?.description}
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-6">
              {Object.entries(userResult).map(([key, value]) => {
                if (key === 'dominantType' || key === 'completedAt') return null;
                const blueprintKey = key as keyof typeof blueprintDescriptions;
                const blueprint = blueprintDescriptions[blueprintKey];
                
                return (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${blueprint.color}`}></div>
                        <span className="font-medium text-slate-900">{blueprint.title}</span>
                      </div>
                      <span className="text-2xl font-bold text-slate-900">{value}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${blueprint.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-slate-600 pl-7">
                      {blueprint.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personalized Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-6">
              Personalized Recommendations
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">For Your {userResult.dominantType} Type:</h4>
                <p className="text-sm text-slate-600">
                  Focus on activities that align with your dominant blueprint while gradually exploring other types to expand your pleasure palette.
                </p>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Growth Opportunity:</h4>
                <p className="text-sm text-slate-600">
                  Consider exploring your lowest-scoring type to discover new dimensions of intimacy and pleasure.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Couple Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-serif font-bold text-slate-900">Couple Compatibility</h2>
              </div>
              <div className="text-6xl font-bold text-primary mb-2">
                {calculateCompatibility()}%
              </div>
              <p className="text-slate-600">Overall Compatibility Score</p>
            </div>

            {/* Side by Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-serif font-semibold text-slate-900 mb-4 text-center">
                  {userName}
                </h3>
                <div className="space-y-3">
                  {Object.entries(userResult).map(([key, value]) => {
                    if (key === 'dominantType' || key === 'completedAt') return null;
                    const blueprintKey = key as keyof typeof blueprintDescriptions;
                    const blueprint = blueprintDescriptions[blueprintKey];
                    
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{blueprint.title}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${blueprint.color}`}
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8">{value}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {partnerResult && (
                <div>
                  <h3 className="text-lg font-serif font-semibold text-slate-900 mb-4 text-center">
                    {partnerName}
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(partnerResult).map(([key, value]) => {
                      if (key === 'dominantType' || key === 'completedAt') return null;
                      const blueprintKey = key as keyof typeof blueprintDescriptions;
                      const blueprint = blueprintDescriptions[blueprintKey];
                      
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{blueprint.title}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${blueprint.color}`}
                                style={{ width: `${value}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{value}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-6">
              <h4 className="font-serif font-semibold text-slate-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Relationship Insights
              </h4>
              <div className="space-y-3">
                {generateInsights().map((insight, index) => (
                  <p key={index} className="text-slate-700">
                    {insight}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Couple Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-6">
              Recommendations for Your Relationship
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Shared Strengths</h4>
                <p className="text-sm text-green-700">
                  Focus on your common blueprint elements to build deeper intimacy and connection.
                </p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Growth Areas</h4>
                <p className="text-sm text-blue-700">
                  Explore each other's different blueprint types to expand your shared pleasure palette.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 