export interface Participant {
  id: string;
  name: string;
  seed?: number;
}

export interface Match {
  id: string;
  participant1?: Participant;
  participant2?: Participant;
  winner?: Participant;
  round: number;
  matchNumber: number;
  nextMatchId?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface TournamentBracket {
  id: string;
  name: string;
  participants: Participant[];
  matches: Match[];
  currentRound: number;
  totalRounds: number;
  status: 'setup' | 'in_progress' | 'completed';
}

export function createTournamentBracket(
  name: string,
  participants: Participant[]
): TournamentBracket {
  if (participants.length < 2) {
    throw new Error('Tournament requires at least 2 participants');
  }

  const participantCount = participants.length;
  const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(participantCount)));
  const totalRounds = Math.log2(powerOfTwo);
  
  const seededParticipants = [...participants]
    .sort((a, b) => (a.seed || 999) - (b.seed || 999))
    .slice(0, powerOfTwo);

  while (seededParticipants.length < powerOfTwo) {
    seededParticipants.push({
      id: `bye-${seededParticipants.length}`,
      name: 'BYE',
    });
  }

  const matches = generateMatches(seededParticipants, totalRounds);

  return {
    id: Date.now().toString(),
    name,
    participants: seededParticipants,
    matches,
    currentRound: 1,
    totalRounds,
    status: 'setup',
  };
}

function generateMatches(participants: Participant[], totalRounds: number): Match[] {
  const matches: Match[] = [];
  let matchId = 1;

  for (let round = 1; round <= totalRounds; round++) {
    const matchesInRound = Math.pow(2, totalRounds - round);

    for (let matchInRound = 0; matchInRound < matchesInRound; matchInRound++) {
      const match: Match = {
        id: `match-${matchId}`,
        round,
        matchNumber: matchInRound + 1,
        status: 'pending',
      };

      if (round === 1) {
        const participant1Index = matchInRound * 2;
        const participant2Index = participant1Index + 1;

        match.participant1 = participants[participant1Index];
        match.participant2 = participants[participant2Index];
      }

      // Auto-qualify if only one participant (other is missing or BYE)
      if (
        match.participant1 &&
        (!match.participant2 || match.participant2.name === 'BYE')
      ) {
        match.winner = match.participant1;
        match.status = 'completed';
      } else if (
        match.participant2 &&
        (!match.participant1 || match.participant1.name === 'BYE')
      ) {
        match.winner = match.participant2;
        match.status = 'completed';
      }

      if (round < totalRounds) {
        match.nextMatchId = `match-${Math.floor((matchId + matchesInRound) / 2) + matchesInRound}`;
      }

      matches.push(match);
      matchId++;
    }
  }

  return matches;
}

export function updateMatchResult(
  bracket: TournamentBracket,
  matchId: string,
  winnerId: string
): TournamentBracket {
  const updatedMatches = bracket.matches.map(match => {
    if (match.id === matchId) {
      const winner = match.participant1?.id === winnerId 
        ? match.participant1 
        : match.participant2;
      
      return {
        ...match,
        winner,
        status: 'completed' as const,
      };
    }
    return match;
  });

  const updatedMatch = updatedMatches.find(m => m.id === matchId);
  if (updatedMatch?.nextMatchId && updatedMatch.winner) {
    const nextMatch = updatedMatches.find(m => m.id === updatedMatch.nextMatchId);
    if (nextMatch) {
      const nextMatchIndex = updatedMatches.findIndex(m => m.id === updatedMatch.nextMatchId);
      if (!nextMatch.participant1) {
        updatedMatches[nextMatchIndex] = {
          ...nextMatch,
          participant1: updatedMatch.winner,
        };
      } else if (!nextMatch.participant2) {
        updatedMatches[nextMatchIndex] = {
          ...nextMatch,
          participant2: updatedMatch.winner,
        };
      }
    }
  }

  const allRoundMatches = updatedMatches.filter(m => m.round === bracket.currentRound);
  const completedRoundMatches = allRoundMatches.filter(m => m.status === 'completed');
  
  let newCurrentRound = bracket.currentRound;
  let newStatus = bracket.status;
  
  if (completedRoundMatches.length === allRoundMatches.length && bracket.currentRound < bracket.totalRounds) {
    newCurrentRound = bracket.currentRound + 1;
  }
  
  if (bracket.currentRound === bracket.totalRounds && completedRoundMatches.length === allRoundMatches.length) {
    newStatus = 'completed';
  } else if (bracket.status === 'setup') {
    newStatus = 'in_progress';
  }

  return {
    ...bracket,
    matches: updatedMatches,
    currentRound: newCurrentRound,
    status: newStatus,
  };
}

export function getTournamentWinner(bracket: TournamentBracket): Participant | null {
  if (bracket.status !== 'completed') return null;
  
  const finalMatch = bracket.matches.find(
    match => match.round === bracket.totalRounds && match.status === 'completed'
  );
  
  return finalMatch?.winner || null;
}

export function getMatchesByRound(bracket: TournamentBracket, round: number): Match[] {
  return bracket.matches.filter(match => match.round === round);
}