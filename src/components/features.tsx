'use client'

import { Trophy, Calendar, Users, Sun } from "lucide-react"

export function Features() {
    return (
        <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-24 px-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-amber-200/15 rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-yellow-200/20 rounded-full blur-xl"></div>
            </div>
            
            <div className="max-w-6xl mx-auto relative">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Pourquoi Choisir <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">PétanquePro</span>
                    </h2>
                    <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                        La plateforme spécialement conçue pour organiser vos tournois de pétanque sous le soleil
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="text-center p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2">
                        <div className="bg-gradient-to-r from-orange-400 to-red-400 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Gestion Simplifiée</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Organisation automatique des tableaux et suivi en temps réel des matchs de pétanque
                        </p>
                    </div>
                    
                    <div className="text-center p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2">
                        <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Sun className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Interface Solaire</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Design optimisé pour les tournois en extérieur, lisible même en plein soleil
                        </p>
                    </div>
                    
                    <div className="text-center p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-yellow-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2">
                        <div className="bg-gradient-to-r from-yellow-400 to-amber-400 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Esprit Pétanque</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Connectez votre club, partagez vos moments et renforcez la convivialité
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
