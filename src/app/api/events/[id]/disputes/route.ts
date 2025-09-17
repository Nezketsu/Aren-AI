import { NextRequest, NextResponse } from 'next/server';
import { withEventOwnership, prisma } from '@/lib/auth';

// Get all disputes for an event (owner only)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const eventId = resolvedParams.id;
    const ownershipCheck = await withEventOwnership(eventId);
    
    if (ownershipCheck instanceof NextResponse) {
      return ownershipCheck;
    }

    const disputes = await prisma.matchDispute.findMany({
      where: { 
        eventId,
        status: 'pending'
      },
      include: {
        event: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ disputes });

  } catch (error) {
    console.error('Get disputes error:', error);
    return NextResponse.json(
      { error: 'Failed to get disputes' },
      { status: 500 }
    );
  }
}

// Resolve a dispute (owner only)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const eventId = resolvedParams.id;
    const ownershipCheck = await withEventOwnership(eventId);
    
    if (ownershipCheck instanceof NextResponse) {
      return ownershipCheck;
    }

    const { user } = ownershipCheck;
    const { disputeId, finalScore, winnerId } = await req.json();

    // Validate input
    if (!disputeId || !finalScore || !winnerId) {
      return NextResponse.json(
        { error: 'Missing required fields: disputeId, finalScore, winnerId' },
        { status: 400 }
      );
    }

    // Get the dispute
    const dispute = await prisma.matchDispute.findUnique({
      where: { id: disputeId }
    });

    if (!dispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    if (dispute.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Dispute does not belong to this event' },
        { status: 400 }
      );
    }

    if (dispute.status !== 'pending') {
      return NextResponse.json(
        { error: 'Dispute has already been resolved' },
        { status: 400 }
      );
    }

    // Get dispute with participants for notifications
    const disputeWithParticipants = await prisma.matchDispute.findUnique({
      where: { id: disputeId },
      include: {
        participant1: { include: { user: true } },
        participant2: { include: { user: true } }
      }
    });

    // Update the dispute
    await prisma.matchDispute.update({
      where: { id: disputeId },
      data: {
        status: 'resolved',
        resolvedBy: user.id,
        finalScore,
        resolvedAt: new Date()
      }
    });

    // Update the bracket with the resolved match
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { bracketState: true }
    });

    if (event?.bracketState) {
      const bracket = event.bracketState as any[];
      const updatedBracket = bracket.map(round => ({
        ...round,
        matches: round.matches.map((match: any) => {
          if (match.id === dispute.matchId) {
            return {
              ...match,
              winner: winnerId,
              status: 'completed',
              finalScore: finalScore,
              resolvedByOwner: true
            };
          }
          return match;
        })
      }));

      await prisma.event.update({
        where: { id: eventId },
        data: { bracketState: updatedBracket }
      });
    }

    // Send notifications to both participants
    if (disputeWithParticipants) {
      const winnerName = winnerId === disputeWithParticipants.participant1.userId 
        ? disputeWithParticipants.participant1.user?.name || 'Participant 1'
        : disputeWithParticipants.participant2.user?.name || 'Participant 2';

      const notifications = [
        {
          userId: disputeWithParticipants.participant1.userId,
          type: 'DISPUTE_RESOLVED',
          title: 'Litige résolu',
          message: `Le litige pour votre match a été résolu par l'organisateur. Gagnant: ${winnerName} (${finalScore})`,
          data: {
            eventId,
            matchId: dispute.matchId,
            disputeId,
            winnerId,
            finalScore
          }
        },
        {
          userId: disputeWithParticipants.participant2.userId,
          type: 'DISPUTE_RESOLVED',
          title: 'Litige résolu', 
          message: `Le litige pour votre match a été résolu par l'organisateur. Gagnant: ${winnerName} (${finalScore})`,
          data: {
            eventId,
            matchId: dispute.matchId,
            disputeId,
            winnerId,
            finalScore
          }
        }
      ];

      await prisma.notification.createMany({
        data: notifications
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Dispute resolved successfully and participants notified'
    });

  } catch (error) {
    console.error('Resolve dispute error:', error);
    return NextResponse.json(
      { error: 'Failed to resolve dispute' },
      { status: 500 }
    );
  }
}
