import { UserButton } from "@clerk/nextjs";
import {
  Mail,
  Send,
  Users,
  BarChart3,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Upload,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    { name: "Emails Extracted", value: "12,345", icon: Mail, change: "+12%" },
    { name: "Campaigns Sent", value: "89", icon: Send, change: "+5%" },
    { name: "Total Contacts", value: "5,678", icon: Users, change: "+8%" },
    { name: "Success Rate", value: "94%", icon: BarChart3, change: "+2%" },
  ];

  const quickActions = [
    {
      name: "Email Extractor",
      description: "Extract and process email addresses from various sources",
      icon: Mail,
      href: "/dashboard/email-extractor",
    },
    {
      name: "Bulk Sender",
      description: "Send bulk emails and manage campaigns efficiently",
      icon: Send,
      href: "/dashboard/bulk-sender",
    },
    {
      name: "Contact Manager",
      description: "Organize and manage your contact database",
      icon: Users,
      href: "/dashboard/contacts",
    },
    {
      name: "Video Transcription",
      description: "Upload MP4 files and generate timestamped captions",
      icon: Upload,
      href: "/dashboard/transcription",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-light text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your business operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1 font-medium">
                  {stat.name}
                </p>
                <p className="text-2xl font-light text-gray-900 mb-2">
                  {stat.value}
                </p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <stat.icon className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-light text-gray-900 mb-1">
            Quick Actions
          </h2>
          <p className="text-gray-600">Access your most-used tools</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="block group"
              >
                <div className="p-6 border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-900 transition-colors">
                      <action.icon className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {action.name}
                        </h3>
                        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-gray-600 mr-3" />
            <h2 className="text-xl font-light text-gray-900">
              Recent Activity
            </h2>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-start py-4 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Email extraction completed
                </p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  +247 emails
                </span>
              </div>
            </div>

            <div className="flex justify-between items-start py-4 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Bulk campaign sent
                </p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  1,234 recipients
                </span>
              </div>
            </div>

            <div className="flex justify-between items-start py-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Contact list updated
                </p>
                <p className="text-xs text-gray-500">3 hours ago</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +56 contacts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
