"use client";
import Link from "next/link";
import { Mail, Send, Users, ArrowRight } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser()
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-semibold text-gray-900">Closer</h1>
          
          <div className="flex items-center space-x-4">
            {!isLoaded ? (
              // Loading state
              <div className="animate-pulse flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ) : isSignedIn ? (
              // Signed in: Show UserButton
              <UserButton showName />
            ) : (
              // Not signed in: Show login and request access
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/request-access"
                  className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors rounded-lg"
                >
                  Request access
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            {/* Hero section */}
            <div className="mb-16">
              <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-gray-900 mb-6">
                Closer
              </h1>
              <p className="text-xl text-gray-600 mb-4 font-medium">
                Internal Business Tools
              </p>
              <p className="text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                Streamline your business operations with our comprehensive suite
                of internal tools. Designed for efficiency, built for
                professionals.
              </p>

              {/* Auth buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-sm mx-auto">
                <Link
                  href="/dashboard"
                  className="flex-1 bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors rounded-lg flex items-center justify-center"
                >
                  Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link
                  href="/request-access"
                  className="flex-1 border border-gray-300 text-gray-900 px-8 py-3 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors rounded-lg"
                >
                  Get Access
                </Link>
              </div>
            </div>

            {/* Features section */}
            <div className="mt-24">
              <h2 className="text-3xl font-light text-gray-900 text-center mb-4">
                Core Capabilities
              </h2>
              <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
                Everything you need to manage your business communications and operations efficiently.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 group">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl mx-auto mb-6 flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                    <Mail className="w-7 h-7 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    Email Management
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Advanced email extraction and processing capabilities for
                    business communications with intelligent filtering.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 group">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl mx-auto mb-6 flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                    <Send className="w-7 h-7 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    Bulk Operations
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Efficient bulk sending and campaign management for large-scale
                    operations with detailed analytics.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 group">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl mx-auto mb-6 flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                    <Users className="w-7 h-7 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    Contact Management
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Comprehensive contact organization and relationship management
                    tools with advanced search capabilities.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-24 bg-white rounded-2xl border border-gray-200 p-12">
              <h3 className="text-2xl font-light text-gray-900 mb-4">
                Ready to get started?
              </h3>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Join thousands of professionals who trust Closer for their business operations.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors rounded-lg"
              >
                Access Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Closer</h3>
              <p className="text-sm text-gray-600">Internal Business Tools</p>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500">
                © 2025 Closer. Internal use only. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}