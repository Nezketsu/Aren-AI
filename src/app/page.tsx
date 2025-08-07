'use client'

import { NavBar } from "@/components/navbar"
import { Features } from "@/components/features"
import { CtaSection } from "@/components/cta-section"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background gradient that spans entire page */}
      <div className="absolute inset-0 bg-gradient-blue -z-20"></div>
      
      {/* Navigation */}
      <NavBar />

      {/* Hero Section */}
      <main className="h-[90vh] w-full flex flex-col items-center justify-center px-4 text-center relative">
        <motion.h1 
          className="text-5xl md:text-7xl font-bold text-white mb-6 mx-auto max-w-4xl font-rubik drop-shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          Seedly
        </motion.h1>
        <motion.p 
          className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 font-rubik drop-shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          Plateforme IA pour la gestion de tournois physiques. 
          Automatise la planification, résolution de conflits et engagement communautaire.
        </motion.p>
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <motion.button 
            className="bg-white/80 backdrop-blur-sm text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Créer un tournoi
          </motion.button>
          <motion.button 
            className="border-2 border-white/70 backdrop-blur-sm text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Voir la démo
          </motion.button>
        </motion.div>
        <motion.div 
          className="absolute inset-0 bg-cover bg-center -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.7 }}
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        ></motion.div>
      </main>
      {/* Static white background behind features, always visible and outside animation */}
      <div className="bg-gradient-to-t from-gray-100/100 to-transparent h-[20vh] w-full"></div>
      <div>
        <div className="bg-gray-100">
          <Features />
        </div>
        <div className="bg-gradient-to-b from-gray-100/100 to-transparent h-[20vh] w-full"></div>
        <CtaSection />
      </div>
    </div>
  )
}
