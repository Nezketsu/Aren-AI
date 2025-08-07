
'use client'

import { NavBar } from "@/components/navbar";
import React from "react";
import { signIn } from "next-auth/react";


export default function LoginPage() {
  return (
    <>
      <NavBar />
      <main className="flex min-h-screen items-center justify-center  transition-colors duration-500">
        <section className="w-full max-w-sm p-8 rounded-2xl shadow-xl bg-white/15 backdrop-blur-md border border-white/30 relative flex flex-col items-center overflow-hidden">
          {/* Glassmorphism gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-30 pointer-events-none transition-all duration-300" />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-tr from-blue-400 to-blue-600 rounded-full p-3 shadow-lg">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#3b82f6" opacity="0.2"/><path d="M12 6v6l4 2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 className="text-2xl font-extrabold mb-2 text-center text-blue-900 mt-8">Sign in to <span className="text-blue-600">TournaMind</span></h1>
          <p className="text-sm text-gray-500 mb-6 text-center">AI-powered tournament OS for real-world events</p>
          <form className="space-y-4 w-full">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-blue-900 mb-1">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="e.g. +1 555 123 4567"
                className="mt-1 block w-full px-4 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-900 mb-1">Email (optional)</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="email"
                className="mt-1 block w-full px-4 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-blue-700 hover:scale-[1.03] active:scale-95 hover:shadow-lg"
            >
              Send Login Code
            </button>
          </form>
          <div className="flex items-center w-full my-5">
            <div className="flex-grow h-px bg-blue-200" />
            <span className="mx-3 text-xs text-gray-400">or</span>
            <div className="flex-grow h-px bg-blue-200" />
          </div>
          <button
            onClick={() => signIn("google")}
            className="w-full py-2 px-4 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold shadow flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 hover:scale-[1.03] active:scale-95 hover:shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" className="inline-block mr-2"><g><path fill="#4285F4" d="M43.611 20.083h-1.857V20H24v8h11.303c-1.627 4.657-6.084 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c2.438 0 4.7.747 6.591 2.021l6.418-6.418C33.047 5.532 28.761 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c11.045 0 20-8.955 20-20 0-1.341-.138-2.651-.389-3.917z"/><path fill="#34A853" d="M6.306 14.691l6.571 4.819C14.655 16.104 19.008 13 24 13c2.438 0 4.7.747 6.591 2.021l6.418-6.418C33.047 5.532 28.761 4 24 4c-7.797 0-14.675 4.417-18.306 10.691z"/><path fill="#FBBC05" d="M24 44c4.761 0 9.047-1.532 12.591-4.162l-5.799-4.755C28.184 36.741 26.164 37.5 24 37.5c-5.202 0-9.632-3.317-11.254-7.946l-6.523 5.034C9.3 41.556 16.162 44 24 44z"/><path fill="#EA4335" d="M43.611 20.083h-1.857V20H24v8h11.303c-.729 2.085-2.184 3.843-4.011 5.083l6.518 5.032C40.684 40.404 44 37.5 44 24c0-1.341-.138-2.651-.389-3.917z"/></g></svg>
            Sign in with Google
          </button>
          <p className="mt-6 text-xs text-gray-400 text-center">
            Powered by AI. Works offline & on low-end devices.<br/>
            <span className="text-gray-300">By continuing, you agree to our <a href="#" className="underline hover:text-blue-600">Terms</a> & <a href="#" className="underline hover:text-blue-600">Privacy Policy</a>.</span>
          </p>
        </section>
      </main>
    </>
  );
}