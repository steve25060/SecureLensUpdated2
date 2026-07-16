'use client';

import { motion } from 'framer-motion';
import { BookOpen, ExternalLink } from 'lucide-react';

const docs = [
  {
    title: 'Getting Started',
    description: 'Learn how to install and configure SecureLens for your first scan',
    icon: '🚀',
    link: '#',
  },
  {
    title: 'Templates Guide',
    description: 'Explore and create custom vulnerability scanning templates',
    icon: '📋',
    link: '#',
  },
  {
    title: 'API Reference',
    description: 'Complete API documentation for automation and integrations',
    icon: '⚙️',
    link: '#',
  },
  {
    title: 'Best Practices',
    description: 'Security scanning best practices and optimization techniques',
    icon: '✓',
    link: '#',
  },
  {
    title: 'Integrations',
    description: 'Connect SecureLens with your existing tools and workflows',
    icon: '🔗',
    link: '#',
  },
  {
    title: 'Troubleshooting',
    description: 'Solutions to common issues and problems',
    icon: '🔧',
    link: '#',
  },
];

export default function Docs() {
  return (
    <section id="docs" className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-24">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-violet-400" />
            <h2 className="text-4xl sm:text-5xl font-bold">
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Documentation
              </span>
            </h2>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Everything you need to master SecureLens
          </p>
        </motion.div>

        {/* Docs Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {docs.map((doc, index) => (
            <motion.a
              key={index}
              href={doc.link}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
              className="group relative block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />

              <div className="relative bg-[#0b1020]/75 border border-white/10 rounded-lg p-6 backdrop-blur group-hover:border-violet-400/30 transition-all duration-300 h-full">
                <div className="text-3xl mb-3">{doc.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {doc.description}
                </p>
                <div className="flex items-center gap-2 text-violet-400 group-hover:translate-x-2 transition-transform duration-300">
                  <span className="text-sm font-medium">Learn more</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <a href="#" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-300">
            View Full Documentation
            <ExternalLink className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
