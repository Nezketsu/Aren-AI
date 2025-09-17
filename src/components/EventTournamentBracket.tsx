'use client'

import React, { useState, useEffect, useCallback } from 'react'
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  Node,
  Edge,
  Position,
  Handle,
  NodeProps,
  NodeChange,
  EdgeChange,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Alert, AlertDescription } from './ui/alert'
import { AlertTriangle, Trophy, Clock, Users } from 'lucide-react'

interface Participant {
  id: string
  name: string
  email?: string
  user?: {
    id: string
    name?: string | null
    profilePic?: string | null
  }
}

interface Match {
  id: string
  name: string
  participants: Participant[]
  winner?: string
  status: 'ready' | 'waiting' | 'completed'
  sourceMatchIds?: string[]
  scores?: { participantId: string; score: number }[]
}

interface BracketRound {
  roundName: string
  matches: Match[]
}

interface EventTournamentBracketProps {
  eventId: string
  isOwner: boolean
  currentUserId?: string
}

const MatchNode = ({ data }: NodeProps<{ match: Match; onDeclareWinner: (matchId: string, winnerId: string) => void; onOpenScoreDialog: (match: Match) => void; isOwner: boolean; canSubmitScore: boolean }>) => {
  const { match, onDeclareWinner, onOpenScoreDialog, isOwner, canSubmitScore } = data
  const participant1 = match.participants?.[0]
  const participant2 = match.participants?.[1]
  const participant1Name = participant1?.name || participant1?.user?.name || 'TBD'
  const participant2Name = participant2?.name || participant2?.user?.name || 'TBD'

  const getScore = (participantId: string) => {
    const score = match.scores?.find(s => s.participantId === participantId)
    return score ? score.score : '-'
  }

  return (
    <Card className="w-72 shadow-lg">
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">{match.name}</CardTitle>
          <Badge variant={match.status === 'completed' ? 'default' : 'secondary'}>{match.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <div className={`p-2 rounded border flex justify-between items-center ${match.winner === (participant1?.id || participant1?.user?.id) ? 'bg-green-100 border-green-300' : 'bg-gray-50'}`}>
            <span className="font-medium">{participant1Name}</span>
            <span className="font-bold">{getScore(participant1?.id || participant1?.user?.id || '')}</span>
          </div>
          <div className={`p-2 rounded border flex justify-between items-center ${match.winner === (participant2?.id || participant2?.user?.id) ? 'bg-green-100 border-green-300' : 'bg-gray-50'}`}>
            <span className="font-medium">{participant2Name}</span>
            <span className="font-bold">{getScore(participant2?.id || participant2?.user?.id || '')}</span>
          </div>
        </div>
        {canSubmitScore && match.status === 'ready' && (
          <Button size="sm" className="w-full" onClick={() => onOpenScoreDialog(match)}>Submit Score</Button>
        )}
      </CardContent>
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </Card>
  )
}

const nodeTypes = {
  matchNode: MatchNode,
}

export default function EventTournamentBracket({ eventId, isOwner, currentUserId }: EventTournamentBracketProps) {
  const [bracket, setBracket] = useState<BracketRound[]>([])
  const [loading, setLoading] = useState(true)
  const [scoreDialogMatch, setScoreDialogMatch] = useState<Match | null>(null)
  const [participant1Score, setParticipant1Score] = useState('')
  const [participant2Score, setParticipant2Score] = useState('')
  const [submittingScore, setSubmittingScore] = useState(false)

  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes])
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges])

  const fetchBracket = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/bracket`)
      if (response.ok) {
        const data = await response.json()
        setBracket(data.bracket || [])
      }
    } catch (error) {
      console.error('Error fetching bracket:', error)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchBracket()
  }, [fetchBracket])

  useEffect(() => {
    if (bracket.length > 0) {
      const newNodes: Node[] = []
      const newEdges: Edge[] = []
      const roundWidth = 400
      const matchHeight = 250

      bracket.forEach((round, roundIndex) => {
        const x = roundIndex * roundWidth
        round.matches.forEach((match, matchIndex) => {
          const y = matchIndex * matchHeight + (matchHeight / 2 * (bracket[roundIndex-1]?.matches.length / round.matches.length || 0))
          
          newNodes.push({
            id: match.id,
            type: 'matchNode',
            position: { x, y },
            data: { 
              match,
              onDeclareWinner: declareWinner,
              onOpenScoreDialog: setScoreDialogMatch,
              isOwner,
              canSubmitScore: canSubmitScore(match)
            },
          })

          if (match.sourceMatchIds) {
            match.sourceMatchIds.forEach(sourceId => {
              newEdges.push({
                id: `e-${sourceId}-${match.id}`,
                source: sourceId,
                target: match.id,
                animated: true,
                style: { stroke: '#6b7280' },
              })
            })
          }
        })
      })

      setNodes(newNodes)
      setEdges(newEdges)
    }
  }, [bracket, isOwner, currentUserId])

  const fetchBracket = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/bracket`)
      if (response.ok) {
        const data = await response.json()
        setBracket(data.bracket || [])
      }
    } catch (error) {
      console.error('Error fetching bracket:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitScore = async (matchId: string, p1Score: number, p2Score: number) => {
    setSubmittingScore(true)
    try {
      const p1 = scoreDialogMatch?.participants?.[0]
      const p2 = scoreDialogMatch?.participants?.[1]
      if (!p1 || !p2) return

      const scores = [
        { participantId: p1.id || p1.user?.id, score: p1Score },
        { participantId: p2.id || p2.user?.id, score: p2Score }
      ]

      const response = await fetch(`/api/events/${eventId}/matches/${matchId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores }),
      })

      if (response.ok) {
        const data = await response.json()
        setScoreDialogMatch(null)
        setParticipant1Score('')
        setParticipant2Score('')
        
        if (data.matchCompleted) {
          alert(`Match completed! Winner: ${data.winner}`)
        } else if (data.dispute) {
          alert('Score conflict detected. Tournament owner will resolve.')
        } else {
          alert('Score submitted. Waiting for opponent score.')
        }
        
        fetchBracket()
      } else {
        const error = await response.json()
        alert(`Error submitting score: ${error.message}`)
      }
    } catch (error) {
      console.error('Error submitting score:', error)
      alert('Error submitting score')
    } finally {
      setSubmittingScore(false)
    }
  }

  const declareWinner = async (matchId: string, winnerId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/matches/${matchId}/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ winnerId }),
      })

      if (response.ok) {
        fetchBracket()
      }
    } catch (error) {
      console.error('Error declaring winner:', error)
    }
  }

  const canSubmitScore = (match: Match) => {
    if (!currentUserId || !match.participants || match.participants.length < 2) return false
    if (match.status !== 'ready') return false
    
    const isParticipant = match.participants.some(p => 
      p.id === currentUserId || p.user?.id === currentUserId
    )
    return isParticipant
  }

  if (loading) {
    return <div className="text-center py-8">Loading tournament bracket...</div>
  }

  return (
    <div className="text-center py-8">
      <p className="text-gray-600">Bracket component replaced by BracketFlow</p>
    </div>
  )
}