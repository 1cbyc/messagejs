'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} reset={this.reset} />;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-lg">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Something went wrong
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                We're sorry for the inconvenience. Please try refreshing the page.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <pre className="mt-4 text-left text-xs text-red-600">
                  {this.state.error.message}
                </pre>
              )}
            </div>
            <div className="space-y-2">
              <Button onClick={this.reset} className="w-full">
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
