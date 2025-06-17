'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo)
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-wheat/10 backdrop-blur-sm rounded-2xl p-8 border border-wheat/20 text-center"
          >
            <div className="text-6xl mb-6">😔</div>
            
            <h2 className="text-2xl font-serif font-bold text-wheat mb-4">
              Oops! Something went wrong
            </h2>
            
            <p className="text-wheat/80 mb-6 leading-relaxed">
              We encountered an unexpected error. Don't worry - your data is safe. 
              You can try refreshing the page or going back to continue.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-wheat/60 text-sm cursor-pointer mb-2">
                  Technical Details (Development)
                </summary>
                <pre className="text-xs text-wheat/50 bg-black/20 p-3 rounded overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="bg-deepRed hover:bg-deepRed/90 text-wheat px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="bg-wheat/20 hover:bg-wheat/30 text-wheat px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Refresh Page
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-wheat/20">
              <p className="text-wheat/60 text-sm">
                If this keeps happening, please{' '}
                <a 
                  href="mailto:support@seggs.life" 
                  className="text-wheat hover:text-wheat/80 underline"
                >
                  contact support
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Convenience wrapper for common use cases
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
