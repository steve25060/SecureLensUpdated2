"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-[#05030a] text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl grid grid-cols-1 gap-8 md:grid-cols-4"
      >
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Product</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="#features" className="hover:text-white">Features</a></li>
            <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
            <li><a href="#docs" className="hover:text-white">Docs</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Company</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="#about" className="hover:text-white">About</a></li>
            <li><a href="#blog" className="hover:text-white">Blog</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Resources</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="https://github.com" className="hover:text-white">GitHub</a></li>
            <li><a href="#" className="hover:text-white">API</a></li>
            <li><a href="#" className="hover:text-white">Support</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Legal</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="#" className="hover:text-white">Privacy</a></li>
            <li><a href="#" className="hover:text-white">Terms</a></li>
            <li><a href="#" className="hover:text-white">Cookies</a></li>
          </ul>
        </div>
        {/* Social Icons */}
        <motion.div
          className="flex space-x-4 mt-4 md:mt-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {["github", "twitter", "linkedin"].map((name) => (
            <motion.a
              key={name}
              href="#"
              whileHover={{ scale: 1.04, rotate: 10 }}
              className="text-gray-400 hover:text-white"
            >
              <span className="sr-only">{name}</span>
              {/* Placeholder icons – replace with actual SVGs or icons */}
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </motion.a>
          ))}
        </motion.div>
      </motion.div>
      <motion.div
        className="mt-8 text-center text-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        © 2026 SecureLens. Built for developers and security professionals.
      </motion.div>
    </footer>
  );
}
