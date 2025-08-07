"use client";
import React, { useEffect, useState } from "react";
import { NavBar } from "@/components/navbar";
import { useUser } from "@/app/account/useUser";
import { EventTournamentBracket } from "@/components/EventTournamentBracket";

// Single definition of AutoApplyAllUsers
type AutoApplyAllUsersProps = { eventId: string; onApplied: () => void };
const AutoApplyAllUsers: React.FC<AutoApplyAllUsersProps> = ({ eventId, onApplied }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleAutoApply = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const res = await fetch(`/api/events/${eventId}/auto-apply-all`, { method: "POST" });
            if (!res.ok) throw new Error("Erreur lors de l'auto-apply");
            setSuccess(true);
            onApplied();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-4 flex flex-col items-center">
            <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:opacity-50"
                onClick={handleAutoApply}
                disabled={loading}
            >
                {loading ? "Application en cours..." : "Auto-appliquer tous les utilisateurs"}
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
            {success && <div className="text-green-600 mt-2">Tous les utilisateurs ont été appliqués !</div>}
        </div>
    );
};


const EventDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = React.use(params);
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

    useEffect(() => {
        if (!id) return;
        const fetchEvent = async () => {
            try {
                setError(null);
                const res = await fetch(`/api/events/${id}`);
                if (!res.ok) throw new Error("Failed to fetch event");
                const data = await res.json();
                setEvent(data);
            } catch (err: any) {
                setError(err instanceof Error ? err.message : "Failed to fetch event");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    // Bracket state
    const [bracket, setBracket] = useState<any[][] | null>(null);
    const [bracketError, setBracketError] = useState<string | null>(null);
    const [bracketLoading, setBracketLoading] = useState(false);

    // Check if registration is closed
    const now = new Date();
    const applyEnd = event ? new Date(event.applyEnd) : null;
    const registrationClosed = event && applyEnd ? now > applyEnd : false;
    const isOwner = user && event && user.id === event.ownerId;

    useEffect(() => {
        if (event && registrationClosed && event.participants?.length > 1) {
            setBracketLoading(true);
            fetch(`/api/events/${event.id}/bracket`, { method: "POST" })
                .then(res => res.json())
                .then(data => {
                    if (data.error) setBracketError(data.error);
                    else setBracket(data.bracket);
                })
                .catch(() => setBracketError("Failed to fetch bracket"))
                .finally(() => setBracketLoading(false));
        } else {
            setBracket(null);
            setBracketError(null);
        }
    }, [event, registrationClosed]);

    // Handle match result submission
    const handleMatchResult = async (matchId: string, winnerId: string) => {
      try {
        // Notez le slash avant "result"
        const response = await fetch(`/api/events/${event.id}/matches/${matchId}/result`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ winnerId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          throw new Error(errorData.error || 'Failed to update match result');
        }

        const data = await response.json();
        
        // Update the local bracket state
        if (data.bracket) {
          setBracket(data.bracket);
        }
        
        
        // Success - match result updated successfully
        console.log('Match result updated successfully');
        
      } catch (error) {
        console.error('Error updating match result:', error);
        // Show error to user
        const errorMessage = error instanceof Error ? error.message : 'Failed to update match result';
        console.error(errorMessage);
      }
    };

    const handleAutoApplyRefresh = () => {
        if (id) {
            fetch(`/api/events/${id}`)
                .then(res => res.json())
                .then(data => setEvent(data))
                .catch(console.error);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found</div>;

    return (
        <>
            <NavBar />
            <main className="min-h-screen bg-gradient-blue px-4 flex items-center justify-center pt-32">
                <div className="flex flex-col items-center w-full max-w-6xl">
                    {/* Auto-apply all users button (visible only for owner) */}
                    {isOwner && !registrationClosed && (
                        <AutoApplyAllUsers eventId={event.id} onApplied={handleAutoApplyRefresh} />
                    )}

                    <header className="mb-10 text-center">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-blue-700 mb-2 drop-shadow-sm">{event.name}</h1>
                        <p className="text-lg md:text-xl text-blue-500 font-medium">{event.description}</p>
                    </header>

                    <section className="w-full bg-white/80 rounded-xl shadow-lg p-6 mb-8">
                        <div className="mb-4 text-blue-700 font-bold">Event ID: {event.id}</div>
                        <div className="mb-2 text-blue-600">Owner: {event.ownerId}</div>
                        <div className="mb-2 text-blue-600">Created: {new Date(event.createdAt).toLocaleString()}</div>
                        <div className="mb-2 text-blue-600">Registration: {new Date(event.applyStart).toLocaleString()} - {new Date(event.applyEnd).toLocaleString()}</div>
                        <div className="mb-2 text-blue-600">Participants: {event.participants?.length ?? 0}</div>
                    </section>

                    {registrationClosed && (
                        <section className="w-full bg-white/90 rounded-xl shadow-lg p-6 mb-8">
                            {bracketLoading ? (
                                <div className="text-blue-500">Generating bracket...</div>
                            ) : bracketError ? (
                                <div className="text-red-500">{bracketError}</div>
                            ) : Array.isArray(bracket) && bracket.length > 0 ? (
                                <EventTournamentBracket 
                                    bracket={bracket} 
                                    onMatchResult={handleMatchResult}
                                    isOwner={isOwner || false}
                                />
                            ) : (
                                <div className="text-blue-400">No bracket generated.</div>
                            )}
                        </section>
                    )}

                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700" onClick={() => window.history.back()}>
                        Back
                    </button>
                </div>
            </main>
        </>
    );
};

export default EventDetailPage;