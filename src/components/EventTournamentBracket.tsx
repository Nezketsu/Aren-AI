"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EventMatch {
  id: string;
  participants: Array<{
    user?: {
      id: string;
      name: string;
      profilePic?: string;
      image?: string;
    };
    id?: string;
    name?: string;
  }>;
  winner?: string;
  status: 'waiting' | 'ready' | 'in_progress' | 'completed';
  sourceMatchIds?: string[];
}

interface EventRound {
  matches: EventMatch[];
  roundName?: string;
}

interface EventTournamentBracketProps {
  bracket: EventRound[] | any[];
  onMatchResult: (matchId: string, winnerId: string) => void;
  isOwner: boolean;
}

interface MatchResultModalProps {
  match: EventMatch;
  onClose: () => void;
  onSubmit: (matchId: string, winnerId: string) => void;
  isOwner: boolean;
}

const MatchResultModal: React.FC<MatchResultModalProps> = ({ match, onClose, onSubmit, isOwner }) => {
  const [selectedWinner, setSelectedWinner] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedWinner) return;
    setLoading(true);
    await onSubmit(match.id, selectedWinner);
    setLoading(false);
    onClose();
  };

  const participants = Array.isArray(match.participants) ? match.participants : [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 text-blue-700">Match Result</h3>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">Who won this match?</p>
            
            <div className="space-y-3">
              {participants.map((participant, idx) => {
                const userObj = participant.user || participant;
                if (!userObj?.id || userObj.id === 'TBD') return null;
                
                return (
                  <label key={userObj.id || idx} className="flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors hover:bg-blue-50 hover:border-blue-300">
                    <input
                      type="radio"
                      name="winner"
                      value={userObj.id}
                      checked={selectedWinner === userObj.id}
                      onChange={(e) => setSelectedWinner(e.target.value)}
                      className="mr-3 scale-125"
                      disabled={!isOwner}
                    />
                    <img
                      src={userObj.profilePic || userObj.image || '/logo.png'}
                      alt={userObj.name || 'Player'}
                      className="w-10 h-10 rounded-full mr-3 border-2 border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/logo.png') {
                          target.src = '/logo.png';
                        }
                      }}
                    />
                    <span className="font-medium text-lg">{userObj.name || userObj.id}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            {isOwner && (
              <Button
                onClick={handleSubmit}
                disabled={!selectedWinner || loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Saving..." : "Confirm Winner"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const EventTournamentBracket: React.FC<EventTournamentBracketProps> = ({ bracket, onMatchResult, isOwner }) => {
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const canPlayMatch = (match: any) => {
    if (!Array.isArray(match.participants)) return false;
    if (match.winner || match.status === 'completed') return false;
    
    // Check if both participants are real (not TBD)
    const realParticipants = match.participants.filter((p: any) => {
      const userObj = p.user || p;
      return userObj?.id && userObj.id !== 'TBD' && userObj?.name && userObj.name !== 'TBD';
    });
    
    return realParticipants.length === 2;
  };

  const isMatchCompleted = (match: any) => {
    return match.winner && match.status === 'completed';
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tournament Bracket</h2>
        <p className="text-gray-600">Click on any ready match to record the winner</p>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg p-6">
        <div className="relative flex justify-center">
          {/* SVG for connecting lines */}
          <svg 
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
            style={{ minWidth: '100%', minHeight: '600px' }}
          >
            {bracket.map((round, roundIdx) => {
              if (roundIdx === bracket.length - 1) return null; // No lines from final round
              
              const currentRoundMatches = round.matches;
              const nextRound = bracket[roundIdx + 1];
              
              return currentRoundMatches.map((currentMatch: any, matchIdx: number) => {
                // Find which next round match this feeds into based on sourceMatchIds
                const nextMatch = nextRound.matches.find((nm: any) => 
                  nm.sourceMatchIds && nm.sourceMatchIds.includes(currentMatch.id)
                );
                
                if (!nextMatch) return null;
                
                const nextMatchIdx = nextRound.matches.indexOf(nextMatch);
                
                // Calculate positions based on centered bracket tree layout
                const currentRoundSpacing = roundIdx === 0 ? 40 : 80 * Math.pow(2, roundIdx - 1);
                const nextRoundSpacing = (roundIdx + 1) === 0 ? 40 : 80 * Math.pow(2, roundIdx);
                
                const startX = (roundIdx * 380) + 300; // End of current match card
                const startY = 150 + (roundIdx === 0 ? 0 : currentRoundSpacing * 0.3) + matchIdx * (currentRoundSpacing + 120) + 60; // Center of current match
                
                const endX = ((roundIdx + 1) * 380) + 50; // Start of next match card  
                const endY = 150 + ((roundIdx + 1) === 0 ? 0 : nextRoundSpacing * 0.3) + nextMatchIdx * (nextRoundSpacing + 120) + 60; // Center of next match
                
                const midX = startX + 50; // Control point for the curve
                
                // Different line styles based on match status
                const strokeColor = currentMatch.status === 'completed' ? '#10b981' : '#3b82f6';
                const strokeOpacity = currentMatch.status === 'completed' ? '0.8' : '0.4';
                
                return (
                  <g key={`${roundIdx}-${matchIdx}`}>
                    {/* Horizontal line from match */}
                    <line
                      x1={startX}
                      y1={startY}
                      x2={midX}
                      y2={startY}
                      stroke={strokeColor}
                      strokeWidth="2"
                      opacity={strokeOpacity}
                    />
                    
                    {/* Vertical line (only if needed) */}
                    {startY !== endY && (
                      <line
                        x1={midX}
                        y1={Math.min(startY, endY)}
                        x2={midX}
                        y2={Math.max(startY, endY)}
                        stroke={strokeColor}
                        strokeWidth="2"
                        opacity={strokeOpacity}
                      />
                    )}
                    
                    {/* Horizontal line to next match */}
                    <line
                      x1={midX}
                      y1={endY}
                      x2={endX}
                      y2={endY}
                      stroke={strokeColor}
                      strokeWidth="2"
                      opacity={strokeOpacity}
                    />
                    
                    {/* Winner indicator dot */}
                    {currentMatch.status === 'completed' && (
                      <circle
                        cx={midX}
                        cy={startY}
                        r="4"
                        fill="#10b981"
                        opacity="0.8"
                      />
                    )}
                  </g>
                );
              });
            })}
          </svg>
          
          <div className="flex relative z-10 items-center justify-center" style={{ gap: '80px', minHeight: '600px' }}>
            {bracket.map((round, roundIdx) => {
              // Calculate vertical spacing based on round for proper bracket tree appearance
              const totalRounds = bracket.length;
              const isFirstRound = roundIdx === 0;
              
              // Progressive spacing: first round tight, then doubles each round  
              const baseSpacing = isFirstRound ? 40 : 80 * Math.pow(2, roundIdx - 1);
              const topPadding = isFirstRound ? 0 : (baseSpacing * 0.3);
              
              return (
                <div key={roundIdx} className="flex flex-col min-w-[300px] justify-center" 
                     style={{ 
                       gap: `${baseSpacing}px`,
                       paddingTop: `${topPadding}px`,
                       minHeight: '600px'
                     }}>
                  <h3 className="text-lg font-semibold text-center text-gray-700 mb-6 bg-blue-50 py-2 px-4 rounded-lg border border-blue-200">
                    {round.roundName || 
                     (roundIdx === bracket.length - 1 ? 'Final' : 
                      roundIdx === bracket.length - 2 ? 'Semi-Final' : 
                      `Round ${roundIdx + 1}`)}
                  </h3>
                
                  <div className="flex flex-col justify-center flex-1" style={{ gap: `${baseSpacing}px` }}>
                    {round.matches.map((match: any, matchIdx: number) => {
                      const completed = isMatchCompleted(match);
                      const playable = canPlayMatch(match);
                      const participants = Array.isArray(match.participants) ? match.participants : [];
                      
                      if (participants.length === 0) {
                        return (
                          <Card key={match.id || `${roundIdx}-${matchIdx}`} className="opacity-50">
                            <CardContent className="p-4 text-center text-gray-400">
                              <div className="text-sm">Waiting for participants...</div>
                            </CardContent>
                          </Card>
                        );
                      }
                      
                      // Handle automatic advancement (single participant)
                      if (participants.length === 1 && completed) {
                        const participant = participants[0];
                        const userObj = participant.user || participant;
                        
                        return (
                          <Card key={match.id || `${roundIdx}-${matchIdx}`} className="bg-blue-50 border-blue-300">
                            <CardContent className="p-4">
                              <div className="text-center">
                                <div className="text-xs text-blue-600 font-medium mb-2">Auto-Advance</div>
                                <div className="flex items-center justify-center gap-3">
                                  <img
                                    src={userObj?.profilePic || userObj?.image || '/logo.png'}
                                    alt={userObj?.name || 'Player'}
                                    className="w-10 h-10 rounded-full border-2 border-blue-400 shadow-sm"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      if (target.src !== '/logo.png') {
                                        target.src = '/logo.png';
                                      }
                                    }}
                                  />
                                  <span className="font-semibold text-blue-800">
                                    {userObj?.name || 'Unknown'}
                                  </span>
                                  <div className="text-blue-600 text-lg">⭐</div>
                                </div>
                                <div className="text-xs text-blue-600 mt-2">Advances automatically</div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }

                      return (
                        <Card 
                          key={match.id || `${roundIdx}-${matchIdx}`}
                          className={`transition-all duration-200 cursor-pointer relative ${
                            completed 
                              ? 'bg-green-50 border-green-300 hover:border-green-400 shadow-green-100' 
                              : playable && isOwner
                                ? 'bg-yellow-50 border-yellow-300 hover:border-yellow-400 shadow-yellow-100 hover:shadow-md'
                                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            if (playable && isOwner) {
                              setSelectedMatch(match);
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            {/* Status indicator */}
                            <div className="absolute top-2 right-2">
                              {completed && (
                                <div className="w-3 h-3 bg-green-500 rounded-full" title="Match completed"></div>
                              )}
                              {playable && !completed && (
                                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" title="Ready to play"></div>
                              )}
                              {!playable && !completed && (
                                <div className="w-3 h-3 bg-gray-400 rounded-full" title="Waiting for participants"></div>
                              )}
                            </div>

                            <div className="space-y-3">
                              {[0, 1].map((slotIdx) => {
                                const participant = participants[slotIdx];
                                const userObj = participant ? (participant.user || participant) : null;
                                const isTBD = !userObj || !userObj.id || userObj.id === 'TBD' || !userObj.name || userObj.name === 'TBD';
                                const isWinner = userObj && match.winner === userObj.id;
                                return (
                                  <div
                                    key={userObj?.id || userObj?.name || slotIdx}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                                      isWinner
                                        ? 'bg-green-100 border-2 border-green-300 shadow-sm'
                                        : 'bg-white border border-gray-200'
                                    }`}
                                  >
                                    <img
                                      src={isTBD ? '/logo.png' : (userObj?.profilePic || userObj?.image || '/logo.png')}
                                      alt={userObj?.name || 'Player'}
                                      className={`w-10 h-10 rounded-full border-2 shadow-sm flex-shrink-0 ${
                                        isWinner ? 'border-green-500' : 'border-blue-300'
                                      } ${isTBD ? 'opacity-50' : ''}`}
                                      style={{ objectFit: 'cover' }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (target.src !== '/logo.png') {
                                          target.src = '/logo.png';
                                        }
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <span className={`font-semibold text-sm block truncate ${
                                        isWinner ? 'text-green-800' : 'text-gray-800'
                                      } ${isTBD ? 'text-gray-500' : ''}`}>
                                        {isTBD ? 'Waiting' : (userObj?.name || userObj?.id || 'Unknown')}
                                      </span>
                                    </div>
                                    {isWinner && (
                                      <div className="text-green-600 text-lg">👑</div>
                                    )}
                                  </div>
                                );
                              })}
                              
                              {/* Show vs only if we have exactly 2 real participants and match isn't completed */}
                              {participants.filter((p: any) => {
                                const userObj = p.user || p;
                                return userObj?.id && userObj.id !== 'TBD' && userObj?.name && userObj.name !== 'TBD';
                              }).length === 2 && !completed && (
                                <div className="text-center py-1">
                                  <span className="text-blue-500 font-bold text-sm">VS</span>
                                </div>
                              )}
                            </div>

                            {/* Action indicator */}
                            {playable && isOwner && (
                              <div className="mt-3 text-center">
                                <span className="text-xs text-yellow-700 font-medium bg-yellow-100 px-2 py-1 rounded">
                                  Click to record winner
                                </span>
                              </div>
                            )}
                            
                            {completed && (
                              <div className="mt-3 text-center">
                                <span className="text-xs text-green-700 font-medium bg-green-100 px-2 py-1 rounded">
                                  Match completed
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tournament Winner Display */}
      {bracket.length > 0 && bracket[bracket.length - 1].matches[0]?.winner && (
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-lg inline-block">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-yellow-800 mb-2">🏆 Tournament Champion</h3>
              <div className="flex items-center justify-center gap-4">
                {(() => {
                  const finalMatch = bracket[bracket.length - 1].matches[0];
                  const winner = finalMatch.participants.find((p: any) => {
                    const userObj = p.user || p;
                    return userObj?.id === finalMatch.winner;
                  });
                  const userObj = winner?.user || winner;
                  
                  return (
                    <>
                      <img
                        src={userObj?.profilePic || userObj?.image || '/logo.png'}
                        alt={userObj?.name || 'Champion'}
                        className="w-16 h-16 rounded-full border-4 border-yellow-400 shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/logo.png') {
                            target.src = '/logo.png';
                          }
                        }}
                      />
                      <span className="text-2xl font-bold text-yellow-900">
                        {userObj?.name || 'Unknown Champion'}
                      </span>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Match Result Modal */}
      {selectedMatch && (
        <MatchResultModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSubmit={onMatchResult}
          isOwner={isOwner}
        />
      )}
    </div>
  );
};