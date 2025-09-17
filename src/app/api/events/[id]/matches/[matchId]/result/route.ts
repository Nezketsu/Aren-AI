import { NextResponse } from "next/server";
import { withAuth, prisma } from "@/lib/auth";

// Fonctions utilitaires pour la logique de tournoi
function advanceWinnerToNextRound(completedMatch: any, nextRound: any, allRounds: any[], nextRoundIndex: number) {
  // Trouver les matchs du prochain round alimentés par ce match
  for (let nextMatch of nextRound.matches) {
    if (nextMatch.sourceMatchIds?.includes(completedMatch.id)) {
      const sourceMatchIndex = nextMatch.sourceMatchIds.indexOf(completedMatch.id);
      
      if (sourceMatchIndex !== -1) {
        // Trouver le participant gagnant
        const winningParticipant = completedMatch.participants?.find((p: any) => 
          p && (p.id === completedMatch.winner || p.user?.id === completedMatch.winner)
        );
        
        if (winningParticipant) {
          // Initialiser les participants si nécessaire
          if (!nextMatch.participants) {
            nextMatch.participants = [
              { id: 'TBD', name: 'TBD' },
              { id: 'TBD', name: 'TBD' }
            ];
          }
          
          // Placer le gagnant dans le bon slot
          nextMatch.participants[sourceMatchIndex] = {
            id: winningParticipant.id || winningParticipant.user?.id,
            name: winningParticipant.name || winningParticipant.user?.name,
            profilePic: winningParticipant.profilePic || winningParticipant.user?.profilePic,
            user: winningParticipant.user
          };
          
          // Vérifier l'état du match après l'ajout
          updateMatchStatus(nextMatch);
          
          // Si le match devient un bye, le traiter récursivement
          if (nextMatch.status === 'completed' && nextMatch.winner) {
            if (nextRoundIndex < allRounds.length - 1) {
              advanceWinnerToNextRound(nextMatch, allRounds[nextRoundIndex + 1], allRounds, nextRoundIndex + 1);
            }
          }
        }
      }
    }
  }
}

function updateMatchStatus(match: any) {
  const participant1 = match.participants[0];
  const participant2 = match.participants[1];
  
  if (participant1?.id !== 'TBD' && participant2?.id !== 'TBD') {
    // Deux participants - match prêt
    match.name = `${participant1.name} vs ${participant2.name}`;
    match.status = 'ready';
  } else if (participant1?.id !== 'TBD' && participant2?.id === 'TBD') {
    // Premier participant seulement - en attente de l'adversaire (pas un bye automatique)
    match.name = `${participant1.name} vs TBD`;
    match.status = 'waiting';
  } else if (participant1?.id === 'TBD' && participant2?.id !== 'TBD') {
    // Deuxième participant seulement - en attente de l'adversaire (pas un bye automatique)
    match.name = `TBD vs ${participant2.name}`;
    match.status = 'waiting';
  } else {
    // Aucun participant - en attente
    match.name = 'TBD vs TBD';
    match.status = 'waiting';
  }
}

// Fonction supprimée : les byes ne sont plus créés automatiquement lors de la progression normale
// Ils ne sont créés que dans le bracket initial pour les nombres impairs d'équipes

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: eventId, matchId } = resolvedParams;

    // Check authentication only (not ownership)
    const authCheck = await withAuth();
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const { user } = authCheck;

    // Get the event
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user is a participant or owner
    const isOwner = event.ownerId === user.id;
    const isParticipant = await prisma.participant.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: user.id,
        },
      },
    });

    if (!isOwner && !isParticipant) {
      return NextResponse.json({ error: "You must be a participant or owner to declare winners" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { winnerId } = body;

    if (!winnerId) {
      return NextResponse.json({ error: "Winner ID is required" }, { status: 400 });
    }

    // Get current bracket state
    let bracketState = event.bracketState as any[] || [];

    if (!Array.isArray(bracketState) || bracketState.length === 0) {
      return NextResponse.json(
        { error: "No bracket found - please generate the tournament bracket first" },
        { status: 400 }
      );
    }

    // Find and update the match
    let matchFound = false;

    for (let roundIndex = 0; roundIndex < bracketState.length; roundIndex++) {
      const round = bracketState[roundIndex];
      if (!round.matches || !Array.isArray(round.matches)) continue;

      const matchIndex = round.matches.findIndex((m: any) => m.id === matchId);

      if (matchIndex !== -1) {
        matchFound = true;
        const match = round.matches[matchIndex];

        // Verify winner is a participant in this match
        const isValidWinner = match.participants?.some((p: any) => 
          p && (p.id === winnerId || p.user?.id === winnerId)
        );

        if (!isValidWinner) {
          return NextResponse.json(
            { error: "Invalid winner - not a participant in this match" },
            { status: 400 }
          );
        }

        // Update the match with winner
        match.winner = winnerId;
        match.status = 'completed';

        // Find winning participant details
        const winningParticipant = match.participants?.find((p: any) => 
          p.id === winnerId || p.user?.id === winnerId
        );

        // Avancer le gagnant au prochain round si ce n'est pas la finale
        if (roundIndex < bracketState.length - 1) {
          advanceWinnerToNextRound(match, bracketState[roundIndex + 1], bracketState, roundIndex + 1);
        }

        break;
      }
    }

    if (!matchFound) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Save updated bracket state
    await prisma.event.update({
      where: { id: eventId },
      data: {
        bracketState: bracketState
      }
    });

    return NextResponse.json({
      success: true,
      bracket: bracketState
    });

  } catch (error) {
    console.error("Error updating match result:", error);
    return NextResponse.json(
      { error: "Failed to update match result" },
      { status: 500 }
    );
  }
}
