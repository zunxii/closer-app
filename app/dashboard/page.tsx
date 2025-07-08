"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  Users,
  ArrowRight,
  Upload,
  TrendingUp,
  Database,
  Activity,
  Search,
  Plus,
  BarChart3,
  FileText,
  Sparkles,
  Clock,
  CheckCircle,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [totalCreators, setTotalCreators] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch total creators count from Supabase
  useEffect(() => {
    const fetchCreatorsCount = async () => {
      try {
        setLoading(true);
        const { count, error } = await supabase
          .from("creators")
          .select("*", { count: "exact", head: true });

        if (error) {
          setError(error.message);
          console.error("Error fetching creators count:", error);
        } else {
          setTotalCreators(count || 0);
        }
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchCreatorsCount();
    }
  }, [isSignedIn]);

  // Format number with commas
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light text-gray-900 mb-2">
                  Welcome back
                </h1>
                <p className="text-gray-600">
                  Here's what's happening with your business tools today.
                </p>
              </div>
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Last updated: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Creators Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Creators
                  </p>
                  <div className="flex items-center space-x-2">
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    ) : error ? (
                      <span className="text-red-500 text-sm">
                        Error loading
                      </span>
                    ) : (
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatNumber(totalCreators)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Database active</span>
              </div>
            </div>

            {/* Email Management Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Email Tools
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">Active</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Ready to use</span>
              </div>
            </div>

            {/* Campaigns Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Campaigns
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">Ready</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Send className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-600">
                  System operational
                </span>
              </div>
            </div>

            {/* Transcription Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Transcription
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">Online</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-purple-600">AI-powered</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="bg-white border-2 border-gray-200 text-gray-900 p-6 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all text-left group">
                <div className="flex items-center justify-between mb-4">
                  <Search className="w-8 h-8 text-black" />
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-medium mb-2">Creator Matching</h3>
                <p className="text-black text-sm">
                  Find creators from your database instantly
                </p>
              </button>

              <button className="bg-white border-2 border-gray-200 text-gray-900 p-6 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all text-left group">
                <div className="flex items-center justify-between mb-4">
                  <Mail className="w-8 h-8 text-gray-600" />
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-medium mb-2">Email Campaigns</h3>
                <p className="text-gray-600 text-sm">
                  Manage your email marketing campaigns
                </p>
              </button>

              <button className="bg-white border-2 border-gray-200 text-gray-900 p-6 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all text-left group">
                <div className="flex items-center justify-between mb-4">
                  <Upload className="w-8 h-8 text-gray-600" />
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Video Transcription
                </h3>
                <p className="text-gray-600 text-sm">
                  Upload and transcribe MP4 files
                </p>
              </button>
            </div>
          </div>

          {/* Main Tools Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Creator Database */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Creator Database
                    </h3>
                    <p className="text-sm text-gray-600">
                      Manage your creator network
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-12"></div>
                      </div>
                    ) : error ? (
                      <span className="text-red-500 text-sm">Error</span>
                    ) : (
                      formatNumber(totalCreators)
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Total entries</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Active creators</span>
                  <span className="text-sm font-medium text-gray-900">
                    {loading ? "..." : formatNumber(totalCreators)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Database status</span>
                  <span className="text-sm font-medium text-green-600">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-600">Last sync</span>
                  <span className="text-sm font-medium text-gray-900">
                    Just now
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <button className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Search Database</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Activity
                    </h3>
                    <p className="text-sm text-gray-600">
                      Latest system updates
                    </p>
                  </div>
                </div>
                <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  View all
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Database synchronized
                    </p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Email system updated
                    </p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      New transcription features
                    </p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      System maintenance completed
                    </p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              System Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Database</span>
                <span className="text-sm font-medium text-green-600">
                  Operational
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Email Service</span>
                <span className="text-sm font-medium text-green-600">
                  Operational
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Transcription</span>
                <span className="text-sm font-medium text-green-600">
                  Operational
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">API</span>
                <span className="text-sm font-medium text-green-600">
                  Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
