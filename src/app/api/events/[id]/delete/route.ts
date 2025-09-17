import { NextResponse } from 'next/server';
import { withEventOwnership, prisma } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: eventId } = resolvedParams;

    // Check authentication and event ownership
    const authCheck = await withEventOwnership(eventId);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const { event } = authCheck;

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if tournament is finished (registration closed and has results)
    const now = new Date();
    const applyEnd = new Date(event.applyEnd);
    const isRegistrationClosed = now > applyEnd;

    if (!isRegistrationClosed) {
      return NextResponse.json(
        { error: "Cannot delete tournament while registration is still open" },
        { status: 400 }
      );
    }

    // Delete related data in correct order to respect foreign key constraints
    
    // Delete match disputes
    await prisma.matchDispute.deleteMany({
      where: { eventId }
    });

    // Delete match scores
    const participants = await prisma.participant.findMany({
      where: { eventId },
      select: { id: true }
    });

    const participantIds = participants.map(p => p.id);
    
    if (participantIds.length > 0) {
      await prisma.matchScore.deleteMany({
        where: { participantId: { in: participantIds } }
      });
    }

    // Delete participants
    await prisma.participant.deleteMany({
      where: { eventId }
    });

    // Finally delete the event
    await prisma.event.delete({
      where: { id: eventId }
    });

    return NextResponse.json({ 
      success: true,
      message: "Tournament deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting tournament:", error);
    return NextResponse.json(
      { error: "Failed to delete tournament" },
      { status: 500 }
    );
  }
}