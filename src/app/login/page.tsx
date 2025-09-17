
'use client'

import { NavBar } from "@/components/navbar";
import React from "react";
import { signIn } from "next-auth/react";


export default function LoginPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-solid-cream pt-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Bon Retour !</h1>
              <p className="text-gray-700">Connectez-vous à votre compte PétanquePro</p>
            </div>
            <form className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Numéro de Téléphone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+33 6 12 34 56 78"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email (Optionnel)</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              >
                Envoyer le Code
              </button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou continuez avec</span>
                </div>
              </div>
              
              <button
                onClick={() => signIn("google")}
                className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-3"
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#4285F4" d="M43.611 20.083h-1.857V20H24v8h11.303c-1.627 4.657-6.084 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c2.438 0 4.7.747 6.591 2.021l6.418-6.418C33.047 5.532 28.761 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c11.045 0 20-8.955 20-20 0-1.341-.138-2.651-.389-3.917z"/>
                  <path fill="#34A853" d="M6.306 14.691l6.571 4.819C14.655 16.104 19.008 13 24 13c2.438 0 4.7.747 6.591 2.021l6.418-6.418C33.047 5.532 28.761 4 24 4c-7.797 0-14.675 4.417-18.306 10.691z"/>
                  <path fill="#FBBC05" d="M24 44c4.761 0 9.047-1.532 12.591-4.162l-5.799-4.755C28.184 36.741 26.164 37.5 24 37.5c-5.202 0-9.632-3.317-11.254-7.946l-6.523 5.034C9.3 41.556 16.162 44 24 44z"/>
                  <path fill="#EA4335" d="M43.611 20.083h-1.857V20H24v8h11.303c-.729 2.085-2.184 3.843-4.011 5.083l6.518 5.032C40.684 40.404 44 37.5 44 24c0-1.341-.138-2.651-.389-3.917z"/>
                </svg>
                Se connecter avec Google
              </button>
            </div>
            
            <p className="mt-6 text-center text-sm text-gray-500">
              En continuant, vous acceptez nos{' '}
              <a href="#" className="text-orange-600 hover:underline">Conditions d'Utilisation</a>
              {' '}et notre{' '}
              <a href="#" className="text-orange-600 hover:underline">Politique de Confidentialité</a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}