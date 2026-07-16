'use client';

import { motion } from 'framer-motion';
import { responsiveConfig } from '@/config/responsive';
import { ShiningText } from '@/components/common/ShiningText';
import {
  Shield,
  Zap,
  Brain,
  BarChart3,
  Lock,
  AlertCircle,
  Code2,
  GitBranch,
  Database,
  CloudOff,
  Eye,
  Radar,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Unified Security Scanning',
    description:
      'Scan for vulnerabilities, misconfigurations, and secrets across your entire infrastructure with a single dashboard.',
    color: 'from-violet-500 to-indigo-500',
  },
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description:
      'Leverage machine learning to identify complex vulnerability patterns and threat correlations automatically.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Real-time Threat Detection',
    description:
      'Get instant alerts on critical vulnerabilities with actionable remediation steps.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Track security metrics, trends, and compliance status with comprehensive reporting tools.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Code2,
    title: 'Multi-Protocol Support',
    description:
      'Support for HTTP, DNS, TCP, SSL, WHOIS, JavaScript, and specialized security protocols.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: GitBranch,
    title: 'CI/CD Integration',
    description:
      'Seamlessly integrate with your development pipeline for continuous security testing.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Database,
    title: 'Comprehensive Reporting',
    description:
      'Generate detailed findings reports and export data in multiple formats for compliance.',
    color: 'from-violet-500 to-blue-500',
  },
  {
    icon: CloudOff,
    title: 'Flexible Deployment',
    description:
      'Deploy on-premises or in the cloud. Full control over your scanning infrastructure.',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    icon: Eye,
    title: 'Zero False Positives',
    description:
      'Simulates real-world attack scenarios to verify vulnerabilities and minimize noise.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: AlertCircle,
    title: 'Smart Severity Levels',
    description:
      'Intelligent prioritization based on exploitability, impact, and your environment.',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: Radar,
    title: 'Passive Scanning',
    description:
      'Monitor and analyze HTTP responses without active probing for stealth.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description:
      'SOC 2 compliance, SAML SSO, team workspaces, and role-based access control.',
    color: 'from-blue-500 to-indigo-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Features() {
  return (
    <section id="features" className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 sm:py-12 lg:py-16">
      {/* Background gradient matching hero theme */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
            <ShiningText className="text-3xl sm:text-4xl lg:text-5xl">Powerful Security Features</ShiningText>
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-gray-300 max-w-2xl mx-auto px-2">
            Everything you need to identify, analyze, and remediate security vulnerabilities at scale
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                
                <div className="relative bg-[#0b1020]/75 border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur group-hover:border-violet-400/30 transition-all duration-300 h-full flex flex-col">
                  {/* Icon Container */}
                  <div className={`mb-3 sm:mb-4 inline-flex p-3 sm:p-4 rounded-lg bg-gradient-to-br ${feature.color} shadow-lg shadow-white/10 w-fit`}>
                    <Icon className="w-6 sm:w-8 h-6 sm:h-8 text-white drop-shadow-md" />
                  </div>

                  {/* Content */}
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 group-hover:text-violet-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed flex-grow">
                    {feature.description}
                  </p>

                  {/* Bottom Border Animation */}
                  <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} rounded-full w-0 group-hover:w-full transition-all duration-300`} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
