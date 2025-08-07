'use client'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { CreateEventModal } from "@/components/CreateEventModal"
import { ProfileDropdown } from "@/components/ProfileDropdown"
import { AnimatePresence, motion } from "framer-motion"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sprout } from "@/components/ui/sprout"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link";

export function NavBar() {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true)
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  
  useEffect(() => {
    function handleScroll() {
      const currentScrollPos = window.scrollY;
      // Determine if we're scrolling up or down
      // Also stay visible at the very top (position 0)
      setIsVisible((prevScrollPos > currentScrollPos) || currentScrollPos < 50);
      setPrevScrollPos(currentScrollPos);
    }
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollPos]);

  const navTextColor = "text-white";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* --- MOBILE MENU SECTION --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[100]"
          >
            {/* Overlay (fades in/out, no slide) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-md"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Fermer le menu mobile"
            />
            {/* Menu panel (slides in from left) */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="absolute left-0 top-0 h-full w-80 max-w-full glass-medium text-white shadow-2xl flex flex-col"
            >
              <span className="sr-only" id="mobile-menu-title" role="heading" aria-level={1}>Menu</span>
              <div className="flex flex-col h-full py-8 px-6 gap-6" aria-labelledby="mobile-menu-title">
                <Link href="/" className="text-2xl font-bold mb-4" onClick={() => setMobileMenuOpen(false)}>Seedly</Link>
                <Link href="/pricing" className="text-lg font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                <Link href="/events" className="text-lg font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Browse Events</Link>
                <Link href="/tournament" className="text-lg font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Tournament</Link>
                <Link href="/about" className="text-lg font-medium py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <div className="mt-auto flex flex-col gap-3">
                  {session?.user ? (
                    <>
                      <div className="flex items-center gap-3">
                        {session.user.image ? (
                          <img src={session.user.image} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-white/30" />
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-lg font-bold">
                            {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "?"}
                          </span>
                        )}
                        <span className="font-medium">{session.user.name || session.user.email}</span>
                      </div>
                      <Button onClick={() => { setMobileMenuOpen(false); signOut(); }} className="w-full mt-2 bg-white/20 border border-white/40 text-white">Sign out</Button>
                      <CreateEventModal />
                    </>
                  ) : (
                    <Button asChild variant="outline" className="w-full border-white/40 text-white"> 
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={cn(
        "fixed left-0 right-0 z-50 flex justify-center transition-all duration-300",
        isVisible ? "top-6 opacity-100" : "-top-32 opacity-0"
      )}>
        {/* Overlay above navbar for smooth color when mobile menu is open */}
        {mobileMenuOpen && (
          <div className="absolute inset-0 z-40 bg-white/10 backdrop-blur-xl transition-all duration-300 pointer-events-none" />
        )}
        <header
          className={cn(
            "glass-light rounded-full overflow-hidden relative w-full max-w-screen-lg md:max-w-screen-xl mx-auto transition-all duration-300",
            mobileMenuOpen && "glass-medium"
          )}
        >
          {/* Glassmorphism gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-30 pointer-events-none transition-all duration-300"></div>
          {/* Navbar content */}
          <div className="relative z-10 px-4 sm:px-8 md:px-12 py-4 flex items-center w-full">
            {/* Mobile burger menu (right side) */}
            <div className="md:hidden flex items-center absolute right-4 z-30">
              <Button
                variant="ghost"
                className="text-white focus:outline-none w-14 h-14 p-0 flex items-center justify-center"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Ouvrir le menu mobile"
              >
                <Menu className="w-10 h-10 scale-150" />
              </Button>
            </div>
            {/* Logo */}
            <div className="flex-shrink-0 w-auto relative z-20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-white" />
                </div>
                <Link href="/" className={cn("text-xl font-bold", navTextColor)}>Seedly</Link>
              </div>
            </div>
            {/* Navigation links - always centered */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-10">
              <NavigationMenu>
                <NavigationMenuList className="flex items-center space-x-6 md:space-x-10 justify-center">
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    href="/pricing" 
                    style={{backgroundColor: 'transparent'}}
                    className={cn(
                      "text-lg font-medium relative py-1 group text-white hover:text-black", 
                      "after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5",
                      "after:bg-black after:scale-x-0 after:origin-center",
                      "after:transition-transform after:duration-300 after:ease-out",
                      "hover:after:scale-x-100",
                      "transition-colors duration-300",
                      "[&]:hover:bg-transparent [&]:focus:bg-transparent [&]:active:bg-transparent"
                    )}
                  >
                    Pricing
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    href="/events" 
                    style={{backgroundColor: 'transparent'}}
                    className={cn(
                      "text-md font-medium relative py-1 group text-white hover:text-black",
                      "after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5",
                      "after:bg-black after:scale-x-0 after:origin-center",
                      "after:transition-transform after:duration-300 after:ease-out",
                      "hover:after:scale-x-100",
                      "transition-colors duration-300",
                      "[&]:hover:bg-transparent [&]:focus:bg-transparent [&]:active:bg-transparent"
                    )}
                  >
                    Browse Events
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    href="/tournament" 
                    style={{backgroundColor: 'transparent'}}
                    className={cn(
                      "text-md font-medium relative py-1 group text-white hover:text-black",
                      "after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5",
                      "after:bg-black after:scale-x-0 after:origin-center",
                      "after:transition-transform after:duration-300 after:ease-out",
                      "hover:after:scale-x-100",
                      "transition-colors duration-300",
                      "[&]:hover:bg-transparent [&]:focus:bg-transparent [&]:active:bg-transparent"
                    )}
                  >
                    Tournament
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    href="/about" 
                    style={{backgroundColor: 'transparent'}}
                    className={cn(
                      "text-md font-medium relative py-1 group text-white hover:text-black",
                      "after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5",
                      "after:bg-black after:scale-x-0 after:origin-center",
                      "after:transition-transform after:duration-300 after:ease-out",
                      "hover:after:scale-x-100",
                      "transition-colors duration-300",
                      "[&]:hover:bg-transparent [&]:focus:bg-transparent [&]:active:bg-transparent"
                    )}
                  >
                    About
                  </NavigationMenuLink>
                </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            {/* Buttons (desktop only) */}
            <div className="hidden md:flex items-center gap-2 md:gap-4 flex-shrink-0 absolute right-4 sm:right-8 md:right-12 z-20">
              {session?.user ? (
                <>
                  {/* Profile dropdown using custom popover, rendered outside the clipped navbar using a portal */}
                  <ProfileDropdown session={session} signOut={signOut} />
                  <CreateEventModal />
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button 
                      variant="outline"
                      className="bg-transparent border border-white/40 text-white text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 transition-all duration-300 ease-in-out hover:shadow-[0_4px_15px_rgba(0,0,0,0.15)] hover:border-white/60 hover:bg-white/10"
                    >
                      Log In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
      </div>
    </>
  );
}

