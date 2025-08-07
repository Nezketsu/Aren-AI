


'use client';
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUser } from "./useUser";


export default function AccountPage() {
  const { user, loading } = useUser();
  // View/Edit mode state
  const [editMode, setEditMode] = React.useState(false);
  // Form state
  const [email, setEmail] = React.useState(user?.email || "");
  const [phone, setPhone] = React.useState("");
  const [verifSent, setVerifSent] = React.useState(false);
  const [verifCode, setVerifCode] = React.useState("");
  const [status, setStatus] = React.useState("");

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500">
        <div className="text-blue-900 text-lg font-semibold">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500">
        <div className="text-blue-900 text-lg font-semibold">Not authenticated.</div>
      </main>
    );
  }

  // Handlers (API integration needed)
  const handleSendVerif = async () => {
    setStatus("Sending verification code...");
    // TODO: Call API to send code to new email
    setVerifSent(true);
    setStatus("Verification code sent to " + email);
  };

  const handleVerifyEmail = async () => {
    setStatus("Verifying code...");
    // TODO: Call API to verify code and update email
    setStatus("Email updated!");
    setVerifSent(false);
    setVerifCode("");
  };

  const handleSavePhone = async () => {
    setStatus("Saving phone number...");
    // TODO: Call API to save phone number
    setStatus("Phone number updated!");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 flex items-center justify-center px-4">
      <section
        className="w-full max-w-md rounded-2xl glassmorphic-card shadow-xl p-8 flex flex-col items-center gap-6"
        aria-label="Account details"
      >
        <div className="relative w-24 h-24 mb-2">
          <Image
            src={user.image || "/assets/logo.png"}
            alt="Profile avatar"
            fill
            className="rounded-full border-4 border-white/40 shadow-lg object-cover"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-blue-900 drop-shadow-sm">{user.name || user.email}</h1>
        {!editMode ? (
          <>
            <p className="text-blue-900 text-center text-base">{user.email}</p>
            <Button className="w-full mt-4" onClick={() => setEditMode(true)} aria-label="Edit Profile">
              Edit Profile
            </Button>
          </>
        ) : (
          <>
            <form className="w-full flex flex-col gap-4 mt-4" onSubmit={e => e.preventDefault()}>
              {/* Email change section */}
              <label htmlFor="email" className="text-blue-900 font-medium">Change Email</label>
              <input
                id="email"
                type="email"
                className="w-full rounded-lg border border-blue-300 bg-white/60 p-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={verifSent}
                aria-label="New email address"
              />
              {!verifSent ? (
                <Button type="button" className="w-full" onClick={handleSendVerif} aria-label="Send verification code">
                  Send Verification Code
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    className="w-full rounded-lg border border-blue-300 bg-white/60 p-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={verifCode}
                    onChange={e => setVerifCode(e.target.value)}
                    placeholder="Enter verification code"
                    aria-label="Verification code"
                  />
                  <Button type="button" className="w-full" onClick={handleVerifyEmail} aria-label="Verify code">
                    Verify & Update Email
                  </Button>
                </div>
              )}
              {/* Phone number section */}
              <label htmlFor="phone" className="text-blue-900 font-medium mt-4">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="w-full rounded-lg border border-blue-300 bg-white/60 p-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Add your phone number"
                aria-label="Phone number"
              />
              <Button type="button" className="w-full" onClick={handleSavePhone} aria-label="Save phone number">
                Save Phone Number
              </Button>
              <Button type="button" variant="secondary" className="w-full" onClick={() => setEditMode(false)} aria-label="Cancel">
                Cancel
              </Button>
            </form>
            <p className="text-blue-700 text-sm mt-2 min-h-[1.5em]">{status}</p>
          </>
        )}
      </section>
    </main>
  );
}
