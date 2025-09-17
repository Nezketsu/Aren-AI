'use client'

// Removed metadata export and import as it's not allowed in a Client Component
import { Geist, Geist_Mono, Rubik } from "next/font/google";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ...metadata export removed...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="/suppress-errors.js" async />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} antialiased`}
      >
        <ErrorBoundary>
          <SessionProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
