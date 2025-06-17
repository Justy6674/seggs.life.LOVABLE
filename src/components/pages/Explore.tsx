import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../hooks/useUserData';
import { IntimacyActionsService } from '../../lib/intimacyActions';

const Explore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'podcasts' | 'books' | 'health' | 'shop'>('suggestions');
  const [filterIntensity, setFilterIntensity] = useState<string>('all');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const { user } = useAuth();
  const { userData } = useUserData();

  // Generate AI suggestions based on user's blueprint
  const generateExplorationSuggestions = async () => {
    if (!userData?.eroticBlueprintPrimary) return;
    
    setLoadingSuggestions(true);

    try {
      const suggestions = await IntimacyActionsService.generateActions(
        'Exploration & Discovery',
        userData.eroticBlueprintPrimary,
        userData.eroticBlueprintSecondary || userData.eroticBlueprintPrimary
      );
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    if (userData?.eroticBlueprintPrimary && activeTab === 'suggestions') {
      generateExplorationSuggestions();
    }
  }, [userData?.eroticBlueprintPrimary, activeTab]);

  // Track tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
  };

  // Track filter changes
  const handleFilterChange = (filter: string) => {
    setFilterIntensity(filter);
  };

  // Track suggestion interactions
  const handleSuggestionInteraction = (suggestion: any, action: string) => {
    //   action,
    //   suggestionType: suggestion.type || 'unknown',
    //   userBlueprint: userData?.eroticBlueprintPrimary,
    //   category: suggestion.category
    // });
  };

  // Mock data - in real app this would come from Firebase
  const podcasts = [
    {
      id: '1',
      title: 'Relationship Science',
      host: 'Dr. Sarah Johnson',
      description: 'Evidence-based insights into modern relationships',
      category: 'education',
      intensityLevel: 'sweet',
      episodeCount: 45,
      suitableFor: ['sexual', 'asexual', 'mixed'],
      imageUrl: '',
      blueprintRecommended: userData?.eroticBlueprintPrimary === 'sensual' || userData?.eroticBlueprintPrimary === 'energetic'
    },
    {
      id: '2',
      title: 'Intimacy Explored',
      host: 'Alex & Sam',
      description: 'Honest conversations about physical and emotional intimacy',
      category: 'relationships',
      intensityLevel: 'spicy',
      episodeCount: 28,
      suitableFor: ['sexual', 'mixed'],
      imageUrl: '',
      blueprintRecommended: userData?.eroticBlueprintPrimary === 'sexual' || userData?.eroticBlueprintPrimary === 'kinky'
    },
    {
      id: '3',
      title: 'Ace Perspectives',
      host: 'Robin Taylor',
      description: 'Asexual experiences and relationship dynamics',
      category: 'asexual',
      intensityLevel: 'sweet',
      episodeCount: 22,
      suitableFor: ['asexual', 'mixed'],
      imageUrl: '',
      blueprintRecommended: userData?.eroticBlueprintPrimary === 'sensual'
    }
  ];

  const books = [
    {
      id: '1',
      title: 'Come As You Are',
      author: 'Emily Nagoski',
      description: 'Groundbreaking book about sexual wellness for women',
      category: 'sexual_health',
      intensityLevel: 'flirty',
      rating: 4.8,
      price: '$16.99',
      blueprintRecommended: userData?.eroticBlueprintPrimary === 'sensual' || userData?.eroticBlueprintPrimary === 'sexual'
    },
    {
      id: '2',
      title: 'The Asexual\'s Guide to Love',
      author: 'Sarah Chen',
      description: 'Navigating romantic relationships on the asexual spectrum',
      category: 'asexual',
      intensityLevel: 'sweet',
      rating: 4.6,
      price: '$14.99',
      blueprintRecommended: userData?.eroticBlueprintPrimary === 'sensual'
    }
  ];

  const healthResources = [
    {
      id: '1',
      title: 'STI Testing Locations',
      description: 'Find confidential testing near you',
      type: 'directory',
      urgency: 'routine',
      provider: 'Planned Parenthood',
    },
    {
      id: '2',
      title: 'PrEP Information Hub',
      description: 'Complete guide to HIV prevention',
      type: 'education',
      urgency: 'important',
      provider: 'CDC',
    },
    {
      id: '3',
      title: 'Telehealth Consultations',
      description: 'Private sexual health consultations',
      type: 'service',
      urgency: 'routine',
      provider: 'Nurx',
    }
  ];

  const shopItems = [
    {
      id: '1',
      title: 'Couples Massage Kit',
      description: 'Professional-grade oils and tools for intimacy',
      category: 'wellness',
      price: '$89.99',
      rating: 4.7,
      intensityLevel: 'flirty',
      suitableFor: ['sexual', 'asexual', 'mixed'],
      blueprintRecommended: userData?.eroticBlueprintPrimary === 'sensual'
    },
    {
      id: '2',
      title: 'Communication Cards',
      description: 'Thoughtful conversation starters for couples',
      category: 'experiences',
      price: '$24.99',
      rating: 4.9,
      intensityLevel: 'sweet',
      suitableFor: ['sexual', 'asexual', 'mixed'],
      blueprintRecommended: true // Good for all blueprints
    }
  ];

  const tabs = [
    { id: 'suggestions', label: 'AI Suggestions', icon: '🤖' },
    { id: 'podcasts', label: 'Podcasts', icon: '🎧' },
    { id: 'books', label: 'Books', icon: '📚' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'shop', label: 'Shop', icon: '🛍️' },
  ];

  const intensityFilters = [
    { id: 'all', label: 'All Levels' },
    { id: 'sweet', label: 'Sweet & Gentle' },
    { id: 'flirty', label: 'Flirty & Playful' },
    { id: 'spicy', label: 'Spicy & Bold' },
    { id: 'wild', label: 'Wild & Intense' },
  ];

  const getIntensityColor = (level: string) => {
    switch (level) {
      case 'sweet': return 'text-green-400';
      case 'flirty': return 'text-blue-400';
      case 'spicy': return 'text-orange-400';
      case 'wild': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const SuggestionCard = ({ suggestion }: { suggestion: any }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">✨</span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-sans text-sm font-medium mb-1">{suggestion.action}</h3>
          <p className="text-gray-300 text-xs mb-3 leading-relaxed">{suggestion.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 text-xs">{suggestion.estimatedTime}</span>
              {userData?.eroticBlueprintPrimary && (
                <>
                  <span className="text-gray-500 text-xs">•</span>
                  <span className="text-blue-400 text-xs">For {userData.eroticBlueprintPrimary}s</span>
                </>
              )}
            </div>
            <button 
              onClick={() => handleSuggestionInteraction(suggestion, 'try_now')}
              className="text-slate-400 hover:text-slate-300 text-xs font-sans"
            >
              Try Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const PodcastCard = ({ podcast }: { podcast: any }) => (
    <div className={`bg-gray-800 border rounded-lg p-4 hover:border-gray-600 transition-colors ${
      podcast.blueprintRecommended ? 'border-blue-500/50' : 'border-gray-700'
    }`}>
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">🎧</span>
        </div>
        <div className="flex-1">
          {podcast.blueprintRecommended && (
            <div className="mb-2">
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                Perfect for {userData?.eroticBlueprintPrimary}s
              </span>
            </div>
          )}
          <h3 className="text-white font-sans text-sm font-medium mb-1">{podcast.title}</h3>
          <p className="text-gray-400 text-xs mb-2">by {podcast.host}</p>
          <p className="text-gray-300 text-xs mb-3 leading-relaxed">{podcast.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${getIntensityColor(podcast.intensityLevel)}`}>
                {podcast.intensityLevel}
              </span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-500 text-xs">{podcast.episodeCount} episodes</span>
            </div>
            <button 
              onClick={() => handleSuggestionInteraction(podcast, 'listen')}
              className="text-slate-400 hover:text-slate-300 text-xs font-sans"
            >
              Listen
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const BookCard = ({ book }: { book: any }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-16 bg-slate-600 rounded flex items-center justify-center">
          <span className="text-white text-lg">📖</span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-sans text-sm font-medium mb-1">{book.title}</h3>
          <p className="text-gray-400 text-xs mb-2">by {book.author}</p>
          <p className="text-gray-300 text-xs mb-3 leading-relaxed">{book.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-gray-400 text-xs">{book.rating}</span>
              </div>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-300 text-xs font-medium">{book.price}</span>
            </div>
            <button className="text-slate-400 hover:text-slate-300 text-xs font-sans">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const HealthCard = ({ resource }: { resource: any }) => (
    <div className={`p-4 rounded-lg border transition-colors ${
      resource.urgency === 'important' 
        ? 'bg-red-deep bg-opacity-10 border-red-deep border-opacity-30' 
        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded flex items-center justify-center ${
          resource.urgency === 'important' ? 'bg-red-deep' : 'bg-slate-600'
        }`}>
          <span className="text-white text-sm">🏥</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-white font-sans text-sm font-medium">{resource.title}</h3>
            {resource.urgency === 'important' && (
              <span className="text-xs bg-red-deep text-white px-2 py-1 rounded">Important</span>
            )}
          </div>
          <p className="text-gray-400 text-xs mb-2">by {resource.provider}</p>
          <p className="text-gray-300 text-xs mb-3 leading-relaxed">{resource.description}</p>
          
          <button className="text-slate-400 hover:text-slate-300 text-xs font-sans">
            Access Resource
          </button>
        </div>
      </div>
    </div>
  );

  const ShopCard = ({ item }: { item: any }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">🛍️</span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-sans text-sm font-medium mb-1">{item.title}</h3>
          <p className="text-gray-300 text-xs mb-3 leading-relaxed">{item.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-gray-400 text-xs">{item.rating}</span>
              </div>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-300 text-xs font-medium">{item.price}</span>
            </div>
            <button className="text-slate-400 hover:text-slate-300 text-xs font-sans">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Filter content based on intensity
  const getFilteredContent = (items: any[]) => {
    if (filterIntensity === 'all') return items;
    return items.filter(item => {
      // Handle both heatLevel (from AI suggestions) and intensityLevel (from mock data)
      const itemIntensity = item.heatLevel || item.intensityLevel;
      return itemIntensity === filterIntensity;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white font-serif text-xl mb-1">Explore</h1>
        <p className="text-gray-400 font-sans text-sm">Curated resources for your journey</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 py-2 px-3 rounded-md font-sans text-xs transition-colors ${
              activeTab === tab.id 
                ? 'bg-slate-600 text-white' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Filters (shown for content tabs, not health) */}
      {activeTab !== 'health' && (
        <div>
          <h3 className="text-white font-sans text-sm font-medium mb-3">Filter by intensity</h3>
          <div className="flex flex-wrap gap-2">
            {intensityFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`py-2 px-3 rounded-lg border text-xs transition-colors ${
                  filterIntensity === filter.id
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'suggestions' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-white font-sans text-base font-medium">AI Suggestions</h2>
              <span className="text-gray-400 text-xs font-sans">{aiSuggestions.length} suggestions</span>
            </div>
            {loadingSuggestions ? (
              <p>Loading suggestions...</p>
            ) : (
              getFilteredContent(aiSuggestions).map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))
            )}
          </>
        )}

        {activeTab === 'podcasts' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-white font-sans text-base font-medium">Recommended Podcasts</h2>
              <span className="text-gray-400 text-xs font-sans">{podcasts.length} shows</span>
            </div>
            {getFilteredContent(podcasts).map((podcast) => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </>
        )}

        {activeTab === 'books' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-white font-sans text-base font-medium">Recommended Reading</h2>
              <span className="text-gray-400 text-xs font-sans">{books.length} books</span>
            </div>
            {getFilteredContent(books).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </>
        )}

        {activeTab === 'health' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-white font-sans text-base font-medium">Health Resources</h2>
              <span className="text-gray-400 text-xs font-sans">Trusted providers</span>
            </div>
            <div className="bg-slate-600 bg-opacity-20 border border-slate-600 border-opacity-30 rounded-lg p-4 mb-4">
              <h3 className="text-slate-300 font-sans text-sm font-medium mb-2">Privacy Notice</h3>
              <p className="text-gray-300 text-xs leading-relaxed">
                These are external resources. Your activity may be tracked by third parties. 
                Always verify provider credentials and use your judgment.
              </p>
            </div>
            {getFilteredContent(healthResources).map((resource) => (
              <HealthCard key={resource.id} resource={resource} />
            ))}
          </>
        )}

        {activeTab === 'shop' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-white font-sans text-base font-medium">Curated Products</h2>
              <span className="text-gray-400 text-xs font-sans">Affiliate links</span>
            </div>
            <div className="bg-slate-600 bg-opacity-20 border border-slate-600 border-opacity-30 rounded-lg p-4 mb-4">
              <h3 className="text-slate-300 font-sans text-sm font-medium mb-2">Affiliate Disclosure</h3>
              <p className="text-gray-300 text-xs leading-relaxed">
                We may earn a commission from purchases. All products are independently selected 
                and reviewed for quality and safety.
              </p>
            </div>
            {getFilteredContent(shopItems).map((item) => (
              <ShopCard key={item.id} item={item} />
            ))}
          </>
        )}
      </div>

      {/* Bottom Notice */}
      <div className="text-center pt-4">
        <p className="text-gray-500 text-xs font-sans">
          Content updated weekly • Report inappropriate content
        </p>
      </div>
    </div>
  );
};

export default Explore; 