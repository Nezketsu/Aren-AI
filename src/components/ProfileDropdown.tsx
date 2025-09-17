import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Clean avatar component with fallback
function ProfileAvatar({ user, size = 36 }: { user: any, size?: number }) {
  const [imgError, setImgError] = useState(false);
  
  const fallback = (
    <div
      className="rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
    </div>
  );
  
  if (!user?.image || imgError) return fallback;
  
  return (
    <img
      src={user.image}
      alt="Profile"
      className="rounded-full object-cover border border-gray-200"
      style={{ width: size, height: size }}
      onError={() => setImgError(true)}
      referrerPolicy="no-referrer"
    />
  );
}

export function ProfileDropdown({ session, signOut }: { session: any, signOut: () => void }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<any>({});

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const dropdownWidth = 240;
      let left = rect.left + rect.width / 2 - dropdownWidth / 2;
      
      // Keep dropdown within viewport
      if (left + dropdownWidth > window.innerWidth - 16) {
        left = window.innerWidth - dropdownWidth - 16;
      }
      if (left < 16) left = 16;
      
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left,
        width: dropdownWidth,
        zIndex: 50
      });
    }
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!btnRef.current) return;
      const dropdown = document.getElementById("profile-dropdown-menu");
      if (
        !btnRef.current.contains(e.target as Node) &&
        dropdown && !dropdown.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    
    if (open) {
      window.addEventListener("mousedown", handleClick);
      return () => window.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        className="rounded-full hover:ring-2 hover:ring-orange-400 hover:ring-opacity-20 transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <ProfileAvatar user={session.user} size={32} />
      </button>
      
      {open && typeof window !== 'undefined' && createPortal(
        <div
          id="profile-dropdown-menu"
          style={dropdownStyle}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-orange-100 py-2"
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <ProfileAvatar user={session?.user} size={40} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link 
              href="/account" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              Paramètres du Compte
            </Link>
            <Link 
              href="/events/mine" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              Mes Tournois
            </Link>
          </div>

          {/* Dev Controls (if applicable) */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={async () => {
                await fetch("/api/account/add-token", { method: "POST" });
                window.location.reload();
              }}
              className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
            >
              Add Token (DEV)
            </button>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
