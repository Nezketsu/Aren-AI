import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId');
    const where = ownerId ? { ownerId } : undefined;
    const events = await prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        participants: {
          select: { userId: true }
        }
      }
    });
    return NextResponse.json(events);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { 
      name, 
      description, 
      location, 
      startDate, 
      endDate,
      applyEnd, 
      maxParticipants,
      // tags, // Commented out as not used yet
      prize,
      sport,
      mode,
      rules,
      requirements,
      ownerId,
      applyStart
    } = await req.json();
    if (!ownerId) {
      return NextResponse.json({ error: "Missing ownerId (user not authenticated)" }, { status: 400 });
    }
    // Fetch user token balance
    const user = await prisma.user.findUnique({ where: { id: ownerId } });
    const tokenBalance = user?.tokenBalance ?? 0;
        const maxAllowed = 20;
    if (!maxParticipants || maxParticipants < 1 || maxParticipants > maxAllowed) {
      return NextResponse.json({ error: tokenBalance > 0
        ? "You can only create events with up to 100 participants per token."
        : "You need a token to create events with more than 10 participants." }, { status: 400 });
    }
    // Deduct token if creating event for more than 10 participants
    if (maxParticipants > 10) {
      if (tokenBalance < 1) {
        return NextResponse.json({ error: "Insufficient token balance." }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: ownerId },
        data: { tokenBalance: { decrement: 1 } },
      });
    }
    // Create event
    const event = await prisma.event.create({
      data: {
        name,
        description,
        ownerId,
        applyStart: new Date(applyStart),
        applyEnd: new Date(applyEnd),
        maxParticipants,
        // tags: tagsArray, // Uncomment if Event model supports tags as a field
        registrationClosed: false, // Add this field if your schema supports it
      },
    });

    // Check if maxParticipants is already reached (shouldn't happen at creation, but for safety)
    const participantCount = await prisma.participant.count({ where: { eventId: event.id } });
    if (participantCount >= maxParticipants) {
      await prisma.event.update({
        where: { id: event.id },
        data: { registrationClosed: true },
      });
      event.registrationClosed = true;
    }

    return NextResponse.json(event);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
