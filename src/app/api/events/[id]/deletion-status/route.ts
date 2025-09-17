import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withEventOwnership } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check authentication and ownership
    const ownershipCheck = await withEventOwnership(id);
    if (ownershipCheck instanceof NextResponse) {
      return ownershipCheck;
    }
    
    const { user, event } = ownershipCheck;
    
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    const now = new Date();
    const applyEndDate = new Date(event.applyEnd);
    const registrationClosed = now > applyEndDate;
    const hasBracket = !!event.bracketState;
    const participantCount = event.participants?.length || 0;
    
    const canDelete = !hasBracket;
    const reason = hasBracket 
      ? "Tournament bracket has been created" 
      : null;
    
    return NextResponse.json({
      canDelete,
      reason,
      eventDetails: {
        id: event.id,
        name: event.name,
        registrationClosed,
        hasBracket,
        participantCount,
        applyEnd: event.applyEnd
      }
    });
    
  } catch (error) {
    console.error('Deletion status check error:', error);
    return NextResponse.json(
      { error: "Failed to check deletion status" },
      { status: 500 }
    );
  }
}