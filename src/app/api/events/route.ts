import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/auth';

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
    // Check authentication first
    const authCheck = await withAuth();
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }
    
    const { user } = authCheck;
    
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
      applyStart
    } = await req.json();
    
    // Comprehensive input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 });
    }
    if (name.trim().length > 100) {
      return NextResponse.json({ error: "Event name must be less than 100 characters" }, { status: 400 });
    }
    if (description && typeof description === 'string' && description.length > 1000) {
      return NextResponse.json({ error: "Description must be less than 1000 characters" }, { status: 400 });
    }
    
    // Date validation
    if (!applyStart || !applyEnd) {
      return NextResponse.json({ error: "Registration start and end dates are required" }, { status: 400 });
    }
    
  const regStart = new Date(applyStart);
  const regEnd = new Date(applyEnd);
  const now = new Date();
    
  if (isNaN(regStart.getTime()) || isNaN(regEnd.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }
    
  if (regEnd <= regStart) {
      return NextResponse.json({ error: "Registration end must be after start date" }, { status: 400 });
    }
    
  if (regEnd <= now) {
      return NextResponse.json({ error: "Registration end must be in the future" }, { status: 400 });
    }
    // Fetch user token balance
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const tokenBalance = dbUser?.tokenBalance ?? 0;
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
        where: { id: user.id },
        data: { tokenBalance: { decrement: 1 } },
      });
    }
    // Create event
    const event = await prisma.event.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: user.id,
  applyStart: regStart,
  applyEnd: regEnd,
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
