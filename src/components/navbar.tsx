'use client'

import { Button } from "@/components/ui/button"
import { CreateEventModal } from "@/components/CreateEventModal"
import { ProfileDropdown } from "@/components/ProfileDropdown"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link";

export function NavBar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed top-0 right-0 h-full w-80 max-w-full bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-4">
                <Link href="/" className="block py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/events" className="block py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Events</Link>
                <Link href="/pricing" className="block py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                {session?.user ? (
                  <>
                    <Link href="/account" className="block py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Account</Link>
                    <button onClick={() => { setMobileMenuOpen(false); signOut(); }} className="block py-2 text-lg text-red-600">Sign out</button>
                  </>
                ) : (
                  <Link href="/login" className="block py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Navbar */}
      <header className="bg-gradient-to-r from-orange-50 to-amber-50 shadow-sm border-b border-orange-100 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">⚪</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">PétanquePro</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/events" className="text-orange-700 hover:text-orange-900 transition-colors font-medium">Tournois</Link>
              <Link href="/pricing" className="text-orange-700 hover:text-orange-900 transition-colors font-medium">Tarifs</Link>
            </nav>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {session?.user ? (
                <>
                  <ProfileDropdown session={session} signOut={signOut} />
                  <CreateEventModal />
                </>
              ) : (
                <Link href="/login">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600">Se Connecter</Button>
                </Link>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2" 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

