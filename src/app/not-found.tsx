export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
        <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
        <a 
          href="/" 
          className="bg-gradient-to-r from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  )
} 