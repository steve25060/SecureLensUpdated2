'use client';

import { motion } from 'framer-motion';
import { Settings, Play, BarChart3, CheckCircle } from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: Settings,
    title: 'Configure Your Targets',
    description: 'Add your applications, APIs, infrastructure, and cloud resources to scan.',
    details: [
      'Single targets or bulk uploads',
      'Network ranges and subdomains',
      'Custom target groups',
    ],
  },
  {
    step: 2,
    icon: Play,
    title: 'Choose Scan Templates',
    description: 'Select from pre-built templates or create custom scanning profiles.',
    details: [
      'CVE detection templates',
      'Configuration audits',
      'Custom rulesets',
      'Compliance frameworks',
    ],
  },
  {
    step: 3,
    icon: BarChart3,
    title: 'Analyze Results',
    description: 'Review detailed findings with severity, exploitability, and impact ratings.',
    details: [
      'Real-time dashboards',
      'Detailed vulnerability reports',
      'Evidence and remediation steps',
    ],
  },
  {
    step: 4,
    icon: CheckCircle,
    title: 'Track & Remediate',
    description: 'Monitor remediation progress and verify security improvements.',
    details: [
      'Remediation tracking',
      'Compliance verification',
      'Trend analysis',
    ],
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-24" id="how-it-works">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl" />
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
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              How SecureLens Works
            </span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            A streamlined workflow to identify and eliminate security vulnerabilities
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="relative group">
                  {/* Card Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl blur-xl group-hover:blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-300" />

                  {/* Card Content */}
                  <div className="relative bg-[#0b1020]/75 border border-white/10 rounded-xl p-8 backdrop-blur group-hover:border-violet-400/30 transition-all duration-300 h-full">
                    {/* Step Number */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-bold text-gray-600 group-hover:text-violet-400 transition-colors">
                        Step {item.step}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      {item.description}
                    </p>

                    {/* Details List */}
                    <ul className="space-y-2">
                      {item.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            { label: 'Time to Insight', value: 'Minutes', icon: '⚡' },
            { label: 'False Positive Rate', value: '<5%', icon: '🎯' },
            { label: 'Coverage', value: '50+ Protocols', icon: '🛡️' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + idx * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 rounded-lg bg-[#0b1020]/75 border border-white/10 text-center"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-2xl font-bold text-violet-400 mb-1">
                {item.value}
              </div>
              <div className="text-gray-400 text-sm">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
