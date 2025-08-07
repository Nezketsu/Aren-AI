'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

// Animation variants for the whole pricing section
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    }
  }
};

// Animation variants for the header elements
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

// Animation variants for the pricing cards container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Animation variants for each pricing card
const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring" as const, 
      stiffness: 100, 
      damping: 15 
    }
  }
};

export function Pricing() {
  return (
    <motion.div 
      className="pricing px-4 pt-32 pb-24 min-h-screen relative z-10"
      variants={sectionVariants}
      initial="hidden"
      id='pricing'
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="text-center mb-16">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          variants={headerVariants}
        >
          Tarification Simple
        </motion.h2>
        <motion.p
          className="text-xl text-white max-w-2xl mx-auto"
          variants={headerVariants}
        >
          Choisissez le forfait qui correspond à vos besoins
        </motion.p>
      </div>
      
      <motion.div 
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={containerVariants}
      >
        {/* Free Tier */}
        <motion.div 
          className="pricing-card p-8 bg-gradient-to-tr bg-gray-100/90 border border-gray-100/50 shadow-sm rounded-xl hover:shadow-xl transition-all flex flex-col h-full"
          variants={cardVariants}
        >
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Gratuit</h3>
            <div className="flex items-end">
              <span className="text-4xl font-bold text-gray-900">€0</span>
              <span className="text-gray-500 ml-1">/événement</span>
            </div>
            <p className="text-blue-900 text-lg mt-3">Parfait pour les petits tournois occasionnels</p>
          </div>
          
          <div className="flex-grow space-y-4">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-gray-800">Planification de base</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-gray-800">Alertes SMS</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-gray-800">Jusqu&apos;à 10 participants</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-gray-800">Support communautaire</span>
            </div>
          </div>
          
          <motion.button 
            className="mt-8 w-full py-3 border-2 border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Commencer gratuitement
          </motion.button>
        </motion.div>
        
        {/* Pro Tier */}
        <motion.div 
          className="pricing-card p-8 bg-blue-500 border border-blue-600 shadow-sm rounded-xl hover:shadow-xl transition-all flex flex-col h-full relative overflow-hidden"
          variants={cardVariants}
        >
          {/* <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-3 py-1 uppercase tracking-wider transform translate-x-2 -translate-y-0 rotate-45 origin-bottom-left">
            Populaire
          </div> */}
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-white mb-2">Pro</h3>
            <div className="flex items-end">
              <span className="text-4xl font-bold text-white">€20</span>
              <span className="text-blue-100 ml-1">/événement</span>
            </div>
            <p className="text-blue-100 mt-3">Idéal pour les tournois réguliers</p>
          </div>
          
          <div className="flex-grow space-y-4 text-white">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-yellow-300 mr-2" />
              <span className="text-blue-100">Toutes les fonctionnalités gratuites</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-yellow-300 mr-2" />
              <span className="text-blue-100">Fonctionnalités IA complètes</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-yellow-300 mr-2" />
              <span className="text-blue-100">Jusqu&apos;à 100 participants</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-yellow-300 mr-2" />
              <span className="text-blue-100">Commissions de parrainage</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-yellow-300 mr-2" />
              <span className="text-blue-100">Support prioritaire</span>
            </div>
          </div>
          
          <motion.button 
            className="mt-8 w-full py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            S&apos;inscrire maintenant
          </motion.button>
        </motion.div>
        
        {/* Enterprise Tier */}
        <motion.div 
          className="pricing-card p-8 bg-gray-100/90 border border-gray-100/50 shadow-sm rounded-xl hover:shadow-xl transition-all transition-discrete flex flex-col h-full"
          variants={cardVariants}
        >
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Entreprise</h3>
            <div className="flex items-end">
              <span className="text-4xl font-bold text-gray-900">Sur mesure</span>
            </div>
            <p className="text-blue-900 text-lg mt-3">Pour les grands événements et fédérations</p>
          </div>
          
          <div className="flex-grow space-y-4">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-gray-800">Toutes les fonctionnalités Pro</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-gray-800">Participants illimités</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-gray-800">API personnalisée</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-gray-800">Gestionnaire de compte dédié</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-gray-800">Intégration avec vos systèmes</span>
            </div>
          </div>
          
          <motion.button 
            className="mt-8 w-full py-3 border-2 border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Contacter les ventes
          </motion.button>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="mt-16 text-center max-w-3xl mx-auto"
        variants={headerVariants}
      >
        <p className="text-gray-600">Vous avez des questions sur nos tarifs?</p>
        <a href="#contact" className="inline-block mt-2 text-blue-500 font-semibold hover:underline">Contactez notre équipe</a>
      </motion.div>
    </motion.div>
  );
}
