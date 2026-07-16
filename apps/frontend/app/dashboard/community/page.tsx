'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Code2,
  BookOpen,
  Award,
  Zap,
  Heart,
  Calendar,
  MapPin,
} from 'lucide-react';

const COMMUNITY_STATS = [
  { label: 'Active Members', value: '10K+', icon: Users, color: 'from-violet-500 to-purple-500' },
  { label: 'Discussions', value: '2.5K+', icon: MessageSquare, color: 'from-blue-500 to-cyan-500' },
  { label: 'Contributions', value: '5K+', icon: Code2, color: 'from-green-500 to-emerald-500' },
  { label: 'Resources', value: '500+', icon: BookOpen, color: 'from-orange-500 to-red-500' },
];

const FEATURED_CONTRIBUTORS = [
  {
    id: 1,
    name: 'Amrita',
    role: 'Security Researcher',
    avatar: '👨‍💻',
    contributions: 248,
    templates: 42,
    badge: 'Expert',
  },
  {
    id: 2,
    name: 'Aditya',
    role: 'DevSecOps Engineer',
    avatar: '👩‍💻',
    contributions: 195,
    templates: 35,
    badge: 'Expert',
  },
  {
    id: 3,
    name: 'Taher',
    role: 'Pentester',
    avatar: '👨‍🔬',
    contributions: 156,
    templates: 28,
    badge: 'Pro',
  },
  {
    id: 4,
    name: 'Achal',
    role: 'Cloud Security',
    avatar: '👩‍🔬',
    contributions: 142,
    templates: 24,
    badge: 'Pro',
  },
];

const RECENT_DISCUSSIONS = [
  {
    id: 1,
    title: 'Best practices for scanning Kubernetes clusters',
    author: 'Mike Johnson',
    replies: 24,
    likes: 156,
    category: 'Security',
    timestamp: '2h ago',
  },
  {
    id: 2,
    title: 'Creating custom templates for your infrastructure',
    author: 'Lisa Chen',
    replies: 18,
    likes: 92,
    category: 'Templates',
    timestamp: '5h ago',
  },
  {
    id: 3,
    title: 'Integrating SecureLens with CI/CD pipelines',
    author: 'David Brown',
    replies: 32,
    likes: 234,
    category: 'Integration',
    timestamp: '1d ago',
  },
];

const COMMUNITY_EVENTS = [
  {
    id: 1,
    title: 'Monthly Security Webinar',
    date: 'July 25, 2026',
    time: '3:00 PM UTC',
    attendees: 324,
    featured: true,
  },
  {
    id: 2,
    title: 'Template Writing Workshop',
    date: 'August 1, 2026',
    time: '2:00 PM UTC',
    attendees: 156,
    featured: false,
  },
  {
    id: 3,
    title: 'Community Q&A Session',
    date: 'August 8, 2026',
    time: '4:00 PM UTC',
    attendees: 89,
    featured: false,
  },
];

function CommunityPage() {
  const [selectedTab, setSelectedTab] = useState<'discussions' | 'events' | 'contributors'>('discussions');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 px-6">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-violet-400" />
            <h1 className="text-4xl sm:text-5xl font-bold">
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Community
              </span>
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Join thousands of security professionals sharing templates, insights, and best practices
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {COMMUNITY_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                <div className="relative bg-[#0b1020]/75 border border-white/10 rounded-xl p-6 backdrop-blur group-hover:border-violet-400/30 transition-all duration-300">
                  <div className={`mb-4 inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg shadow-white/10`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-violet-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          {['discussions', 'events', 'contributors'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`px-6 py-3 font-medium text-sm transition-all duration-300 relative ${
                selectedTab === tab
                  ? 'text-violet-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {selectedTab === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Discussions Tab */}
          {selectedTab === 'discussions' && (
            <div className="space-y-4">
              {RECENT_DISCUSSIONS.map((discussion, idx) => (
                <motion.div
                  key={discussion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                  <div className="relative bg-[#0b1020]/75 border border-white/10 rounded-xl p-6 backdrop-blur group-hover:border-violet-400/30 transition-all duration-300 cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
                          {discussion.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                          <span>by {discussion.author}</span>
                          <span>•</span>
                          <span>{discussion.timestamp}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium">
                        {discussion.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>{discussion.replies} replies</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        <span>{discussion.likes} likes</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Events Tab */}
          {selectedTab === 'events' && (
            <div className="space-y-4">
              {COMMUNITY_EVENTS.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                  <div className={`relative bg-[#0b1020]/75 border rounded-xl p-6 backdrop-blur transition-all duration-300 cursor-pointer
                    ${event.featured ? 'border-violet-400/50 group-hover:border-violet-400' : 'border-white/10 group-hover:border-violet-400/30'}
                  `}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
                          {event.title}
                        </h3>
                        {event.featured && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-violet-400">
                            <Zap className="w-3 h-3" />
                            Featured Event
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-violet-400">{event.attendees}</div>
                        <div className="text-xs text-gray-400">attending</div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date}</span>
                      </div>
                      <span className="hidden sm:block">•</span>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Contributors Tab */}
          {selectedTab === 'contributors' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURED_CONTRIBUTORS.map((contributor, idx) => (
                <motion.div
                  key={contributor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                  <div className="relative bg-[#0b1020]/75 border border-white/10 rounded-xl p-6 backdrop-blur group-hover:border-violet-400/30 transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl">{contributor.avatar}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{contributor.name}</h3>
                        <p className="text-sm text-gray-400">{contributor.role}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 text-xs font-medium">
                            <Award className="w-3 h-3" />
                            {contributor.badge}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-400">
                        <span>Contributions</span>
                        <span className="text-violet-400 font-semibold">{contributor.contributions}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Templates</span>
                        <span className="text-violet-400 font-semibold">{contributor.templates}</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 py-2 px-3 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium hover:from-violet-500 hover:to-purple-500 transition-all duration-300">
                      View Profile
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="relative group inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-xl" />
            <div className="relative bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/30 rounded-xl p-8 backdrop-blur">
              <h2 className="text-2xl font-bold text-white mb-2">Ready to Join?</h2>
              <p className="text-gray-300 mb-6">Contribute templates, share knowledge, and grow with our community</p>
              <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:from-violet-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-violet-600/30">
                Get Started Now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default CommunityPage;
