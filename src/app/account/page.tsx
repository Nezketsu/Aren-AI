


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
      <main className="min-h-screen flex items-center justify-center bg-solid-cream">
        <div className="text-gray-600 text-lg">Chargement...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-solid-cream">
        <div className="text-gray-600 text-lg">Veuillez vous connecter pour acc\u00e9der \u00e0 votre compte.</div>
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
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-8">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-20 h-20 relative">
                <Image
                  src={user.image || "/assets/logo.png"}
                  alt="Profile avatar"
                  fill
                  className="rounded-full object-cover"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name || user.email}</h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            {!editMode ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="text-sm text-gray-900">{user.name || "Not provided"}</dd>
                    </div>
                  </dl>
                </div>
                <Button onClick={() => setEditMode(true)}>
                  Edit Profile
                </Button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Profile</h3>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={verifSent}
                  />
                  {!verifSent ? (
                    <Button type="button" className="mt-2" onClick={handleSendVerif}>
                      Send Verification Code
                    </Button>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={verifCode}
                        onChange={e => setVerifCode(e.target.value)}
                        placeholder="Enter verification code"
                      />
                      <Button type="button" onClick={handleVerifyEmail}>
                        Verify & Update Email
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Add your phone number"
                  />
                  <Button type="button" className="mt-2" onClick={handleSavePhone}>
                    Save Phone Number
                  </Button>
                </div>

                <div className="flex space-x-3">
                  <Button type="button" variant="secondary" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </div>

                {status && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    {status}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
