import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Robust avatar component with fallback on error
function ProfileAvatar({ user, size = 36 }: { user: any, size?: number }) {
  const [imgError, setImgError] = useState(false);
  const fallback = (
    <span
      className="rounded-full bg-gray-300 flex items-center justify-center text-white text-lg font-bold"
      style={{ width: size, height: size }}
    >
      {user?.name?.charAt(0) || user?.email?.charAt(0) || "?"}
    </span>
  );
  if (!user?.image || imgError) return fallback;
  return (
    <img
      src={user.image}
      alt="Profile"
      className="rounded-full object-cover"
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
      const minWidth = 260;
      const maxWidth = 340;
      // Center the dropdown below the button, using actual dropdown width if possible
      let left = rect.left + rect.width / 2 - minWidth / 2;
      // Clamp dropdown to viewport
      if (left + minWidth > window.innerWidth - 8) {
        left = window.innerWidth - minWidth - 8;
      }
      if (left < 8) left = 8;
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 10,
        left,
        minWidth,
        maxWidth,
        zIndex: 9999,
        transform: `translateX(0)` // ensure no accidental offset
      });
    }
  }, [open]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!btnRef.current) return;
      // Only close if click is outside both button and dropdown
      const dropdown = document.getElementById("profile-dropdown-menu");
      if (
        !btnRef.current.contains(e.target as Node) &&
        dropdown && !dropdown.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      window.addEventListener("mousedown", onClick);
    } else {
      window.removeEventListener("mousedown", onClick);
    }
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        className="bg-white/20 border border-white/40 rounded-full w-10 h-10 flex items-center justify-center overflow-hidden shadow hover:shadow-lg transition-all focus:outline-none"
        title="Profile"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <ProfileAvatar user={session.user} size={36} />
      </button>
      {open && typeof window !== 'undefined' && createPortal(
        <div
          id="profile-dropdown-menu"
          style={dropdownStyle}
          className="py-4 my-3 px-5 flex flex-col gap-2 text-gray-900 rounded-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[9999] animate-fadeIn max-w-[340px] overflow-x-auto backdrop-blur-md bg-white/15 relative tracking-wide"
          tabIndex={-1}
        >
          {/* Glassmorphism gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-30 pointer-events-none rounded-2xl" />
          <div className="relative z-10 flex items-center gap-3 mb-2 tracking-wider">
            <ProfileAvatar user={session?.user} size={32} />
            <span className="font-medium text-sm text-white">{session?.user?.name || session?.user?.email}</span>
          </div>
          <Link href="/account" className="relative z-10 text-base md:text-sm font-medium text-white py-2 px-2 rounded hover:bg-white/20 transition-colors tracking-wider ">Account Settings</Link>
          <Link href="/events/mine" className="relative z-10 text-base md:text-sm font-medium text-white py-2 px-2 rounded hover:bg-white/20 transition-colors tracking-wider ">My Events</Link>
          <Link href="/notifications" className="relative z-10 text-base md:text-sm font-medium text-white py-2 px-2 rounded hover:bg-white/20 transition-colors tracking-wider ">Notifications</Link>
          {/* DEV ONLY: Add Token Button */}
          <Button
            onClick={async () => {
              await fetch("/api/account/add-token", { method: "POST" });
              window.location.reload();
            }}
            className="relative z-10 w-full font-bold text-base md:text-sm bg-green-600 text-white border-none shadow hover:bg-green-700 hover:shadow-lg transition-all duration-200 py-2 rounded-xl tracking-wider focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            Add Token (DEV)
          </Button>
          <Button
            onClick={() => signOut()}
            className="relative z-10 mt-2 w-full font-bold text-base md:text-sm bg-white/20 text-white border-none shadow hover:bg-white/30 hover:shadow-lg transition-all duration-200 py-2 rounded-xl tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Log Out
          </Button>
        </div>,
        document.body
      )}
    </>
  );
}
