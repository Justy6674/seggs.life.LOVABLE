'use client'

import { useState } from 'react'
import EroticBlueprintQuiz from '../../components/EroticBlueprintQuiz'

interface BlueprintScores {
  energetic: number
  sensual: number
  sexual: number
  kinky: number
  shapeshifter: number
}

export default function TestQuizPage() {
  const [showQuiz, setShowQuiz] = useState(true)
  const [results, setResults] = useState<{
    scores: BlueprintScores
    primary: string
    secondary?: string
  } | null>(null)

  const handleQuizComplete = (scores: BlueprintScores, primary: string, secondary?: string) => {
    setResults({ scores, primary, secondary })
    setShowQuiz(false)
  }

  const handleBackToHome = () => {
    setShowQuiz(false)
    setResults(null)
  }

  const restartQuiz = () => {
    setResults(null)
    setShowQuiz(true)
  }

  if (showQuiz) {
    return (
      <EroticBlueprintQuiz 
        onComplete={handleQuizComplete}
        onBackToHome={handleBackToHome}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-xl p-8 border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-white mb-4">
            ✅ Quiz Complete!
          </h1>
          <p className="text-gray-400">
            Here are the results from the 40-question Erotic Blueprint assessment:
          </p>
        </div>

        {results && (
          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
              <h3 className="text-lg font-serif font-bold text-white mb-4">
                Your Blueprint Results
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Primary Blueprint:</span>
                  <span className="text-purple-400 font-bold capitalize">{results.primary}</span>
                </div>
                {results.secondary && (
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Secondary Blueprint:</span>
                    <span className="text-blue-400 font-bold capitalize">{results.secondary}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
              <h3 className="text-lg font-serif font-bold text-white mb-4">
                Detailed Scores
              </h3>
              <div className="space-y-3">
                {Object.entries(results.scores).map(([blueprint, score]) => (
                  <div key={blueprint} className="flex items-center justify-between">
                    <span className="text-white capitalize font-medium">{blueprint}:</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${(score / 40) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-300 text-sm w-12">{score}/40</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center space-y-4">
              <button
                onClick={restartQuiz}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                Take Quiz Again
              </button>
              
              <div className="space-x-4">
                <a 
                  href="/" 
                  className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Back to Home
                </a>
                <a 
                  href="/test-onboarding" 
                  className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Test Full Onboarding
                </a>
              </div>
            </div>
          </div>
        )}

        {!results && (
          <div className="text-center">
            <p className="text-gray-400 mb-6">
              Quiz was cancelled or not completed.
            </p>
            <button
              onClick={restartQuiz}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
            >
              Start Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 