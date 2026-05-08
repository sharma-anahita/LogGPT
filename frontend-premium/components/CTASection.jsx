'use client'

import { motion } from 'framer-motion'

export function CTASection({ onCtaClick }) {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Background gradient */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 glass p-12 md:p-16 rounded-3xl border border-white/10 text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-6xl font-black mb-6"
          >
            Ready to Transform Your Observability?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-8"
          >
            Join forward-thinking teams that are already using LogGPT to understand their infrastructure better.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCtaClick}
              className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-black hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
            >
              Get Started Now
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 border border-white/20 rounded-lg font-semibold hover:border-white/40 hover:bg-white/5 transition-all duration-300"
            >
              Book a Demo
            </motion.button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-white/10"
          >
            <p className="text-sm text-white/50 mb-4">Used by teams at:</p>
            <div className="flex flex-wrap justify-center gap-8 text-white/50">
              <span>Scale Inc</span>
              <span>•</span>
              <span>DataFlow Labs</span>
              <span>•</span>
              <span>CloudPeak</span>
              <span>•</span>
              <span>Infrastructure Co</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
