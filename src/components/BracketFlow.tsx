'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Node,
  Edge,
  Position,
  Handle,
  NodeProps,
  NodeChange,
  EdgeChange,
  Background,
  Controls,
  ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Trophy, Clock, Users } from 'lucide-react'
import { useToast, toastHelpers } from './ui/toast'

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
  roundNumber?: number
}

interface BracketRound {
  roundName: string
  matches: Match[]
}

interface BracketFlowProps {
  eventId: string
  isOwner: boolean
  currentUserId?: string
}

// Composant pour les séparateurs de phase
const PhaseNode = ({ data }: NodeProps<{ phaseName: string }>) => {
  return (
    <div className="bg-white px-8 py-4 rounded-lg shadow-lg border-2 border-gray-300">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-600">{data.phaseName}</h3>
        <div className="w-16 h-1 bg-gray-600 rounded-full mx-auto mt-2"></div>
      </div>
    </div>
  )
}

// Composant pour les matchs - Version simplifiée
const MatchNode = ({ data }: NodeProps<{ 
  match: Match
  onMatchClick: (match: Match) => void
}>) => {
  const { match, onMatchClick } = data
  const participant1 = match.participants?.[0]
  const participant2 = match.participants?.[1]
  const participant1Name = participant1?.name || participant1?.user?.name || 'TBD'
  const participant2Name = participant2?.name || participant2?.user?.name || 'TBD'

  // Vérifier s'il s'agit d'un bye (un seul participant)
  const isBye = match.participants.length === 1 && participant1
  const hasValidParticipants = match.participants.length >= 2 && participant1 && participant2

  const getScore = (participantId: string) => {
    const score = match.scores?.find(s => s.participantId === participantId)
    return score !== undefined ? score.score : null
  }

  const hasScore = (participantId: string) => {
    return match.scores?.some(s => s.participantId === participantId) || false
  }

  const getStatusColor = () => {
    if (isBye) return 'border-purple-500'
    switch (match.status) {
      case 'completed': return 'border-green-500'
      case 'ready': return 'border-blue-500'
      case 'waiting': return 'border-gray-300'
      default: return 'border-gray-300'
    }
  }

  // Affichage spécial pour les byes
  if (isBye) {
    const isCompleted = match.status === 'completed' && match.winner
    return (
      <div 
        className={`w-72 bg-white rounded-lg border-2 ${getStatusColor()} shadow-md`}
      >
        <Handle type="target" position={Position.Left} className="!bg-gray-400" />
        
        {/* Match Header */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="text-xs font-medium text-gray-600 text-center">{match.name}</div>
        </div>

        {/* Bye Information */}
        <div className="p-4 text-center">
          <div className={`${isCompleted ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'} border-2 rounded-lg p-3`}>
            <div className="flex items-center justify-center mb-2">
              <Trophy className={`w-4 h-4 mr-2 ${isCompleted ? 'text-green-600' : 'text-purple-600'}`} />
              <span className={`font-bold ${isCompleted ? 'text-green-800' : 'text-purple-800'}`}>{participant1Name}</span>
            </div>
            <div className={`text-xs font-medium ${isCompleted ? 'text-green-600' : 'text-purple-600'}`}>
              {isCompleted ? 'QUALIFIÉ' : 'QUALIFIÉ AUTOMATIQUEMENT'}
            </div>
            <div className="text-xs text-gray-500 mt-1">(Bye)</div>
          </div>
        </div>

        <Handle type="source" position={Position.Right} className="!bg-gray-400" />
      </div>
    )
  }

  return (
    <div 
      className={`w-72 bg-white rounded-lg border-2 ${getStatusColor()} shadow-md hover:shadow-lg cursor-pointer`}
      onClick={() => onMatchClick(match)}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      
      {/* Match Header */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="text-xs font-medium text-gray-600 text-center">{match.name}</div>
      </div>

      {/* Participants */}
      <div className="p-2 space-y-1">
        {/* Participant 1 */}
        <div 
          key={`${match.id}-p1-${participant1?.id || participant1?.user?.id || 'tbd1'}`}
          className={`flex justify-between items-center p-2 rounded ${
            match.winner === (participant1?.id || participant1?.user?.id) 
              ? 'bg-green-50 text-green-800' 
              : 'bg-gray-50 text-gray-600'
          }`}
        >
          <span className="font-medium text-sm truncate flex-1">{participant1Name}</span>
          {hasScore(participant1?.id || participant1?.user?.id || '') && (
            <span className="font-bold text-lg ml-2">
              {getScore(participant1?.id || participant1?.user?.id || '')}
            </span>
          )}
        </div>

        {/* Participant 2 */}
        {hasValidParticipants && (
          <div 
            key={`${match.id}-p2-${participant2?.id || participant2?.user?.id || 'tbd2'}`}
            className={`flex justify-between items-center p-2 rounded ${
              match.winner === (participant2?.id || participant2?.user?.id) 
                ? 'bg-green-50 text-green-800' 
                : 'bg-gray-50 text-gray-600'
            }`}
          >
            <span className="font-medium text-sm truncate flex-1">{participant2Name}</span>
            {hasScore(participant2?.id || participant2?.user?.id || '') && (
              <span className="font-bold text-lg ml-2">
                {getScore(participant2?.id || participant2?.user?.id || '')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Winner Indicator */}
      {match.status === 'completed' && match.winner && (
        <div className="px-3 py-1 bg-green-100 border-t border-green-200">
          <div className="flex items-center justify-center">
            <Trophy className="w-3 h-3 text-green-600 mr-1" />
            <span className="text-xs font-medium text-green-600">
              {match.winner === (participant1?.id || participant1?.user?.id) ? participant1Name : participant2Name}
            </span>
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </div>
  )
}

const nodeTypes = {
  matchNode: MatchNode,
  phaseNode: PhaseNode,
}

export default function BracketFlow({ eventId, isOwner, currentUserId }: BracketFlowProps) {
  const [bracket, setBracket] = useState<BracketRound[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const toast = useToast()
  const [showScoreInput, setShowScoreInput] = useState(false)
  const [participant1Score, setParticipant1Score] = useState('')
  const [participant2Score, setParticipant2Score] = useState('')
  const [submittingScore, setSubmittingScore] = useState(false)
  const [tempScores, setTempScores] = useState<{[participantId: string]: number}>({})
  const [initialFitView, setInitialFitView] = useState(true)
  const [processedByes, setProcessedByes] = useState<Set<string>>(new Set())
  const [hasInitializedView, setHasInitializedView] = useState(false)
  
  // État local pour stocker les résultats persistants avec localStorage
  const [storedResults, setStoredResults] = useState<{[matchId: string]: {scores: {participantId: string; score: number}[], winner: string, status: string}}>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`tournament-results-${eventId}`)
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const reactFlowRef = useRef<ReactFlowInstance | null>(null)

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes])
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges])

  // Fonction pour merger les résultats stockés avec les données du bracket
  const mergeStoredResults = useCallback((bracketData: BracketRound[]) => {
    console.log('🔄 Merging stored results:', storedResults)
    console.log('📊 Bracket data before merge:', bracketData)
    
    const mergedData = bracketData.map(round => ({
      ...round,
      matches: round.matches.map(match => {
        const storedResult = storedResults[match.id]
        if (storedResult) {
          console.log(`✅ Applying stored result for match ${match.name}:`, storedResult)
          return {
            ...match,
            scores: storedResult.scores,
            winner: storedResult.winner,
            status: storedResult.status as 'ready' | 'waiting' | 'completed'
          }
        }
        return match
      })
    }))
    
    console.log('📊 Bracket data after merge:', mergedData)
    return mergedData
  }, [storedResults])

  // Fonction pour stocker un résultat
  const storeMatchResult = useCallback((matchId: string, scores: {participantId: string; score: number}[], winner: string, status: string) => {
    console.log(`💾 Storing result for match ${matchId}:`, { scores, winner, status })
    setStoredResults(prev => {
      const newResults = {
        ...prev,
        [matchId]: { scores, winner, status }
      }
      // Sauvegarder immédiatement dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`tournament-results-${eventId}`, JSON.stringify(newResults))
        console.log('💾 Saved to localStorage:', newResults)
      }
      console.log('💾 Updated stored results:', newResults)
      return newResults
    })
  }, [eventId])

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`tournament-results-${eventId}`, JSON.stringify(storedResults))
    }
  }, [storedResults, eventId])

  const onInit = (reactFlowInstance: ReactFlowInstance) => {
    reactFlowRef.current = reactFlowInstance
    // Appliquer fitView seulement lors de la première initialisation
    if (!hasInitializedView) {
      setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.05,
          includeHiddenNodes: false,
          minZoom: 0.2,
          maxZoom: 1.5,
          duration: 0
        })
        setHasInitializedView(true)
      }, 300)
    }
  }

  const fetchBracket = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/bracket`)
      if (response.ok) {
        const data = await response.json()
        const bracketData = data.bracket || []
        
        // Récupérer les dernières données du localStorage avant le merge
        let latestStoredResults = storedResults
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem(`tournament-results-${eventId}`)
          if (saved) {
            latestStoredResults = JSON.parse(saved)
            console.log('🔄 Loaded latest results from localStorage:', latestStoredResults)
          }
        }
        
        // Appliquer les résultats stockés localement
        const mergedBracket = bracketData.map(round => ({
          ...round,
          matches: round.matches.map(match => {
            const storedResult = latestStoredResults[match.id]
            if (storedResult) {
              console.log(`✅ Applying stored result for match ${match.name}:`, storedResult)
              return {
                ...match,
                scores: storedResult.scores,
                winner: storedResult.winner,
                status: storedResult.status as 'ready' | 'waiting' | 'completed'
              }
            }
            return match
          })
        }))
        
        setBracket(mergedBracket)
      }
    } catch (error) {
      console.error('Error fetching bracket:', error)
    } finally {
      setLoading(false)
    }
  }, [eventId, storedResults])

  const updateMatchLocally = useCallback((matchId: string, updates: Partial<Match>) => {
    setBracket(prevBracket => 
      prevBracket.map(round => ({
        ...round,
        matches: round.matches.map(match => 
          match.id === matchId ? { ...match, ...updates } : match
        )
      }))
    )
  }, [])


  const declareWinner = useCallback(async (matchId: string, winnerId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/matches/${matchId}/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ winnerId }),
      })

      if (response.ok) {
        // Stocker le résultat du vainqueur avec les scores existants s'il y en a
        const currentMatch = bracket.flat().flatMap(r => r.matches).find(m => m.id === matchId)
        const existingScores = currentMatch?.scores || []
        storeMatchResult(matchId, existingScores, winnerId, 'completed')
      }
    } catch (error) {
      console.error('Error declaring winner:', error)
    }
  }, [eventId, bracket, storeMatchResult])

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match)
    // Initialiser les scores temporaires avec les scores existants ou 0
    const newTempScores: {[participantId: string]: number} = {}
    match.participants.forEach(participant => {
      const participantId = participant?.id || participant?.user?.id || ''
      const existingScore = match.scores?.find(s => s.participantId === participantId)?.score
      newTempScores[participantId] = existingScore || 0
    })
    setTempScores(newTempScores)
  }

  const closeMatchDetails = () => {
    setSelectedMatch(null)
    setTempScores({})
  }


  const updateTempScore = (participantId: string, score: number) => {
    // Limiter le score à 13 maximum
    const clampedScore = Math.min(Math.max(0, score), 13)
    setTempScores(prev => ({
      ...prev,
      [participantId]: clampedScore
    }))
  }

  const submitScoresAndDetermineWinner = async (matchId: string) => {
    if (!selectedMatch) return
    
    const participants = selectedMatch.participants
    
    // Gérer les matchs avec un seul participant (bye)
    if (participants.length === 1) {
      const participantId = participants[0]?.id || participants[0]?.user?.id || ''
      
      setSubmittingScore(true)
      try {
        const scores = [
          { participantId: participantId, score: 0 } // Score par défaut pour les byes
        ]

        const response = await fetch(`/api/events/${eventId}/matches/${matchId}/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scores }),
        })

        if (response.ok) {
          // Stocker le résultat localement
          storeMatchResult(matchId, [{ participantId: participantId, score: 0 }], participantId, 'completed')
          
          setSelectedMatch(null)
          setTempScores({})
          
          // Refresh pour propager aux matchs suivants
          setTimeout(() => {
            fetchBracket()
          }, 500)
        } else {
          const error = await response.json()
          toast.error('Erreur qualification', error.message)
        }
      } catch (error) {
        console.error('Error submitting bye:', error)
        toast.error('Erreur qualification', 'Impossible de qualifier automatiquement')
      } finally {
        setSubmittingScore(false)
      }
      return
    }

    if (participants.length !== 2) return

    const p1Id = participants[0]?.id || participants[0]?.user?.id || ''
    const p2Id = participants[1]?.id || participants[1]?.user?.id || ''
    
    const p1Score = tempScores[p1Id] || 0
    const p2Score = tempScores[p2Id] || 0

    // Déterminer le vainqueur en fonction du score le plus élevé
    const winnerId = p1Score > p2Score ? p1Id : p2Score > p1Score ? p2Id : ''
    
    if (!winnerId) {
      toast.warning('Scores égaux', 'Les scores ne peuvent pas être égaux. Veuillez ajuster les scores.')
      return
    }

    setSubmittingScore(true)
    try {
      const scores = [
        { participantId: p1Id, score: p1Score },
        { participantId: p2Id, score: p2Score }
      ]

      const response = await fetch(`/api/events/${eventId}/matches/${matchId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores }),
      })

      if (response.ok) {
        // Stocker le résultat localement
        const scores = [
          { participantId: p1Id, score: p1Score },
          { participantId: p2Id, score: p2Score }
        ]
        
        // Stocker d'abord, puis mettre à jour localement
        storeMatchResult(matchId, scores, winnerId, 'completed')
        
        // Mettre à jour l'affichage local immédiatement
        updateMatchLocally(matchId, { 
          scores: scores,
          winner: winnerId,
          status: 'completed' as const
        })
        
        // Garder le match sélectionné pour voir les résultats
        setTempScores({})
        
        // Notification de succès
        toastHelpers.scoreSubmitted(toast)
        
        // Force un refresh immédiat après stockage pour propager aux matchs suivants
        setTimeout(() => {
          console.log('🔄 Forcing refresh after score storage')
          fetchBracket()
        }, 100)
      } else {
        const error = await response.json()
        toastHelpers.scoreError(toast, error.message)
      }
    } catch (error) {
      console.error('Error submitting score:', error)
      toastHelpers.networkError(toast)
    } finally {
      setSubmittingScore(false)
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

  const generateNodesAndEdges = useCallback(() => {
    const newNodes: Node[] = []
    const newEdges: Edge[] = []
    
    // Configuration d'espacement compacte
    const roundWidth = 450  // Espace horizontal entre les phases
    const phaseHeaderWidth = 250
    const matchNodeWidth = 290  // Largeur ajustée pour les nouvelles cartes (w-72)
    
    // Calculer le centre pour un meilleur positionnement
    const totalRounds = bracket.length
    const totalWidth = (totalRounds - 1) * roundWidth + matchNodeWidth
    const startX = -totalWidth / 2  // Commencer au centre
    
    bracket.forEach((round, roundIndex) => {
      const x = startX + roundIndex * roundWidth  // Position centrée
      
      // Calculer le nombre total de matchs et la position optimale pour l'en-tête de phase
      const matchCount = round.matches.length
      
      // Calculer la position Y optimale pour l'en-tête de phase
      let phaseHeaderY = -400  // Position par défaut au-dessus
      
      if (matchCount === 1) {
        phaseHeaderY = -250  // Plus près pour la finale
      } else if (matchCount === 2) {
        phaseHeaderY = -450  // Plus haut pour 2 matchs espacés de 600px
      } else if (matchCount <= 4) {
        phaseHeaderY = -550  // Plus haut pour laisser de la place
      } else if (matchCount <= 8) {
        phaseHeaderY = -650  // Encore plus haut pour les phases moyennes
      } else {
        phaseHeaderY = -750  // Très haut pour beaucoup de matchs
      }
      
      // Ajouter le nœud de phase (séparateur) centré au-dessus des matchs
      const phaseX = x + (matchNodeWidth - phaseHeaderWidth) / 2  // Centrer l'en-tête de phase
      newNodes.push({
        id: `phase-${roundIndex}`,
        type: 'phaseNode',
        position: { 
          x: phaseX, 
          y: phaseHeaderY
        },
        data: { phaseName: round.roundName },
        draggable: false,
      })

      // Ajouter les matchs de cette phase avec espacement optimisé et centrage vertical
      round.matches.forEach((match, matchIndex) => {

        let y = 0
        
        if (matchCount === 1) {
          // Finale au centre absolu
          y = 0
        } else if (matchCount === 2) {
          // Deux matchs : répartis symétriquement autour du centre
          y = matchIndex === 0 ? -180 : 180
        } else if (matchCount <= 4) {
          // Peu de matchs : espacement réduit centré
          const spacing = Math.max(250, 600 / Math.max(1, matchCount - 1))
          const totalHeight = (matchCount - 1) * spacing
          y = -(totalHeight / 2) + (matchIndex * spacing)
        } else if (matchCount <= 8) {
          // Espacement moyen pour 5-8 matchs
          const spacing = Math.max(200, 1200 / Math.max(1, matchCount - 1))
          const totalHeight = (matchCount - 1) * spacing
          y = -(totalHeight / 2) + (matchIndex * spacing)
        } else {
          // Beaucoup de matchs : espacement serré mais centré
          const spacing = Math.max(180, 1400 / Math.max(1, matchCount - 1))
          const totalHeight = (matchCount - 1) * spacing
          y = -(totalHeight / 2) + (matchIndex * spacing)
        }
        
        newNodes.push({
          id: match.id,
          type: 'matchNode',
          position: { x, y },
          data: { 
            match,
            onMatchClick: handleMatchClick
          },
        })

        // Ajouter les connexions vers les matchs source
        if (match.sourceMatchIds) {
          match.sourceMatchIds.forEach(sourceId => {
            newEdges.push({
              id: `e-${sourceId}-${match.id}`,
              source: sourceId,
              target: match.id,
              animated: false,
              style: { 
                stroke: '#6b7280',
                strokeWidth: 3,
              },
              type: 'smoothstep',
              sourceHandle: 'source',
              targetHandle: 'target',
            })
          })
        }
      })
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }, [bracket, isOwner])


  useEffect(() => {
    fetchBracket()
  }, [fetchBracket])

  // useEffect séparé pour traiter seulement les vrais byes automatiquement
  useEffect(() => {
    if (bracket.length > 0 && isOwner) {
      bracket.forEach((round, roundIndex) => {
        round.matches.forEach((match) => {
          // Vérifier s'il s'agit d'un vrai bye initial (nombre impair d'équipes)
          const isTrueBye = match.participants.length === 1 && 
                            match.participants[0] && 
                            !match.winner && 
                            match.status !== 'completed' &&
                            !processedByes.has(match.id) &&
                            roundIndex === 0 // Seulement dans le premier round

          if (isTrueBye) {
            const participantId = match.participants[0].id || match.participants[0].user?.id
            if (participantId) {
              // Marquer comme traité pour éviter les doublons
              setProcessedByes(prev => new Set([...prev, match.id]))
              
              // Déclarer automatiquement le vainqueur pour les vrais byes
              setTimeout(() => {
                console.log(`Auto-qualifying true bye for match ${match.id}:`, match.participants[0].name || match.participants[0].user?.name)
                declareWinner(match.id, participantId)
              }, 1000 + roundIndex * 500) // Délai progressif pour éviter les conflicts
            }
          }
          
          // NE PAS traiter les matchs "waiting" comme des byes automatiques
          // Ils attendent simplement leur adversaire du prochain round
        })
      })
    }
  }, [bracket, isOwner, processedByes, declareWinner])

  useEffect(() => {
    if (bracket.length > 0) {
      generateNodesAndEdges()
      // Centrage seulement au premier chargement
      if (!hasInitializedView && reactFlowRef.current) {
        setTimeout(() => {
          reactFlowRef.current?.fitView({
            padding: 0.05,
            includeHiddenNodes: false,
            minZoom: 0.2,
            maxZoom: 1.5,
            duration: 0
          })
          setInitialFitView(false)
          setHasInitializedView(true)
        }, 500)
      }
    }
  }, [bracket, isOwner, currentUserId, generateNodesAndEdges, hasInitializedView])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement du bracket du tournoi...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      {/* Panneau principal avec ReactFlow */}
      <div className={`h-full ${selectedMatch ? 'w-3/4' : 'w-full'}`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onInit={onInit}
          fitView={true}
          fitViewOptions={{ 
            padding: 0.05,
            includeHiddenNodes: false,
            minZoom: 0.2,
            maxZoom: 1.5,
            duration: 0
          }}
          minZoom={0.2}
          maxZoom={2}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* Panneau de détails sur le côté */}
      {selectedMatch && (
        <div className="w-1/4 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-600">{selectedMatch.name}</h2>
              <button 
                onClick={closeMatchDetails}
                className="text-gray-600 hover:text-gray-800 text-xl"
              >
                ×
              </button>
            </div>

            {/* Status Badge */}
            <div className="text-center">
              {selectedMatch.status === 'completed' && (
                <Badge className="bg-green-600"><Trophy className="w-3 h-3 mr-1" />Match Terminé</Badge>
              )}
              {selectedMatch.status === 'ready' && (
                <Badge variant="secondary" className="bg-blue-600 text-white"><Clock className="w-3 h-3 mr-1" />Prêt à jouer</Badge>
              )}
              {selectedMatch.status === 'waiting' && (
                <Badge variant="outline"><Users className="w-3 h-3 mr-1" />En attente</Badge>
              )}
            </div>

            {/* Participants avec scores */}
            <div className="space-y-3">
              {selectedMatch.participants.filter(p => p && (p.name || p.user?.name || p.id || p.user?.id)).map((participant, index) => {
                const participantName = participant?.name || participant?.user?.name || participant?.email || `Participant ${index + 1}`
                const participantId = participant?.id || participant?.user?.id || ''
                const scoreData = selectedMatch.scores?.find(s => s.participantId === participantId)
                const currentScore = tempScores[participantId] !== undefined ? tempScores[participantId] : (scoreData?.score ?? 0)
                const hasValidScore = scoreData !== undefined
                const isWinner = selectedMatch.winner === participantId
                const canEdit = selectedMatch.status === 'ready' && (isOwner || canSubmitScore(selectedMatch))

                return (
                  <div 
                    key={`${selectedMatch.id}-participant-${index}-${participantId || 'tbd'}`}
                    className={`p-4 rounded-lg border-2 ${
                      isWinner 
                        ? 'bg-gradient-to-r from-green-100 to-green-200 border-green-400' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        {isWinner && <Trophy className="w-4 h-4 text-green-600" />}
                        <span className={`font-medium ${isWinner ? 'text-green-800' : 'text-gray-600'}`}>
                          {participantName}
                        </span>
                      </div>
                      
                      {canEdit ? (
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700">Score:</span>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              max="13"
                              value={currentScore}
                              placeholder="0"
                              onChange={(e) => updateTempScore(participantId, parseInt(e.target.value) || 0)}
                              className="w-20 h-10 text-center text-lg font-semibold border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-white placeholder-gray-400 text-gray-600"
                            />
                          </div>
                        </div>
                      ) : hasValidScore ? (
                        <span className={`font-bold text-xl ${isWinner ? 'text-green-700' : 'text-gray-600'}`}>
                          {currentScore}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bouton pour soumettre les scores et déterminer le vainqueur */}
            {selectedMatch.status === 'ready' && (isOwner || canSubmitScore(selectedMatch)) && (
              <div className="pt-4 border-t border-gray-200">
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                  onClick={() => submitScoresAndDetermineWinner(selectedMatch.id)}
                  disabled={submittingScore}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {submittingScore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Soumission en cours...</span>
                      </>
                    ) : selectedMatch.participants.length === 1 ? (
                      <>
                        <Trophy className="w-5 h-5" />
                        <span>Qualifier automatiquement</span>
                      </>
                    ) : (
                      <>
                        <Trophy className="w-5 h-5" />
                        <span>Valider les scores</span>
                      </>
                    )}
                  </div>
                </Button>
              </div>
            )}

            
          </div>
        </div>
      )}
    </div>
  )
}