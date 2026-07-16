"use client";

import { motion } from "framer-motion";
import Button from "@/components/common/Button";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mx-auto max-w-2xl rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 p-10 text-center shadow-xl"
      >
        <motion.div
          animate={{ opacity: [0.8, 1], boxShadow: ["0 0 30px rgba(124,58,237,0.3)", "0 0 45px rgba(124,58,237,0.5)"] }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 4 }}
          className="absolute inset-0 rounded-2xl pointer-events-none"
        />
        <h2 className="text-3xl font-bold text-white mb-4">Ready to secure your stack?</h2>
        <p className="text-lg text-white mb-6">Start your free security analysis today and protect your assets.</p>
        <motion.div
          whileHover={{ scale: 1.04 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: 1, duration: 0.6 }}
        >
          <Button className="group mx-auto">
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
