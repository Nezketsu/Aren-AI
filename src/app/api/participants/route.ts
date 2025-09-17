
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, prisma } from '@/lib/auth';

// GET /api/participants?userId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const participants = await prisma.participant.findMany({
    where: { userId },
    include: { event: true },
  });
  // Return just the event objects
  return NextResponse.json(participants.map((p: any) => p.event));
}

export async function POST(req: NextRequest) {
  try {
    // Use the new auth utility
    const authCheck = await withAuth();
    if (authCheck instanceof NextResponse) {
      return authCheck; // Return the authentication error response
    }

    const { user } = authCheck;
  const { eventId } = await req.json();
    
    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }
    
    // Check if already applied
    const existing = await prisma.participant.findFirst({
      where: { userId: user.id, eventId },
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Already applied' }, { status: 409 });
    }
    // Validate event state
    const event = await prisma.event.findUnique({ where: { id: eventId }, include: { participants: true } });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    const now = new Date();
    if (now < new Date(event.applyStart) || now > new Date(event.applyEnd) || event.registrationClosed) {
      return NextResponse.json({ error: 'Registration is closed' }, { status: 400 });
    }
    if (typeof event.maxParticipants === 'number' && event.participants.length >= event.maxParticipants) {
      return NextResponse.json({ error: 'Event is full' }, { status: 400 });
    }

    const participant = await prisma.participant.create({
      data: {
        userId: user.id,
        eventId,
      },
    });
    
    return NextResponse.json(participant);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/participants?eventId=xxx
export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await withAuth();
    if (authCheck instanceof NextResponse) return authCheck;
    const { user } = authCheck;
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });

    const participant = await prisma.participant.findFirst({ where: { userId: user.id, eventId } });
    if (!participant) return NextResponse.json({ error: 'Not registered' }, { status: 404 });

    // Optional: prevent withdraw after registration closes
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (event) {
      const now = new Date();
      if (now > new Date(event.applyEnd) || event.registrationClosed) {
        return NextResponse.json({ error: 'Cannot withdraw after registration closes' }, { status: 400 });
      }
    }

    await prisma.participant.delete({ where: { id: participant.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
