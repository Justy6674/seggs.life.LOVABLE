'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Sparkles, Heart, Filter, Shuffle, Clock, Bookmark, Play, RefreshCw } from 'lucide-react';

interface Suggestion {
  id: string;
  content: string;
  category: 'connection' | 'sensual' | 'playful' | 'romantic' | 'adventurous';
  heatLevel: 'sweet' | 'spicy' | 'steamy' | 'wild';
  duration: '5-10 min' | '15-30 min' | '30-60 min' | '60+ min';
  blueprintType: string[];
  isFavorited: boolean;
  createdAt: Date;
}

interface FilterState {
  category: string;
  heatLevel: string;
  duration: string;
  blueprintType: string;
}

const categories = [
  { id: 'all', label: 'All Suggestions', icon: '✨' },
  { id: 'connection', label: 'Connection', icon: '💫' },
  { id: 'sensual', label: 'Sensual', icon: '🌸' },
  { id: 'playful', label: 'Playful', icon: '🎭' },
  { id: 'romantic', label: 'Romantic', icon: '💕' },
  { id: 'adventurous', label: 'Adventurous', icon: '🔥' }
];

const heatLevels = [
  { id: 'all', label: 'All Levels', color: 'text-slate-600', icon: '🌈' },
  { id: 'sweet', label: 'Sweet', color: 'text-pink-500', icon: '🌸' },
  { id: 'spicy', label: 'Spicy', color: 'text-orange-500', icon: '🌶️' },
  { id: 'steamy', label: 'Steamy', color: 'text-red-500', icon: '🔥' },
  { id: 'wild', label: 'Wild', color: 'text-purple-600', icon: '💥' }
];

export function AISuggestionsHub() {
  const [user] = useAuthState(auth);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userBlueprint, setUserBlueprint] = useState<any>(null);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    heatLevel: 'all',
    duration: 'all',
    blueprintType: 'all'
  });

  useEffect(() => {
    if (user?.uid) {
      loadUserData();
      loadSuggestions();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [suggestions, filters]);

  const loadUserData = async () => {
    if (!user?.uid) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      if (userData?.blueprintResult) {
        setUserBlueprint(userData.blueprintResult);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadSuggestions = async () => {
    if (!user?.uid) return;
    try {
      setIsLoading(true);
      const suggestionsQuery = query(
        collection(db, 'suggestions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const suggestionsSnapshot = await getDocs(suggestionsQuery);
      const loadedSuggestions = suggestionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Suggestion[];
      
      setSuggestions(loadedSuggestions);
      
      // If no suggestions exist, generate some initial ones
      if (loadedSuggestions.length === 0) {
        await generateInitialSuggestions();
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInitialSuggestions = async () => {
    const initialSuggestions: Omit<Suggestion, 'id' | 'createdAt'>[] = [
      {
        content: "Create a 'gratitude jar' together - each week, write down something you appreciate about your partner and share them over a cozy dinner.",
        category: 'connection',
        heatLevel: 'sweet',
        duration: '15-30 min',
        blueprintType: ['sensual', 'energetic'],
        isFavorited: false
      },
      {
        content: "Give each other a 10-minute sensory massage using different textures - silk scarves, feathers, ice cubes, or warm oils.",
        category: 'sensual',
        heatLevel: 'spicy',
        duration: '15-30 min',
        blueprintType: ['sensual'],
        isFavorited: false
      },
      {
        content: "Play 'Truth or Dare' with relationship-focused questions that help you discover new things about each other.",
        category: 'playful',
        heatLevel: 'sweet',
        duration: '30-60 min',
        blueprintType: ['sexual', 'kinky'],
        isFavorited: false
      },
      {
        content: "Plan a surprise date night where you recreate your first date, but with a twist that incorporates your current interests.",
        category: 'romantic',
        heatLevel: 'sweet',
        duration: '60+ min',
        blueprintType: ['energetic', 'shapeshifter'],
        isFavorited: false
      }
    ];

    for (const suggestion of initialSuggestions) {
      try {
        await addDoc(collection(db, 'suggestions'), {
          ...suggestion,
          userId: user!.uid,
          createdAt: new Date()
        });
      } catch (error) {
        console.error('Error adding initial suggestion:', error);
      }
    }

    // Reload suggestions after adding initial ones
    await loadSuggestions();
  };

  const generateNewSuggestions = async () => {
    setIsGenerating(true);
    try {
      // This would call your AI API to generate personalized suggestions
      // For now, we'll use mock data
      const newSuggestion: Omit<Suggestion, 'id' | 'createdAt'> = {
        content: "Try a 'mindful connection' exercise - sit facing each other, maintain eye contact for 2 minutes while taking synchronized deep breaths.",
        category: 'connection',
        heatLevel: 'sweet',
        duration: '5-10 min',
        blueprintType: [userBlueprint?.dominantType || 'sensual'],
        isFavorited: false
      };

      const docRef = await addDoc(collection(db, 'suggestions'), {
        ...newSuggestion,
        userId: user!.uid,
        createdAt: new Date()
      });

      setSuggestions(prev => [{
        id: docRef.id,
        ...newSuggestion,
        createdAt: new Date()
      }, ...prev]);

    } catch (error) {
      console.error('Error generating new suggestion:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...suggestions];

    if (filters.category !== 'all') {
      filtered = filtered.filter(s => s.category === filters.category);
    }

    if (filters.heatLevel !== 'all') {
      filtered = filtered.filter(s => s.heatLevel === filters.heatLevel);
    }

    if (filters.duration !== 'all') {
      filtered = filtered.filter(s => s.duration === filters.duration);
    }

    if (filters.blueprintType !== 'all') {
      filtered = filtered.filter(s => s.blueprintType.includes(filters.blueprintType));
    }

    setFilteredSuggestions(filtered);
  };

  const toggleFavorite = async (suggestionId: string) => {
    try {
      const suggestionIndex = suggestions.findIndex(s => s.id === suggestionId);
      if (suggestionIndex === -1) return;

      const updatedSuggestions = [...suggestions];
      updatedSuggestions[suggestionIndex].isFavorited = !updatedSuggestions[suggestionIndex].isFavorited;
      setSuggestions(updatedSuggestions);

      // Update in Firestore
      // await updateDoc(doc(db, 'suggestions', suggestionId), {
      //   isFavorited: updatedSuggestions[suggestionIndex].isFavorited
      // });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getHeatLevelInfo = (level: string) => {
    return heatLevels.find(h => h.id === level) || heatLevels[0];
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.id === category) || categories[0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="bg-gradient-to-r from-primary to-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-slate-900">AI Suggestions Hub</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Personalized intimacy suggestions powered by your unique blueprint and relationship goals
        </p>
      </div>

      {/* Generate New Suggestions */}
      <div className="text-center">
        <button
          onClick={generateNewSuggestions}
          disabled={isGenerating}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <Shuffle className="h-5 w-5" />
          )}
          <span className="font-medium">
            {isGenerating ? 'Generating...' : 'Generate New Suggestions'}
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-slate-600" />
          <h3 className="font-serif font-semibold text-slate-900">Filter Suggestions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Heat Level Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Heat Level</label>
            <select
              value={filters.heatLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, heatLevel: e.target.value }))}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {heatLevels.map(level => (
                <option key={level.id} value={level.id}>
                  {level.icon} {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
            <select
              value={filters.duration}
              onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Durations</option>
              <option value="5-10 min">🕐 5-10 minutes</option>
              <option value="15-30 min">🕒 15-30 minutes</option>
              <option value="30-60 min">🕕 30-60 minutes</option>
              <option value="60+ min">🕘 60+ minutes</option>
            </select>
          </div>

          {/* Blueprint Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Blueprint Type</label>
            <select
              value={filters.blueprintType}
              onChange={(e) => setFilters(prev => ({ ...prev, blueprintType: e.target.value }))}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Types</option>
              <option value="sensual">🌸 Sensual</option>
              <option value="sexual">❤️ Sexual</option>
              <option value="energetic">⚡ Energetic</option>
              <option value="kinky">🔥 Kinky</option>
              <option value="shapeshifter">🦋 Shapeshifter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuggestions.map((suggestion) => {
          const categoryInfo = getCategoryInfo(suggestion.category);
          const heatInfo = getHeatLevelInfo(suggestion.heatLevel);

          return (
            <div key={suggestion.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{categoryInfo.icon}</span>
                  <span className="text-sm font-medium text-slate-600">{categoryInfo.label}</span>
                </div>
                <button
                  onClick={() => toggleFavorite(suggestion.id)}
                  className={`p-1 rounded-full transition-colors ${
                    suggestion.isFavorited
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-slate-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${suggestion.isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Content */}
              <p className="text-slate-700 mb-4 leading-relaxed font-serif">
                {suggestion.content}
              </p>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{suggestion.duration}</span>
                </div>
                <div className={`flex items-center space-x-1 ${heatInfo.color}`}>
                  <span>{heatInfo.icon}</span>
                  <span>{heatInfo.label}</span>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full bg-primary text-white py-2 rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2">
                <Play className="h-4 w-4" />
                <span className="font-medium">Try This</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredSuggestions.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">
            No suggestions match your filters
          </h3>
          <p className="text-slate-600 mb-4">
            Try adjusting your filters or generate new suggestions
          </p>
          <button
            onClick={() => setFilters({ category: 'all', heatLevel: 'all', duration: 'all', blueprintType: 'all' })}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
} 