import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withEventOwnership } from "@/lib/auth";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log('DELETE event API called');
    const { id } = await params;
    console.log('Event ID to delete:', id);
    
    // Check authentication and ownership
    console.log('Checking ownership...');
    const ownershipCheck = await withEventOwnership(id);
    if (ownershipCheck instanceof NextResponse) {
      console.log('Ownership check failed');
      return ownershipCheck;
    }
    
    console.log('Ownership check passed');
    
    // Check if event has active bracket or participants
    console.log('Fetching event details...');
    const event = await prisma.event.findUnique({
      where: { id },
      include: { participants: true }
    });
    
    if (!event) {
      console.log('Event not found');
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    console.log('Event found:', {
      id: event.id,
      name: event.name,
      applyEnd: event.applyEnd,
      hasBracket: !!event.bracketState,
      participantCount: event.participants.length
    });
    
    // Only prevent deletion if bracket exists (tournament has started)
    const hasBracket = !!event.bracketState;
    
    console.log('Deletion checks:', {
      hasBracket,
      participantCount: event.participants.length
    });
    
    if (hasBracket) {
      console.log('Deletion blocked: Tournament bracket has been created');
      return NextResponse.json({ 
        error: "Cannot delete event: Tournament bracket has been created" 
      }, { status: 400 });
    }
    
    console.log('Proceeding with deletion...');
    // Delete participants first, then event
    const deletedParticipants = await prisma.participant.deleteMany({ where: { eventId: id } });
    console.log('Deleted participants:', deletedParticipants.count);
    
    await prisma.event.delete({ where: { id } });
    console.log('Event deleted successfully');
    
    return NextResponse.json({ success: true, message: "Event deleted successfully" });
    
  } catch (error) {
    console.error('DELETE event error:', error);
    const message = error instanceof Error ? error.message : "Failed to delete event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { participants: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}
