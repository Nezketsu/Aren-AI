
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }
    // Check if already applied
    const existing = await prisma.participant.findFirst({
      where: { userId: session.user.id, eventId },
    });
    if (existing) {
      return NextResponse.json({ error: 'Already applied' }, { status: 409 });
    }
    const participant = await prisma.participant.create({
      data: {
        userId: session.user.id,
        eventId,
      },
    });
    return NextResponse.json(participant);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
