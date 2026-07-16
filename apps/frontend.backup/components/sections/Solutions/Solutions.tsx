'use client';

import { motion } from 'framer-motion';
import { Building2, Users, Code2, Gauge } from 'lucide-react';

const solutions = [
  {
    icon: Building2,
    title: 'Enterprise Security',
    description:
      'Comprehensive scanning for large organizations with complex infrastructure.',
    features: [
      'Multi-workspace support',
      'Role-based access control',
      'Centralized reporting',
      'Compliance management',
    ],
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Code2,
    title: 'Developer Teams',
    description:
      'Integrate security into your development pipeline with CI/CD automation.',
    features: [
      'GitHub integration',
      'Pre-commit scanning',
      'Pull request analysis',
      'Automated workflows',
    ],
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Users,
    title: 'Security Teams',
    description:
      'Advanced threat hunting and vulnerability management tools for security professionals.',
    features: [
      'Custom templates',
      'Deep analysis tools',
      'Threat intelligence',
      'Incident response',
    ],
    gradient: 'from-red-500 to-pink-500',
  },
  {
    icon: Gauge,
    title: 'Compliance & Audits',
    description:
      'Meet regulatory requirements with automated compliance checking and reporting.',
    features: [
      'PCI-DSS checks',
      'HIPAA compliance',
      'SOC 2 support',
      'Audit trails',
    ],
    gradient: 'from-green-500 to-emerald-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function Solutions() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-24" id="solutions">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl" />
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
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent">
              Solutions for Every Team
            </span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Tailored security solutions designed for your specific needs
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`} />

                {/* Card */}
                <div className="relative bg-[#0b1020]/75 border border-white/10 rounded-xl p-8 backdrop-blur group-hover:border-violet-400/30 transition-all duration-300 h-full">
                  {/* Icon */}
                  <div className={`mb-6 inline-flex p-4 rounded-lg bg-gradient-to-br ${solution.gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">
                    {solution.title}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {solution.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-gradient-to-r ${solution.gradient}`} />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Bottom Border */}
                  <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${solution.gradient} rounded-full w-0 group-hover:w-full transition-all duration-300`} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
