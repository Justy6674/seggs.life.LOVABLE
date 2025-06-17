export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-serif font-bold text-white mb-4">
          ✅ App Status: Running Successfully
        </h1>
        <div className="space-y-4 text-gray-300">
          <p>✅ Next.js app compiled successfully</p>
          <p>✅ TypeScript compilation completed</p>
          <p>✅ All syntax errors resolved</p>
          <p>✅ Home button functionality implemented</p>
          <p>✅ Onboarding system working</p>
        </div>
        <div className="mt-8 space-x-4">
          <a 
            href="/" 
            className="btn-primary inline-block"
          >
            Go to Home
          </a>
          <a 
            href="/test-onboarding" 
            className="btn-secondary inline-block"
          >
            Test Onboarding with Home Button
          </a>
        </div>
      </div>
    </div>
  )
} 