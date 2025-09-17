'use client'

import { Check } from 'lucide-react'

export function Pricing() {
  return (
    <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-amber-200/15 rounded-full blur-2xl"></div>
        </div>
        
        <div className="text-center mb-16 relative">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tarifs <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Pétanque</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Choisissez l'offre qui convient à vos tournois de pétanque
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col relative">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratuit</h3>
              <div className="flex items-end mb-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">0€</span>
                <span className="text-gray-600 ml-1">/tournoi</span>
              </div>
              <p className="text-gray-700">Parfait pour les petits concours occasionnels</p>
            </div>
            
            <div className="flex-grow space-y-3 mb-8">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Outils de base pour tournois</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Jusqu'à 16 participants</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Support communautaire</span>
              </div>
            </div>
            
            <button className="w-full py-3 border-2 border-orange-500 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors">
              Commencer Gratuitement
            </button>
          </div>
          
          {/* Pro Tier */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 p-8 rounded-2xl shadow-lg flex flex-col text-white relative transform hover:scale-105 transition-all duration-300">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Le Plus Populaire</span>
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="flex items-end mb-4">
                <span className="text-4xl font-bold">29€</span>
                <span className="text-orange-100 ml-1">/tournoi</span>
              </div>
              <p className="text-orange-100">Idéal pour les tournois réguliers</p>
            </div>
            
            <div className="flex-grow space-y-3 mb-8">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-yellow-300 mr-3 flex-shrink-0" />
                <span className="text-orange-100">Tout de l'offre Gratuite</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-yellow-300 mr-3 flex-shrink-0" />
                <span className="text-orange-100">Gestion automatique avancée</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-yellow-300 mr-3 flex-shrink-0" />
                <span className="text-orange-100">Jusqu'à 128 participants</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-yellow-300 mr-3 flex-shrink-0" />
                <span className="text-orange-100">Support prioritaire</span>
              </div>
            </div>
            
            <button className="w-full py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors">
              Essai Pro Gratuit
            </button>
          </div>
          
          {/* Enterprise Tier */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col relative">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Club Pro</h3>
              <div className="flex items-end mb-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Sur Mesure</span>
              </div>
              <p className="text-gray-700">Pour les grands événements et fédérations</p>
            </div>
            
            <div className="flex-grow space-y-3 mb-8">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Tout de l'offre Pro</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Participants illimités</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Intégrations personnalisées</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Support dédié</span>
              </div>
            </div>
            
            <button className="w-full py-3 border-2 border-amber-500 text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-colors">
              Nous Contacter
            </button>
          </div>
        </div>
        
        <div className="mt-16 text-center relative">
          <p className="text-gray-700 mb-2">Des questions sur les tarifs ?</p>
          <a href="#contact" className="text-orange-600 font-semibold hover:underline">Contactez notre équipe</a>
        </div>
      </div>
    </section>
  );
}
