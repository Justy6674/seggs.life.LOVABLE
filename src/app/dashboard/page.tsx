'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/lib/database';

export default function Dashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const userData = await UserService.getUser(user.uid);
      setUserData(userData);
      
      if (userData?.partnerId) {
        const partnerData = await UserService.getPartnerData(user.uid);
        setPartnerData(partnerData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to continue</h2>
          <Link href="/login" className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700">
            Log In
          </Link>
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
            Welcome to Seggs.Life
          </h1>
          <p className="text-lg text-gray-700">
            Your AI-powered intimate relationship tool
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Blueprint Status */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">Your Blueprint</h3>
            <p className="text-pink-100 mb-4">
              {userData?.eroticBlueprintPrimary ? `You are ${userData.eroticBlueprintPrimary}` : 'Take the assessment to discover your blueprint'}
            </p>
            {userData?.eroticBlueprintPrimary ? (
              <Link 
                href="/assessment"
                className="inline-block bg-white text-pink-600 px-4 py-2 rounded-lg font-medium hover:bg-pink-50"
              >
                View Details
              </Link>
            ) : (
              <Link 
                href="/assessment"
                className="inline-block bg-white text-pink-600 px-4 py-2 rounded-lg font-medium hover:bg-pink-50"
              >
                Take Assessment
              </Link>
            )}
          </div>

          {/* Partner Status */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">Partner</h3>
            <p className="text-purple-100 mb-4">
              {partnerData ? 
                (partnerData.eroticBlueprintPrimary ? `Partner is ${partnerData.eroticBlueprintPrimary}` : 'Partner assessment pending') :
                'No partner connected'
              }
            </p>
            {partnerData ? (
              <Link 
                href="/combined-analysis"
                className="inline-block bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50"
              >
                View Analysis
              </Link>
            ) : (
              <Link 
                href="/partner-invite"
                className="inline-block bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50"
              >
                Invite Partner
              </Link>
            )}
          </div>

          {/* Get Suggestions */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">AI Suggestions</h3>
            <p className="text-indigo-100 mb-4">
              Get personalized suggestions based on your combined blueprints
            </p>
            <Link 
              href="/suggestions"
              className="inline-block bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50"
            >
              Get Suggestions
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/suggestions"
              className="p-4 border-2 border-pink-200 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🔥</div>
              <div className="font-semibold text-gray-900">20 Categories</div>
              <div className="text-sm text-gray-600">Browse all suggestion types</div>
            </Link>
            
            <Link 
              href="/combined-analysis"
              className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">💕</div>
              <div className="font-semibold text-gray-900">Analysis</div>
              <div className="text-sm text-gray-600">View compatibility insights</div>
            </Link>
            
            <Link 
              href="/partner-invite"
              className="p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">👫</div>
              <div className="font-semibold text-gray-900">Invite Partner</div>
              <div className="text-sm text-gray-600">Share your invite code</div>
            </Link>
            
            <Link 
              href="/subscription"
              className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">⭐</div>
              <div className="font-semibold text-gray-900">Subscription</div>
              <div className="text-sm text-gray-600">Manage your plan</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 