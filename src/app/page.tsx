'use client'

import { NavBar } from "@/components/navbar"
import { useRouter } from "next/navigation"
import { Trophy, Heart, Users, ArrowRight, Calendar, MapPin, CheckCircle, Star, Sun } from "lucide-react"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen">
      <NavBar />
      
      {/* Warm Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 overflow-hidden">
        {/* Background Pattern - Petanque Inspired */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-10" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D97706' fill-opacity='0.4'%3E%3Ccircle cx='20' cy='20' r='4'/%3E%3Ccircle cx='50' cy='40' r='6'/%3E%3Ccircle cx='15' cy='45' r='3'/%3E%3Ccircle cx='45' cy='15' r='5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 via-orange-50/70 to-red-50/70"></div>
        </div>
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-amber-200/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-red-200/15 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-2 mb-6">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-orange-800">Made for Pétanque Community</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900">
                Organize Perfect
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                  Pétanque Tournaments
                </span>
                With Love
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto lg:mx-0">
                Simple registration, live scoring, and community features designed specifically for pétanque clubs and players. Bring your community together.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <button 
                  onClick={() => router.push('/events/create')}
                  className="group bg-orange-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Create Tournament
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group border-2 border-orange-300 text-orange-700 bg-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  See Demo Tournament
                </button>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-8 justify-center lg:justify-start text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-700">100+</div>
                  <div className="text-sm text-gray-600">Clubs utilisant PétanquePro</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-700">2,500+</div>
                  <div className="text-sm text-gray-600">Joueurs connectés</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-700">500+</div>
                  <div className="text-sm text-gray-600">Tournois organisés</div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Visual */}
            <div className="relative">
              {/* Main Tournament Card */}
              <div className="relative bg-white/80 backdrop-blur-sm border border-orange-100 rounded-2xl p-8 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Tournoi des Platanes</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Parc Municipal • 32 équipes
                      </p>
                    </div>
                  </div>
                  
                  {/* Tournament Matches */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-sm text-gray-800">Les Boules d'Or</span>
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded font-medium">13-8</span>
                    </div>
                    <div className="flex justify-between items-center bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <span className="text-sm text-gray-800">Mistral Pétanque</span>
                      <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded font-medium">En cours</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <span className="text-sm text-gray-800">Club du Soleil</span>
                      <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded font-medium">À venir</span>
                    </div>
                  </div>
                  
                  {/* Community Badge */}
                  <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-lg p-3 mt-4">
                    <Users className="w-5 h-5 text-amber-600" />
                    <span className="text-sm text-gray-700">24 joueurs se sont inscrits aujourd'hui</span>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center shadow-lg">
                <Sun className="w-8 h-8 text-yellow-800" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-red-400 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-red-900" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Tout ce dont vous avez besoin pour
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600"> organiser</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des outils simples conçus spécialement pour la communauté pétanque
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Inscription Simple</h3>
              <p className="text-gray-600">
                Formulaire en ligne facile pour les joueurs, gestion automatique des équipes et des paiements.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Suivi en Direct</h3>
              <p className="text-gray-600">
                Saisie des scores sur mobile, tableaux mis à jour en temps réel, résultats instantanés.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 border border-red-100">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Communauté</h3>
              <p className="text-gray-600">
                Calendrier régional, profils joueurs, classements et partage de photos de tournoi.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Aimé par les clubs
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600"> de pétanque</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des témoignages authentiques d'organisateurs qui ont simplifié leurs tournois
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100 hover:shadow-lg transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-orange-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-gray-700 text-lg mb-6">
                "TournaMind a transformé notre concours annuel. Plus de paperasse, tout se fait simplement sur mobile. Nos joueurs adorent pouvoir suivre les résultats en direct !"
              </blockquote>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold">
                  ML
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Marie Leclerc</div>
                  <div className="text-gray-600 text-sm">Présidente, Club Pétanque Marseille</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100 hover:shadow-lg transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-orange-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-gray-700 text-lg mb-6">
                "Parfait pour nos tournois en plein air. L'interface mobile fonctionne même sous le soleil, et nos arbitres n'ont plus besoin de papier et crayon."
              </blockquote>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                  PD
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Pierre Dubois</div>
                  <div className="text-gray-600 text-sm">Organisateur, Tournoi des Platanes</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-2 bg-orange-100/80 text-orange-700 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-orange-200">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              Plus de 50 tournois de pétanque organisés ce mois-ci dans toute la France
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-orange-600 via-red-600 to-red-700 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-8">
              <Heart className="w-5 h-5 text-pink-200" />
              <span className="text-white font-medium">Gratuit jusqu'à 16 participants</span>
            </div>
            
            {/* Main Content */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Commencez votre
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">
                Premier Tournoi
              </span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-orange-100 mb-12 max-w-4xl mx-auto">
              Rejoignez la communauté pétanque qui simplifie l'organisation de tournois. Configuration en quelques minutes.
            </p>
            
            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
              {["Gratuit jusqu'à 16 joueurs", "Aucune carte bancaire", "Prêt en 3 minutes", "Support communautaire"].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-white/90 text-left">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span className="text-sm lg:text-base">{benefit}</span>
                </div>
              ))}
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={() => router.push('/events/create')}
                className="group bg-white text-orange-600 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-orange-50 transition-all duration-300 hover:scale-105 shadow-2xl flex items-center justify-center gap-3"
              >
                <Trophy className="w-6 h-6" />
                Créer un Tournoi
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group border-2 border-white/50 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm">
                Voir la Démo
              </button>
            </div>
            
            {/* Social Proof */}
            <div className="text-center">
              <p className="text-orange-200 mb-4">Utilisé par plus de 100 clubs de pétanque en France</p>
              <div className="flex justify-center items-center gap-8 opacity-60">
                <div className="text-white/60 text-sm">⭐⭐⭐⭐⭐ 4.8/5 étoiles</div>
                <div className="w-px h-4 bg-white/30"></div>
                <div className="text-white/60 text-sm">500+ tournois de pétanque</div>
                <div className="w-px h-4 bg-white/30"></div>
                <div className="text-white/60 text-sm">99% de satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
