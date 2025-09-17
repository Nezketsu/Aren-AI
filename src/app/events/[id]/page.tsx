"use client";
import React, { useEffect, useState } from "react";
import { NavBar } from "@/components/navbar";
import { useUser } from "@/app/account/useUser";
import BracketFlow from "@/components/BracketFlow";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast, toastHelpers } from "@/components/ui/toast";

// A simplified version of the AutoApplyAllUsers component for brevity
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
        <div className="space-y-3">
            <button
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors font-medium"
                onClick={handleAutoApply}
                disabled={loading}
            >
                {loading ? "Traitement..." : "Inscrire Tous les Utilisateurs"}
            </button>
            {error && (
                <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="text-green-600 bg-green-50 p-3 rounded-lg text-sm">
                    Tous les utilisateurs ont été inscrits avec succès !
                </div>
            )}
        </div>
    );
};


const EventDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = React.use(params);
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bracketLoading, setBracketLoading] = useState(false);
    const [bracketExists, setBracketExists] = useState(false);
    const { user } = useUser();
    const { confirm, ConfirmDialogComponent } = useConfirmDialog();
    const toast = useToast();

    useEffect(() => {
        if (!id) return;
        const fetchEvent = async () => {
            try {
                setError(null);
                const res = await fetch(`/api/events/${id}`);
                if (!res.ok) throw new Error("Failed to fetch event");
                const data = await res.json();
                setEvent(data);
                
                // Check if bracket exists
                if (data) {
                    checkBracketExists();
                }
            } catch (err: any) {
                setError(err instanceof Error ? err.message : "Failed to fetch event");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const checkBracketExists = async () => {
        try {
            const res = await fetch(`/api/events/${id}/bracket`);
            if (res.ok) {
                const data = await res.json();
                setBracketExists(data.bracket && data.bracket.length > 0);
            }
        } catch (error) {
            console.error('Error checking bracket:', error);
        }
    };

    const generateBracket = async () => {
        setBracketLoading(true);
        try {
            const res = await fetch(`/api/events/${id}/bracket`, {
                method: 'POST',
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate bracket');
            }
            
            setBracketExists(true);
            toastHelpers.bracketCreated(toast);
            
            // Refresh the page to show the bracket
            window.location.reload();
        } catch (error: any) {
            toastHelpers.bracketError(toast, error.message);
        } finally {
            setBracketLoading(false);
        }
    };

    // Disputes state
    const [disputes, setDisputes] = useState<any[]>([]);
    const [disputesLoading, setDisputesLoading] = useState(false);
    
    // Check if registration is closed
    const now = new Date();
    const applyEnd = event ? new Date(event.applyEnd) : null;
    const registrationClosed = event && applyEnd ? now > applyEnd : false;
    const isOwner = user && event && user.id === event.ownerId;

    // Load disputes for event owners
    useEffect(() => {
        const loadDisputes = async () => {
            if (event && isOwner) {
                setDisputesLoading(true);
                try {
                    const res = await fetch(`/api/events/${event.id}/disputes`);
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    setDisputes(data.disputes || []);
                } catch (error) {
                    console.error('Failed to load disputes:', error);
                } finally {
                    setDisputesLoading(false);
                }
            }
        };
        
        loadDisputes();
    }, [event, isOwner]);

    const handleAutoApplyRefresh = () => {
        if (id) {
            fetch(`/api/events/${id}`)
                .then(res => res.json())
                .then(data => setEvent(data))
                .catch(console.error);
        }
    };

    // Handle tournament deletion
    const handleDeleteTournament = async () => {
        const firstConfirm = await confirm({
            title: 'Supprimer le tournoi',
            message: 'Êtes-vous sûr de vouloir supprimer définitivement ce tournoi ? Cette action est irréversible.',
            type: 'danger',
            confirmText: 'Continuer',
            cancelText: 'Annuler'
        });

        if (!firstConfirm) return;

        const finalConfirm = await confirm({
            title: 'Confirmation finale',
            message: 'ATTENTION: Toutes les données du tournoi (participants, scores, résultats) seront supprimées définitivement. Cette action ne peut pas être annulée.',
            type: 'danger',
            confirmText: 'Supprimer définitivement',
            cancelText: 'Annuler'
        });

        if (!finalConfirm) return;

        try {
            const response = await fetch(`/api/events/${event.id}/delete`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toastHelpers.tournamentDeleted(toast);
                setTimeout(() => window.location.href = '/events', 1000);
            } else {
                const errorData = await response.json();
                toastHelpers.deleteError(toast, errorData.error);
            }
        } catch (error) {
            console.error('Error deleting tournament:', error);
            toastHelpers.networkError(toast);
        }
    };

    // Handle dispute resolution
    const handleResolveDispute = async (disputeId: string, winnerId: string, finalScore: string) => {
        try {
            const res = await fetch(`/api/events/${event.id}/disputes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disputeId, winnerId, finalScore })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setDisputes(prev => prev.filter(d => d.id !== disputeId));
            
            // The bracket component will refetch automatically after a dispute is resolved.
            toastHelpers.disputeResolved(toast);
        } catch (error) {
            console.error('Error resolving dispute:', error);
            toast.error('Erreur de résolution', error instanceof Error ? error.message : 'Impossible de résoudre le litige');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-solid-cream flex items-center justify-center">
            <div className="text-gray-600 text-lg">Loading event...</div>
        </div>
    );
    if (error) return (
        <div className="min-h-screen bg-solid-cream flex items-center justify-center">
            <div className="text-red-500 text-lg">{error}</div>
        </div>
    );
    if (!event) return (
        <div className="min-h-screen bg-solid-cream flex items-center justify-center">
            <div className="text-gray-600 text-lg">Event not found</div>
        </div>
    );

    return (
        <>
            <NavBar />
            <main className="min-h-screen bg-solid-cream pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <button 
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                                onClick={() => window.history.back()}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Retour aux Événements
                            </button>
                            {isOwner && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    Organisateur
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{event.name}</h1>
                        {event.description && (
                            <p className="text-lg text-gray-600">{event.description}</p>
                        )}
                    </div>

                    {/* Owner Controls */}
                    {isOwner && !registrationClosed && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Contrôles Organisateur</h3>
                            <AutoApplyAllUsers eventId={event.id} onApplied={handleAutoApplyRefresh} />
                        </div>
                    )}

                    {/* Tournament Finished - Owner Controls */}
                    {isOwner && registrationClosed && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Gestion du Tournoi Terminé</h3>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Le tournoi est terminé. Vous pouvez maintenant le supprimer définitivement.
                                </p>
                                <button
                                    onClick={handleDeleteTournament}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    Supprimer le Tournoi
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Dispute Management (Owner Only) */}
                    {isOwner && disputes.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                🚨 Litiges à résoudre ({disputes.length})
                            </h3>
                            <div className="space-y-4">
                                {disputes.map((dispute: any) => (
                                    <div key={dispute.id} className="border border-yellow-300 bg-yellow-50 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">
                                                    Match: {dispute.matchId}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    Créé le: {new Date(dispute.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-medium">
                                                {dispute.status === 'pending' ? 'En attente' : dispute.status}
                                            </span>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-700 mb-2">
                                                <strong>Scores soumis:</strong>
                                            </p>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="bg-white p-2 rounded border">
                                                    <strong>Participant 1:</strong> {dispute.participant1Score}
                                                </div>
                                                <div className="bg-white p-2 rounded border">
                                                    <strong>Participant 2:</strong> {dispute.participant2Score}
                                                </div>
                                            </div>
                                        </div>

                                        {dispute.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        const winnerId = prompt('Entrez l\'ID du gagnant:');
                                                        const finalScore = prompt('Entrez le score final (ex: 3-1):');
                                                        if (winnerId && finalScore) {
                                                            handleResolveDispute(dispute.id, winnerId, finalScore);
                                                        }
                                                    }}
                                                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                                >
                                                    Résoudre en faveur du participant 1
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const winnerId = dispute.participant2Id;
                                                        const finalScore = prompt('Entrez le score final (ex: 3-1):');
                                                        if (finalScore) {
                                                            handleResolveDispute(dispute.id, winnerId, finalScore);
                                                        }
                                                    }}
                                                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                                >
                                                    Résoudre en faveur du participant 2
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                        {/* Event Details */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Event Details</h2>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Registration Period</dt>
                                        <dd className="text-sm text-gray-900 mt-1">
                                            {new Date(event.applyStart).toLocaleDateString()} - {new Date(event.applyEnd).toLocaleDateString()}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Participants</dt>
                                        <dd className="text-sm text-gray-900 mt-1">
                                            {event.participants?.length ?? 0}{event.maxParticipants ? `/${event.maxParticipants}` : ''}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd className="text-sm mt-1">
                                            {registrationClosed ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Registration Closed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Registration Open
                                                </span>
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Created</dt>
                                        <dd className="text-sm text-gray-900 mt-1">
                                            {new Date(event.createdAt).toLocaleDateString()}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Participants - Même hauteur que Event Details */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex flex-col">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Participants ({event.participants?.length ?? 0})
                                </h3>
                                {user && !isOwner && (
                                    <div className="mb-4">
                                        {(() => {
                                            const alreadyIn = event.participants?.some((p: any) => p.userId === user.id);
                                            const now = new Date();
                                            const open = now >= new Date(event.applyStart) && now <= new Date(event.applyEnd);
                                            const full = typeof event.maxParticipants === 'number' && (event.participants?.length ?? 0) >= event.maxParticipants;
                                            if (!open) {
                                                return <div className="text-sm text-gray-500">Inscriptions fermées</div>;
                                            }
                                            if (alreadyIn) {
                                                return (
                                                    <button
                                                        className="w-full px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
                                                        onClick={async () => {
                                                            try {
                                                                const res = await fetch(`/api/participants?eventId=${event.id}`, { method: 'DELETE' });
                                                                const d = await res.json();
                                                                if (!res.ok) throw new Error(d.error || 'Withdraw failed');
                                                                handleAutoApplyRefresh();
                                                            } catch (e: any) {
                                                                toast.error('Erreur de désinscription', e.message);
                                                            }
                                                        }}
                                                    >
                                                        Se désinscrire
                                                    </button>
                                                );
                                            }
                                            return (
                                                <button
                                                    className="w-full px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                    disabled={full}
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch('/api/participants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: event.id }) });
                                                            const d = await res.json();
                                                            if (!res.ok) throw new Error(d.error || 'Join failed');
                                                            handleAutoApplyRefresh();
                                                        } catch (e: any) {
                                                            toast.error('Erreur d&apos;inscription', e.message);
                                                        }
                                                    }}
                                                >
                                                    S'inscrire
                                                </button>
                                            );
                                        })()}
                                    </div>
                                )}
                                {event.participants && event.participants.length > 0 ? (
                                    <div className="participants-list max-h-[150px] overflow-y-auto scrollbar-hide" role="list" aria-label="Liste des participants">
                                        <div className="space-y-2 px-1 py-1">
                                            {event.participants.map((participant: any, index: number) => (
                                                <div 
                                                    key={participant.userId || index} 
                                                    className="participant-item flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm"
                                                    role="listitem"
                                                    aria-label={`Participant ${index + 1}`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <div className="participant-number w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-sm">
                                                            {index + 1}
                                                        </div>
                                                        <span className="participant-name text-xs font-medium text-gray-900 truncate">
                                                            Participant {index + 1}
                                                        </span>
                                                    </div>
                                                    <div className="participant-status">
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Inscrit
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="empty-state flex items-center justify-center min-h-[100px] max-h-[150px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                        <div className="text-center">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 text-xs font-medium">Aucun participant</p>
                                            <p className="text-gray-400 text-xs mt-1">En attente d'inscriptions</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tournament Bracket - Pleine largeur */}
                    {registrationClosed && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">Tournament Bracket</h2>
                                    {isOwner && !bracketExists && event.participants?.length >= 2 && (
                                        <button
                                            onClick={generateBracket}
                                            disabled={bracketLoading}
                                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {bracketLoading ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Génération...
                                                </div>
                                            ) : (
                                                'Générer le Bracket'
                                            )}
                                        </button>
                                    )}
                                </div>
                                {isOwner && !bracketExists && event.participants?.length < 2 && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Il faut au moins 2 participants pour générer un bracket
                                    </p>
                                )}
                            </div>
                            {bracketExists ? (
                                <div className="p-0 h-screen">
                                    <BracketFlow 
                                        eventId={event.id} 
                                        isOwner={isOwner || false}
                                        currentUserId={user?.id || ""}
                                    />
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    {isOwner ? (
                                        event.participants?.length >= 2 ? 
                                            "Cliquez sur 'Générer le Bracket' pour créer le tournoi" :
                                            "En attente de participants (minimum 2)"
                                    ) : (
                                        "Le bracket sera disponible une fois généré par l'organisateur"
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            {ConfirmDialogComponent}
        </>
    );
};

export default EventDetailPage;