'use client'

import React from 'react'
import { Badge } from './ui/badge'
import { Trophy, Clock, Users, AlertTriangle } from 'lucide-react'

interface Player {
  id: string
  name: string
}

interface Match {
  id: string
  roundNumber: number
  matchNumber: number
  player1: Player | null
  player2: Player | null
  winner?: Player
  status: 'pending' | 'ready' | 'disputed' | 'completed'
  finalScore?: { player1Score: number; player2Score: number }
}

interface ModernTournamentBracketProps {
  matches: Match[]
  onMatchClick?: (match: Match) => void
}

export default function ModernTournamentBracket({ matches, onMatchClick }: ModernTournamentBracketProps) {
  const groupMatchesByRound = (matches: Match[]) => {
    const grouped = matches.reduce((acc, match) => {
      if (!acc[match.roundNumber]) {
        acc[match.roundNumber] = []
      }
      acc[match.roundNumber].push(match)
      return acc
    }, {} as Record<number, Match[]>)

    Object.keys(grouped).forEach(round => {
      grouped[parseInt(round)].sort((a, b) => a.matchNumber - b.matchNumber)
    })

    return grouped
  }

  const getRoundName = (roundNumber: number, totalRounds: number) => {
    if (roundNumber === totalRounds) return 'Final'
    if (roundNumber === totalRounds - 1) return 'Semi-Final'
    if (roundNumber === totalRounds - 2) return 'Quarter-Final'
    return `Round ${roundNumber}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'disputed': return 'bg-red-500'
      case 'ready': return 'bg-blue-500'
      case 'pending': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const getStatusBadge = (match: Match) => {
    switch (match.status) {
      case 'completed':
        return <Badge variant="default" className="gap-1 bg-green-600"><Trophy className="w-3 h-3" />Completed</Badge>
      case 'disputed':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Disputed</Badge>
      case 'ready':
        return <Badge variant="secondary" className="gap-1 bg-blue-600 text-white"><Clock className="w-3 h-3" />Ready</Badge>
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Users className="w-3 h-3" />Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Calculate positioning for bracket lines
  const getBracketLineHeight = (roundMatches: Match[]) => {
    return roundMatches.length * 120 + (roundMatches.length - 1) * 20
  }

  const renderMatch = (match: Match, index: number, totalInRound: number) => {
    const player1Name = match.player1?.name || 'TBD'
    const player2Name = match.player2?.name || 'TBD'
    const isClickable = onMatchClick && match.status !== 'pending'

    return (
      <div 
        key={match.id}
        className={`relative bg-white border-2 border-gray-200 rounded-lg p-4 mb-5 shadow-lg transition-all duration-300 hover:shadow-xl ${
          isClickable ? 'cursor-pointer hover:border-blue-400 hover:scale-105' : ''
        }`}
        style={{ 
          width: '280px',
          minHeight: '120px'
        }}
        onClick={() => isClickable && onMatchClick(match)}
      >
        {/* Match Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm font-bold text-gray-700">Match {match.matchNumber}</div>
          {getStatusBadge(match)}
        </div>

        {/* Players */}
        <div className="space-y-2">
          {/* Player 1 */}
          <div className={`flex justify-between items-center p-3 rounded-lg border-2 transition-all ${
            match.winner?.id === match.player1?.id 
              ? 'bg-gradient-to-r from-green-100 to-green-200 border-green-400 shadow-md' 
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                match.winner?.id === match.player1?.id ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className={`font-medium text-sm ${
                match.winner?.id === match.player1?.id ? 'text-green-800' : 'text-gray-700'
              }`}>
                {player1Name}
              </span>
            </div>
            {match.finalScore && (
              <span className={`font-bold text-lg ${
                match.winner?.id === match.player1?.id ? 'text-green-700' : 'text-gray-600'
              }`}>
                {match.finalScore.player1Score}
              </span>
            )}
          </div>

          {/* VS Divider */}
          <div className="text-center text-xs font-medium text-gray-500 py-1">VS</div>

          {/* Player 2 */}
          <div className={`flex justify-between items-center p-3 rounded-lg border-2 transition-all ${
            match.winner?.id === match.player2?.id 
              ? 'bg-gradient-to-r from-green-100 to-green-200 border-green-400 shadow-md' 
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                match.winner?.id === match.player2?.id ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className={`font-medium text-sm ${
                match.winner?.id === match.player2?.id ? 'text-green-800' : 'text-gray-700'
              }`}>
                {player2Name}
              </span>
            </div>
            {match.finalScore && (
              <span className={`font-bold text-lg ${
                match.winner?.id === match.player2?.id ? 'text-green-700' : 'text-gray-600'
              }`}>
                {match.finalScore.player2Score}
              </span>
            )}
          </div>
        </div>

        {/* Winner Badge */}
        {match.status === 'completed' && match.winner && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 rounded-full text-xs font-bold shadow-md">
              <Trophy className="w-3 h-3 mr-1" />
              Winner: {match.winner.name}
            </div>
          </div>
        )}

        {/* Status indicator bar */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-lg ${getStatusColor(match.status)}`}></div>
      </div>
    )
  }

  // Render bracket connectors
  const renderConnectors = (roundIndex: number, roundMatches: Match[], nextRoundMatches?: Match[]) => {
    if (!nextRoundMatches || roundIndex === rounds.length - 1) return null

    return (
      <div className="flex flex-col justify-center items-center" style={{ width: '60px', minHeight: getBracketLineHeight(roundMatches) }}>
        {roundMatches.map((_, index) => {
          if (index % 2 === 1) return null // Only draw connectors for even indices (pairs)
          
          const topMatchIndex = index
          const bottomMatchIndex = index + 1
          const targetMatchIndex = Math.floor(index / 2)
          
          return (
            <div key={`connector-${index}`} className="relative" style={{ height: '240px', marginBottom: index < roundMatches.length - 2 ? '20px' : '0' }}>
              {/* Horizontal lines from matches */}
              <div className="absolute left-0 w-8 h-0.5 bg-gray-400" style={{ top: '60px' }}></div>
              <div className="absolute left-0 w-8 h-0.5 bg-gray-400" style={{ top: '180px' }}></div>
              
              {/* Vertical connector */}
              <div className="absolute w-0.5 h-32 bg-gray-400" style={{ left: '32px', top: '60px' }}></div>
              
              {/* Horizontal line to next round */}
              <div className="absolute w-8 h-0.5 bg-gray-400" style={{ left: '32px', top: '120px' }}></div>
            </div>
          )
        })}
      </div>
    )
  }

  const groupedMatches = groupMatchesByRound(matches)
  const rounds = Object.keys(groupedMatches).map(Number).sort((a, b) => a - b)
  const totalRounds = Math.max(...rounds)

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg">
      {/* Tournament Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Tournament Bracket</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
      </div>

      {/* Bracket Container */}
      <div className="flex overflow-x-auto pb-6" style={{ minHeight: '600px' }}>
        <div className="flex items-start space-x-4">
          {rounds.map((roundNumber, roundIndex) => (
            <React.Fragment key={roundNumber}>
              {/* Round Column */}
              <div className="flex flex-col items-center">
                {/* Round Header */}
                <div className="sticky top-0 z-10 bg-white rounded-full px-6 py-2 shadow-lg border-2 border-gray-200 mb-6">
                  <h3 className="text-lg font-bold text-gray-800">
                    {getRoundName(roundNumber, totalRounds)}
                  </h3>
                </div>
                
                {/* Matches */}
                <div className="space-y-5">
                  {groupedMatches[roundNumber].map((match, matchIndex) => 
                    renderMatch(match, matchIndex, groupedMatches[roundNumber].length)
                  )}
                </div>
              </div>

              {/* Connectors */}
              {renderConnectors(
                roundIndex, 
                groupedMatches[roundNumber], 
                groupedMatches[rounds[roundIndex + 1]]
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-700">Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-700">Ready</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-700">Disputed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span className="text-gray-700">Pending</span>
        </div>
      </div>
    </div>
  )
}