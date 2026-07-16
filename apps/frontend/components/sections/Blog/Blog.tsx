'use client';

import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { ShiningText } from '@/components/common/ShiningText';

const blogPosts = [
  {
    title: 'Top 10 CVEs of 2024 and How to Detect Them',
    excerpt:
      'A comprehensive guide to the most critical vulnerabilities discovered this year and how SecureLens helps detect them.',
    date: 'Jul 10, 2024',
    category: 'Security',
    image: '🔒',
    color: 'from-red-500 to-pink-500',
  },
  {
    title: 'Automating Security: CI/CD Best Practices',
    excerpt:
      'Learn how to integrate SecureLens into your CI/CD pipeline for continuous security testing.',
    date: 'Jul 5, 2024',
    category: 'DevOps',
    image: '⚙️',
    color: 'from-violet-500 to-purple-500',
  },
  {
    title: 'Zero Trust Security: A Practical Implementation Guide',
    excerpt:
      'Discover how SecureLens supports zero trust security architecture and principles.',
    date: 'Jun 28, 2024',
    category: 'Strategy',
    image: '🛡️',
    color: 'from-green-500 to-emerald-500',
  },
];

export default function Blog() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-24" id="blog">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl" />
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
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <ShiningText>Latest from Our Blog</ShiningText>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Security insights, best practices, and product updates
          </p>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-lg mb-4">
                <div className={`w-full h-48 rounded-lg bg-gradient-to-br ${post.color} flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300`}>
                  {post.image}
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                  <span className="text-xs font-semibold text-gray-300">
                    {post.category}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.date}>{post.date}</time>
                </div>
                <motion.a
                  href="#"
                  className="text-violet-400 hover:text-violet-300 transition-colors group/link"
                  whileHover={{ x: 5 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.a>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <a href="#" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all duration-300 font-medium">
            Read More Articles
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
