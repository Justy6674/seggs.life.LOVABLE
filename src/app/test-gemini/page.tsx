'use client'

import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default function TestGeminiPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const testGeminiAPI = async () => {
    setLoading(true)
    setError('')
    setResult('')

    try {
      // Initialize Gemini AI with environment variable
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '')
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

      const prompt = 'Generate 3 romantic date night ideas for couples. Keep it tasteful and relationship-focused.'
      
      const response = await model.generateContent(prompt)
      const text = response.response.text()
      
      setResult(text)
    } catch (err: any) {
      setError(`Error: ${err.message}`)
      console.error('Gemini API Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-white mb-4">
            Gemini API Test
          </h1>
          <p className="text-gray-300">
            Testing Gemini AI integration for the Intimacy Action Hub
          </p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <button
            onClick={testGeminiAPI}
            disabled={loading}
            className="btn-primary mb-6"
          >
            {loading ? 'Testing API...' : 'Test Gemini API'}
          </button>

          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
              <h3 className="text-green-400 font-semibold mb-2">API Response:</h3>
              <div className="text-gray-200 whitespace-pre-wrap">{result}</div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-300">Calling Gemini API...</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="btn-secondary">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
} 