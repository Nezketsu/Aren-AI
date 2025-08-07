// app/api/events/[id]/matches/[matchId]/result/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
// Comment out auth for now - you can add it back later
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

type BracketNode = {
  id: string;
  name: string;
  profilePic?: string;
  user?: { id: string; name?: string; profilePic?: string };
  participants?: { id: string; name?: string; profilePic?: string }[];
  sourceMatchIds?: string[];
  match: number;
  seed: number | null;
  winner?: string;
  status?: string;
};

type BracketRound = {
  roundName: string;
  matches: BracketNode[];
};

export async function POST(
  request: Request,
  { params }: { params: { id: string; matchId: string } | Promise<{ id: string; matchId: string }> }
) {
  // Handle async params
  const resolvedParams = await Promise.resolve(params);
  const { id: eventId, matchId } = resolvedParams;
  
  try {
    
    console.log(`API Route called - Event ID: ${eventId}, Match ID: ${matchId}`);
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    
    const { winnerId } = body;
    
    if (!winnerId) {
      console.error("No winner ID provided");
      return NextResponse.json({ error: "Winner ID is required" }, { status: 400 });
    }
    
    console.log(`Updating match ${matchId} in event ${eventId} with winner ${winnerId}`);
    
    // Fetch the event
    let event;
    try {
      event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          participants: {
            include: {
              user: true
            }
          },
          owner: true
        }
      });
    } catch (dbError) {
      console.error("Database error fetching event:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    
    if (!event) {
      console.error("Event not found");
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    // TODO: Add your authentication/authorization logic here
    // For now, we'll skip auth to get it working
    
    // Parse bracket state
    console.log("Raw bracket state:", event.bracketState);
    console.log("Bracket state type:", typeof event.bracketState);
    
    let bracketState: BracketRound[] = [];
    try {
      if (event.bracketState) {
        if (Array.isArray(event.bracketState)) {
          bracketState = event.bracketState as BracketRound[];
        } else if (typeof event.bracketState === 'string') {
          bracketState = JSON.parse(event.bracketState);
        } else {
          bracketState = JSON.parse(JSON.stringify(event.bracketState));
        }
      } else {
        console.error("Bracket state is null or undefined - need to generate bracket first");
        return NextResponse.json({ 
          error: "No bracket found - please generate the tournament bracket first",
          debug: {
            eventId: eventId,
            hasEvent: !!event,
            bracketStateExists: !!event.bracketState,
            suggestion: "Call POST /api/events/" + eventId + "/bracket to generate the bracket"
          }
        }, { status: 400 });
      }
    } catch (e) {
      console.error("Error parsing bracket state:", e);
      console.error("Bracket state type:", typeof event.bracketState);
      console.error("Bracket state value:", event.bracketState);
      return NextResponse.json({ error: "Invalid bracket state" }, { status: 500 });
    }
    
    if (!Array.isArray(bracketState) || bracketState.length === 0) {
      console.error("No bracket found or invalid bracket structure");
      console.error("Parsed bracket state:", bracketState);
      return NextResponse.json({ 
        error: "No bracket found - invalid structure",
        debug: {
          isArray: Array.isArray(bracketState),
          length: bracketState?.length,
          bracketState: bracketState
        }
      }, { status: 400 });
    }
    
    console.log(`Bracket has ${bracketState.length} rounds`);
    
    // Find and update the match
    let matchFound = false;
    let matchUpdated = false;
    
    for (let roundIndex = 0; roundIndex < bracketState.length; roundIndex++) {
      const round = bracketState[roundIndex];
      if (!round.matches || !Array.isArray(round.matches)) {
        console.warn(`Round ${roundIndex} has no matches array`);
        continue;
      }
      
      const matchIndex = round.matches.findIndex(m => m.id === matchId);
      
      if (matchIndex !== -1) {
        matchFound = true;
        const match = round.matches[matchIndex];
        
        console.log(`Found match in round ${roundIndex}, match index ${matchIndex}`);
        console.log("Match participants:", match.participants);
        
        // Verify winner is a participant in this match
        const isValidWinner = match.participants?.some(p => p && p.id === winnerId);
        if (!isValidWinner) {
          console.error(`Invalid winner ${winnerId} - not in participants:`, match.participants);
          return NextResponse.json({ error: "Invalid winner - not a participant in this match" }, { status: 400 });
        }
        
        // Update the match
        match.winner = winnerId;
        match.status = 'completed';
        
        console.log(`Match updated with winner ${winnerId}`);
        
        // Find the winning participant details
        const winningParticipant = match.participants?.find(p => p.id === winnerId);
        
        // Handle single-elimination tournament progression
        if (roundIndex < bracketState.length - 1) {
          const nextRound = bracketState[roundIndex + 1];
          
          // Find next round matches that this match feeds into
          for (let nextMatch of nextRound.matches) {
            if (nextMatch.sourceMatchIds?.includes(matchId)) {
              console.log(`Advancing winner to match ${nextMatch.id}`);
              
              if (!nextMatch.participants) {
                nextMatch.participants = [
                  { id: 'TBD', name: 'TBD' },
                  { id: 'TBD', name: 'TBD' }
                ];
              }
              
              // Find which slot to put the winner in
              const sourceMatchIndex = nextMatch.sourceMatchIds.indexOf(matchId);
              if (sourceMatchIndex !== -1 && winningParticipant) {
                // Replace TBD with the winner
                nextMatch.participants[sourceMatchIndex] = {
                  id: winningParticipant.id,
                  name: winningParticipant.name,
                  profilePic: winningParticipant.profilePic
                };
                
                console.log(`Placed ${winningParticipant.name} in slot ${sourceMatchIndex} of match ${nextMatch.id}`);
                
                // Check if both participants are now set
                const participant1 = nextMatch.participants[0];
                const participant2 = nextMatch.participants[1];
                
                if (participant1?.id !== 'TBD' && participant2?.id !== 'TBD') {
                  // Both participants are set - match is ready to play
                  nextMatch.name = `${participant1.name} vs ${participant2.name}`;
                  nextMatch.status = 'ready';
                  console.log(`Match ${nextMatch.id} is now ready: ${nextMatch.name}`);
                } else {
                  // Still waiting for the other participant
                  const readyParticipant = participant1?.id !== 'TBD' ? participant1 : participant2;
                  nextMatch.name = `${readyParticipant?.name || 'TBD'} vs TBD`;
                  nextMatch.status = 'waiting';
                  console.log(`Match ${nextMatch.id} waiting for second participant`);
                  
                  // Check if this participant should auto-advance (if all source matches for the other slot are completed but no winner feeds into this slot)
                  if (readyParticipant && nextMatch.sourceMatchIds && nextMatch.sourceMatchIds.length === 2) {
                    const otherSourceMatchId = nextMatch.sourceMatchIds.find(id => id !== matchId);
                    if (otherSourceMatchId) {
                      // Find the other source match
                      const otherSourceMatch = bracketState.flatMap(r => r.matches).find(m => m.id === otherSourceMatchId);
                      
                      // If the other source match is completed but this slot is still TBD, 
                      // it means there's no opponent for the ready participant
                      if (otherSourceMatch?.status === 'completed' && otherSourceMatch.winner) {
                        // The other match has a winner, they should be placed in the other slot
                        const otherParticipant = otherSourceMatch.participants?.find(p => p.id === otherSourceMatch.winner);
                        if (otherParticipant) {
                          const otherSlotIndex = nextMatch.sourceMatchIds.indexOf(otherSourceMatchId);
                          nextMatch.participants[otherSlotIndex] = {
                            id: otherParticipant.id,
                            name: otherParticipant.name,
                            profilePic: otherParticipant.profilePic
                          };
                          
                          // Now both slots are filled
                          nextMatch.name = `${nextMatch.participants[0].name} vs ${nextMatch.participants[1].name}`;
                          nextMatch.status = 'ready';
                          console.log(`Match ${nextMatch.id} is now ready with both participants: ${nextMatch.name}`);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          
          // Check for immediate auto-advances and round completion
          const currentRound = bracketState[roundIndex];
          const allCurrentMatches = currentRound.matches || [];
          const completedMatches = allCurrentMatches.filter(m => m.status === 'completed');
          
          // Check for matches that should auto-advance immediately
          nextRound.matches.forEach(nextMatch => {
            if (nextMatch.status === 'waiting' && nextMatch.sourceMatchIds && nextMatch.sourceMatchIds.length === 1) {
              // This is a match with only one source - should be an auto-advance
              const sourceMatchId = nextMatch.sourceMatchIds[0];
              const sourceMatch = allCurrentMatches.find(m => m.id === sourceMatchId);
              
              if (sourceMatch?.status === 'completed' && sourceMatch.winner) {
                const winnerParticipant = sourceMatch.participants?.find(p => p.id === sourceMatch.winner);
                if (winnerParticipant) {
                  nextMatch.participants = [winnerParticipant];
                  nextMatch.status = 'completed';
                  nextMatch.winner = winnerParticipant.id;
                  nextMatch.name = `${winnerParticipant.name} (Auto-Advance)`;
                  console.log(`Auto-advancing ${winnerParticipant.name} in match ${nextMatch.id} - no opponent`);
                }
              }
            }
          });
          
          // Check if all matches in current round are completed to enable remaining auto-advances
          if (completedMatches.length === allCurrentMatches.length) {
            console.log(`All matches in round ${roundIndex + 1} completed, checking for remaining auto-advances in next round`);
            
            // Process any remaining auto-advance matches in the next round
            nextRound.matches.forEach(nextMatch => {
              if (nextMatch.participants?.length === 1 && nextMatch.status !== 'completed') {
                // This should be an auto-advance match
                const participant = nextMatch.participants[0];
                if (participant.id !== 'TBD') {
                  nextMatch.status = 'completed';
                  nextMatch.winner = participant.id;
                  nextMatch.name = `${participant.name} (Auto-Advance)`;
                  console.log(`Auto-advancing ${participant.name} in match ${nextMatch.id}`);
                }
              }
            });
          }
        }
        
        matchUpdated = true;
        break;
      }
    }
    
    if (!matchFound) {
      console.error(`Match ${matchId} not found in bracket`);
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    
    if (!matchUpdated) {
      console.error("Failed to update match");
      return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
    }
    
    // Save updated bracket state
    try {
      await prisma.event.update({
        where: { id: eventId },
        data: {
          bracketState: bracketState as any
        }
      });
      
      console.log("Match result saved successfully");
      
      return NextResponse.json({ 
        success: true,
        bracket: bracketState
      });
      
    } catch (updateError) {
      console.error("Error saving bracket state:", updateError);
      return NextResponse.json({ 
        error: "Failed to save bracket state",
        details: updateError instanceof Error ? updateError.message : "Unknown error"
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Unexpected error in match result API:", error);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // More detailed error response
    const errorResponse = { 
      error: "Failed to update match result",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      eventId: resolvedParams.id,
      matchId: resolvedParams.matchId
    };
    
    console.error("Sending error response:", errorResponse);
    
    return NextResponse.json(errorResponse, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}