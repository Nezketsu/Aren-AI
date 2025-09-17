import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/auth'

export async function POST(
  req: Request,
  { params }: { params: { id: string; matchId: string } | Promise<{ id: string; matchId: string }> }
) {
  const session = await getServerSession(authOptions)
  console.log('Session check:', { session: !!session, userId: session?.user?.id })
  
  if (!session?.user?.id) {
    console.log('No session or user ID found')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resolvedParams = await Promise.resolve(params)
  const { id: eventId, matchId } = resolvedParams
  const body = await req.json()
  const { scores } = body // Expecting an array of scores [{ participantId, score }]
  const userId = session.user.id

  console.log('Score submission request:', { eventId, matchId, userId, body, scores })

  if (!scores || !Array.isArray(scores) || scores.length !== 2) {
    console.log('Invalid score format:', { scores, isArray: Array.isArray(scores), length: scores?.length })
    return NextResponse.json({ error: 'Invalid score format' }, { status: 400 })
  }

  try {
    // Get the event to check ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if user is owner or participant
    const isOwner = event.ownerId === userId
    const currentUserParticipant = await prisma.participant.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: userId,
        },
      },
    })

    console.log('User permissions:', { isOwner, isParticipant: !!currentUserParticipant, userId, ownerId: event.ownerId })

    if (!isOwner && !currentUserParticipant) {
      console.log('User not authorized:', { userId, eventId })
      return NextResponse.json({ error: 'You must be the event owner or a participant to submit scores.' }, { status: 403 })
    }

    // Find participant IDs from user IDs in the scores
    const userIds = scores.map(s => s.participantId)
    console.log('Looking for participants with user IDs:', userIds)
    
    const participants = await prisma.participant.findMany({
      where: {
        eventId: eventId,
        userId: { in: userIds }
      }
    })

    console.log('Found participants:', participants)

    // Map user IDs to participant IDs
    const userIdToParticipantId = new Map()
    participants.forEach(p => {
      userIdToParticipantId.set(p.userId, p.id)
    })

    console.log('User ID to Participant ID mapping:', Array.from(userIdToParticipantId.entries()))

    // Convert user IDs to participant IDs in scores
    const convertedScores = scores.map(s => ({
      participantId: userIdToParticipantId.get(s.participantId) || s.participantId,
      score: s.score
    }))

    console.log('Converted scores:', convertedScores)

    // Handle bye matches (single participant)
    if (convertedScores.length === 1) {
        const singleParticipant = convertedScores[0]
        const winnerId = userIds[0] // The only participant wins automatically
        
        console.log('Bye match - auto-declaring winner:', { winnerId, participant: singleParticipant })
        
        // Call the result API to declare the winner
        const resultResponse = await fetch(`${req.url.split('/score')[0]}/result`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(
              Array.from(req.headers.entries()).filter(([key]) => 
                key.toLowerCase().includes('auth') || key.toLowerCase().includes('cookie')
              )
            )
          },
          body: JSON.stringify({ winnerId })
        })

        if (!resultResponse.ok) {
          const errorData = await resultResponse.json()
          console.log('Result API error for bye match:', errorData)
          return NextResponse.json({ error: 'Failed to declare bye winner' }, { status: 500 })
        }

        const resultData = await resultResponse.json()
        
        return NextResponse.json({
          message: 'Bye match - winner declared automatically.',
          matchCompleted: true,
          winner: winnerId,
          bracket: resultData.bracket
        })
    }

    if (convertedScores.length !== 2) {
        return NextResponse.json({ error: 'Exactly one or two participant scores are required.' }, { status: 400 })
    }

    const [score1, score2] = convertedScores
    console.log('Processing scores:', { score1, score2 })

    // Valider les scores
    if (score1.score === score2.score) {
      return NextResponse.json({ error: 'Les scores ne peuvent pas être égaux. Un match doit avoir un gagnant.' }, { status: 400 })
    }

    if (score1.score < 0 || score2.score < 0) {
      return NextResponse.json({ error: 'Les scores ne peuvent pas être négatifs.' }, { status: 400 })
    }

    if (score1.score > 13 || score2.score > 13) {
      return NextResponse.json({ error: 'Les scores ne peuvent pas dépasser 13.' }, { status: 400 })
    }

    // Déterminer le gagnant basé sur les scores
    const winnerId = score1.score > score2.score ? 
      userIds[convertedScores.indexOf(score1)] : 
      userIds[convertedScores.indexOf(score2)]

    console.log('Determined winner:', { winnerId, score1: score1.score, score2: score2.score })

    // Instead of creating MatchScore records, we'll directly update the bracket with the winner
    // Call the result API to declare the winner
    const resultResponse = await fetch(`${req.url.split('/score')[0]}/result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward the authorization headers
        ...Object.fromEntries(
          Array.from(req.headers.entries()).filter(([key]) => 
            key.toLowerCase().includes('auth') || key.toLowerCase().includes('cookie')
          )
        )
      },
      body: JSON.stringify({ winnerId })
    })

    if (!resultResponse.ok) {
      const errorData = await resultResponse.json()
      console.log('Result API error:', errorData)
      return NextResponse.json({ error: 'Failed to declare winner' }, { status: 500 })
    }

    const resultData = await resultResponse.json()
    
    return NextResponse.json({
      message: 'Scores submitted and winner declared successfully.',
      matchCompleted: true,
      winner: winnerId,
      bracket: resultData.bracket
    })
  } catch (error) {
    console.error(`Error submitting score for match ${matchId}:`, error)
    return NextResponse.json(
      { error: 'An error occurred while submitting the score.' },
      { status: 500 }
    )
  }
}
