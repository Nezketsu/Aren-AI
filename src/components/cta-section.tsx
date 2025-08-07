'use client'

import { motion } from 'framer-motion'

export function CtaSection() {
  return (
    <motion.div 
      className="bg-gradient-blue from-blue-600 to-blue-400 py-20 px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
        >
          Prêt à révolutionner vos tournois?
        </motion.h2>
        <motion.p 
          className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
        >
          Rejoignez les organisateurs qui utilisent TournaMind pour créer des expériences inoubliables pour leurs participants.
        </motion.p>
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.button 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Démarrer gratuitement
          </motion.button>
          <motion.button 
            className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Demander une démo
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
