'use client'

import { Icons } from "@/components/ui/icons"
import { motion } from 'framer-motion'

// Animation variants for the container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

// Animation variants for each feature card
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
}

// Animation variants for the whole feature section
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

export function Features() {
    return (
        <motion.div 
            className="features px-4 py-24 relative z-10"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
        >
            <div className="text-center mb-16">
                <motion.h2 
                    className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                    variants={headerVariants}
                >
                    Powerful Features
                </motion.h2>
                <motion.p
                    className="text-xl text-gray-700 max-w-2xl mx-auto"
                    variants={headerVariants}
                >
                    Everything you need to manage tournaments with AI assistance
                </motion.p>
            </div>
            
            <motion.div 
                className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
                variants={containerVariants}
            >
                {/* AI-Powered Management */}
                <motion.div 
                    className="feature-card p-8 glass-light rounded-xl hover:shadow-xl transition-all duration-300"
                    variants={cardVariants}
                >
                    <div className="feature-icon bg-blue-500/80 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                        <Icons.robot className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">AI-Powered Management</h3>
                    <p className="text-gray-700">Intelligent tournament organization with automated scheduling and conflict resolution.</p>
                </motion.div>
                
                {/* Smart Planning */}
                <motion.div 
                    className="feature-card p-8 glass-light rounded-xl hover:shadow-xl transition-all duration-300"
                    variants={cardVariants}
                >
                    <div className="feature-icon bg-blue-500/80 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                        <Icons.calendar className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">Smart Planning</h3>
                    <p className="text-gray-700">Effortless event planning with automated bracket generation and time management.</p>
                </motion.div>
                
                {/* Community Engagement */}
                <motion.div 
                    className="feature-card p-8 glass-light rounded-xl hover:shadow-xl transition-all duration-300"
                    variants={cardVariants}
                >
                    <div className="feature-icon bg-blue-500/80 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                        <Icons.users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">Community Engagement</h3>
                    <p className="text-gray-700">Enhanced participant interaction with real-time updates and communication tools.</p>
                </motion.div>
                
                {/* Tournament Tracking */}
                <motion.div 
                    className="feature-card p-8 glass-light rounded-xl hover:shadow-xl transition-all duration-300"
                    variants={cardVariants}
                >
                    <div className="feature-icon bg-blue-500/80 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                        <Icons.trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">Tournament Tracking</h3>
                    <p className="text-gray-700">Comprehensive results tracking with detailed analytics and performance insights.</p>
                </motion.div>
                
                {/* Real-time Updates */}
                <motion.div 
                    className="feature-card p-8 glass-light rounded-xl hover:shadow-xl transition-all duration-300"
                    variants={cardVariants}
                >
                    <div className="feature-icon bg-blue-500/80 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                        <Icons.zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">Real-time Updates</h3>
                    <p className="text-gray-700">Instant notifications and live tournament progress for all participants.</p>
                </motion.div>
                
                {/* Conflict Resolution */}
                <motion.div 
                    className="feature-card p-8 glass-light rounded-xl hover:shadow-xl transition-all duration-300"
                    variants={cardVariants}
                >
                    <div className="feature-icon bg-blue-500/80 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                        <Icons.shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">Conflict Resolution</h3>
                    <p className="text-gray-700">Automated dispute handling with fair and transparent resolution processes.</p>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
