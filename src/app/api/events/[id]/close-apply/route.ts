import { NextRequest, NextResponse } from 'next/server';
import { withEventOwnership, prisma } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;
    if (!eventId) return NextResponse.json({ error: 'Missing event id' }, { status: 400 });
  // Owner-only action
  const ownerCheck = await withEventOwnership(eventId);
  if (ownerCheck instanceof NextResponse) return ownerCheck;
    const now = new Date();
    const event = await prisma.event.update({
      where: { id: eventId },
      data: { applyEnd: now },
    });
    return NextResponse.json(event);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
