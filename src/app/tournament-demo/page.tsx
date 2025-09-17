'use client'

import React from 'react'
import { NavBar } from '@/components/navbar'
import BracketFlow from '@/components/BracketFlow'

export default function TournamentDemoPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 pt-16">
        <BracketFlow 
          eventId="demo" 
          isOwner={true}
          currentUserId="demo-user"
        />
      </main>
    </>
  )
}