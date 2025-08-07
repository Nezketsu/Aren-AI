import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to generate a simple single-elimination bracket
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

function generateBracket(participants: { userId: string; user?: { id?: string; name?: string | null; image?: string | null } | null }[]): BracketRound[] {
  try {
    // Validate participants
    if (!participants || participants.length === 0) {
      console.error("No participants provided");
      return [{
        roundName: "Empty Tournament",
        matches: []
      }];
    }

    if (participants.length < 2) {
      console.error("Need at least 2 participants");
      return [{
        roundName: "Not Enough Participants",
        matches: []
      }];
    }

    // Shuffle participants for fairness
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    // Create user objects safely
    const players = shuffled.map((p, i) => {
      const userId = p.userId || `player-${i}`;
      const userName = p.user?.name || `Player ${i + 1}`;
      const userImage = p.user?.image || undefined;
      const userActualId = p.user?.id || userId;

      return {
        id: userActualId,
        name: userName,
        profilePic: userImage
      };
    });

    console.log(`Generating adaptive single-elimination tournament for ${players.length} players`);
    
    return generateAdaptiveBracket(players);
    
  } catch (error) {
    console.error("Error in generateBracket:", error);
    // Return a minimal bracket structure to prevent total failure
    return [{
      roundName: "Error - Empty Tournament",
      matches: []
    }];
  }
}

function generateAdaptiveBracket(players: any[]): BracketRound[] {
  console.log(`Creating adaptive bracket for ${players.length} players`);
  
  // Calculate all rounds structure first
  const roundsInfo = calculateRoundsStructure(players.length);
  const rounds: BracketRound[] = [];
  let matchId = 1;

  // Generate all rounds
  for (let roundIndex = 0; roundIndex < roundsInfo.length; roundIndex++) {
    const roundInfo = roundsInfo[roundIndex];
    const roundMatches: BracketNode[] = [];
    
    // First round - assign actual players
    if (roundIndex === 0) {
      let playerIndex = 0;
      
      // Create regular matches
      for (let i = 0; i < roundInfo.regularMatches; i++) {
        const player1 = players[playerIndex++];
        const player2 = players[playerIndex++];
        
        const match: BracketNode = {
          id: `match-${matchId}`,
          name: `${player1.name} vs ${player2.name}`,
          participants: [player1, player2],
          sourceMatchIds: [],
          match: i,
          seed: null,
          status: 'ready'
        };
        
        roundMatches.push(match);
        matchId++;
      }
      
      // Create auto-advance match if needed
      if (roundInfo.hasAutoAdvance) {
        const advancingPlayer = players[playerIndex];
        
        const autoAdvanceMatch: BracketNode = {
          id: `match-${matchId}`,
          name: `${advancingPlayer.name} (Auto-Advance)`,
          participants: [advancingPlayer],
          sourceMatchIds: [],
          match: roundInfo.regularMatches,
          seed: null,
          status: 'completed',
          winner: advancingPlayer.id
        };
        
        roundMatches.push(autoAdvanceMatch);
        matchId++;
      }
    } else {
      // Later rounds - create placeholder matches with source match IDs
      const previousRound = rounds[roundIndex - 1];
      
      for (let i = 0; i < roundInfo.totalMatches; i++) {
        const sourceMatch1Index = i * 2;
        const sourceMatch2Index = sourceMatch1Index + 1;
        
        const sourceMatchIds: string[] = [];
        if (previousRound.matches[sourceMatch1Index]) {
          sourceMatchIds.push(previousRound.matches[sourceMatch1Index].id);
        }
        if (previousRound.matches[sourceMatch2Index]) {
          sourceMatchIds.push(previousRound.matches[sourceMatch2Index].id);
        }
        
        const match: BracketNode = {
          id: `match-${matchId}`,
          name: 'TBD vs TBD',
          participants: [
            { id: 'TBD', name: 'TBD' },
            { id: 'TBD', name: 'TBD' }
          ],
          sourceMatchIds,
          match: i,
          seed: null,
          status: 'waiting'
        };
        
        roundMatches.push(match);
        matchId++;
      }
    }
    
    rounds.push({
      roundName: roundInfo.name,
      matches: roundMatches
    });
  }
  
  console.log(`Generated ${rounds.length} rounds for adaptive tournament`);
  return rounds;
}

function calculateRoundsStructure(playerCount: number) {
  const rounds = [];
  let currentPlayerCount = playerCount;
  let roundNumber = 1;
  
  while (currentPlayerCount > 1) {
    const regularMatches = Math.floor(currentPlayerCount / 2);
    const hasAutoAdvance = currentPlayerCount % 2 === 1;
    const totalMatches = regularMatches + (hasAutoAdvance ? 1 : 0);
    const winnersCount = regularMatches + (hasAutoAdvance ? 1 : 0);
    
    // Determine round name
    let roundName;
    if (winnersCount === 1) {
      roundName = 'Final';
    } else if (winnersCount === 2) {
      roundName = 'Semi-Final';
    } else if (winnersCount === 4) {
      roundName = 'Quarter-Final';
    } else {
      roundName = `Round ${roundNumber}`;
    }
    
    rounds.push({
      regularMatches,
      hasAutoAdvance,
      totalMatches,
      winnersCount,
      name: roundName
    });
    
    currentPlayerCount = winnersCount;
    roundNumber++;
    
    // Safety check
    if (roundNumber > 10) break;
  }
  
  return rounds;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    // Handle async params for Next.js 15+
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    
    console.log("Fetching event with ID:", id);
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
    });

    if (!event) {
      console.log("Event not found");
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    console.log("Event found, participants count:", event.participants.length);

    // Only allow bracket creation if registration is closed
    const now = new Date();
    const applyEnd = new Date(event.applyEnd);
    if (now < applyEnd) {
      console.log("Registration still open");
      return NextResponse.json({ error: "Registration still open" }, { status: 400 });
    }

    // Check if we have enough participants
    if (event.participants.length < 2) {
      console.log("Not enough participants");
      return NextResponse.json({ error: "Need at least 2 participants to create a bracket" }, { status: 400 });
    }

    // Check if bracketState exists and is valid
    if (event.bracketState) {
      try {
        // Ensure bracketState is an array
        const existingBracket = Array.isArray(event.bracketState) 
          ? event.bracketState 
          : JSON.parse(JSON.stringify(event.bracketState));
          
        if (Array.isArray(existingBracket) && existingBracket.length > 0) {
          console.log("Returning existing bracket");
          return NextResponse.json({ bracket: existingBracket });
        }
      } catch (e) {
        console.error("Error parsing existing bracket state:", e);
      }
    }

    console.log("Generating new bracket");
    
    // Generate new bracket
    const bracket: BracketRound[] = generateBracket(event.participants);
    
    console.log("Bracket generated with", bracket.length, "rounds");
    
    // Save bracket to database
    try {
      await prisma.event.update({
        where: { id },
        data: { 
          bracketState: bracket as any // Cast to any to handle Prisma Json type
        }
      });
      
      console.log("Bracket saved successfully");
    } catch (updateError) {
      console.error("Error updating database:", updateError);
      
      // Log detailed error information
      if (updateError instanceof Error) {
        console.error("Database error message:", updateError.message);
        console.error("Database error stack:", updateError.stack);
      }
      
      // Log the bracket data being saved
      console.log("Bracket data length:", bracket.length);
      console.log("Bracket structure:", JSON.stringify(bracket, null, 2));
      
      // Still return the bracket even if save fails
      return NextResponse.json({ 
        bracket,
        warning: "Bracket generated but failed to save to database",
        error: updateError instanceof Error ? updateError.message : "Unknown database error"
      });
    }
    
    return NextResponse.json({ bracket });
    
  } catch (error) {
    console.error("Bracket generation error:", error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json({ 
      error: "Failed to create bracket",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  } finally {
    // Ensure Prisma client is properly disconnected
    await prisma.$disconnect();
  }
}