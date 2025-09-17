"use client"
import React, { useEffect, useState } from "react";
import { useUser } from "@/app/account/useUser";
import { NavBar } from "@/components/navbar";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast, toastHelpers } from "@/components/ui/toast";

export default function MyEventsPage() {
  const { user, loading: userLoading } = useUser();
  const [createdEvents, setCreatedEvents] = useState<any[]>([]);
  const [participatedEvents, setParticipatedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventBrackets, setEventBrackets] = useState<{[key: string]: boolean}>({});
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const toast = useToast();

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/events?ownerId=${user.id}`).then(res => res.json()),
      fetch(`/api/participants?userId=${user.id}`).then(res => res.json()),
    ])
      .then(async ([created, participated]) => {
        const createdEventsArray = Array.isArray(created) ? created : [];
        setCreatedEvents(createdEventsArray);
        // Remove duplicates: don't show events the user created in both lists
        setParticipatedEvents(Array.isArray(participated) ? participated.filter((e: { ownerId: string }) => e.ownerId !== user.id) : []);
        
        // Check bracket status for each created event
        const bracketStatuses: {[key: string]: boolean} = {};
        for (const event of createdEventsArray) {
          try {
            const bracketRes = await fetch(`/api/events/${event.id}/bracket`);
            const bracketData = await bracketRes.json();
            bracketStatuses[event.id] = !!(bracketData.bracket && bracketData.bracket.length > 0);
          } catch (error) {
            console.warn(`Failed to check bracket for event ${event.id}:`, error);
            bracketStatuses[event.id] = false;
          }
        }
        setEventBrackets(bracketStatuses);
      })
      .catch(err => setError(err.message || "Failed to fetch events"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const [showCreated, setShowCreated] = useState(true);
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-solid-cream px-4 flex items-center justify-center pt-32">
        <div className="flex flex-col items-center w-full max-w-xl">
          <h1 className="text-2xl font-bold text-orange-700 mb-6">Mes <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Tournois</span></h1>
          <div className="flex gap-4 mb-8">
            <button
              className={`px-4 py-2 rounded-lg font-semibold shadow transition border-2 ${showCreated ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-orange-700 border-orange-300 hover:bg-orange-50'}`}
              onClick={() => setShowCreated(true)}
            >
              Mes Tournois Créés
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold shadow transition border-2 ${!showCreated ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-orange-700 border-orange-300 hover:bg-orange-50'}`}
              onClick={() => setShowCreated(false)}
            >
              Mes Participations
            </button>
          </div>
          {userLoading || loading ? (
            <div className="text-blue-500">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : showCreated ? (
            <>
              {createdEvents.length === 0 ? (
                <div className="text-blue-400 mb-6">Vous n'avez pas encore créé d'événements.</div>
              ) : (
                <div className="flex flex-col gap-6 w-full mb-8">
                  {createdEvents.map(event => {
                    const applyClosed = new Date(event.applyEnd) < new Date();
                    const hasBracket = eventBrackets[event.id] || false;
                    const canDelete = !applyClosed && !hasBracket; // Can delete only during registration and no bracket exists
                    
                    return (
                      <div key={event.id} className="bg-white/80 rounded-xl shadow-lg px-6 py-8 flex flex-col gap-2">
                        <div className="font-bold text-blue-700 text-lg">{event.name}</div>
                        {event.description && <div className="text-blue-600 text-base mb-1">{event.description}</div>}
                        <div className="text-xs text-blue-500">
                          Inscriptions : {new Date(event.applyStart).toLocaleString()} - {new Date(event.applyEnd).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Créé le : {new Date(event.createdAt).toLocaleString()}</div>
                        
                        {hasBracket && (
                          <div className="text-xs text-green-600 mt-1 font-medium">
                            🏆 Bracket du tournoi créé
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-2 self-end">
                          {!applyClosed && !hasBracket && (
                            <button
                              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
                              onClick={async () => {
                                const res = await fetch(`/api/events/${event.id}/close-apply`, { method: 'POST' });
                                if (res.ok) {
                                  setCreatedEvents(evts => evts.map(e => e.id === event.id ? { ...e, applyEnd: new Date().toISOString() } : e));
                                } else {
                                  toast.error('Erreur', 'Impossible de fermer les inscriptions');
                                }
                              }}
                            >
                              Fermer Inscriptions
                            </button>
                          )}
                          
                          {canDelete && (
                            <button
                              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
                              onClick={async () => {
                                const confirmed = await confirm({
                                  title: 'Supprimer l\'événement',
                                  message: `Êtes-vous sûr de vouloir supprimer l&apos;événement "${event.name}" ? Cette action ne peut pas être annulée et supprimera tous les participants et résultats.`,
                                  type: 'danger',
                                  confirmText: 'Supprimer',
                                  cancelText: 'Annuler'
                                });
                                
                                if (!confirmed) return;
                                
                                try {
                                  const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
                                  if (res.ok) {
                                    setCreatedEvents(evts => evts.filter(e => e.id !== event.id));
                                    toastHelpers.eventDeleted(toast, event.name);
                                  } else {
                                    const errorData = await res.json().catch(() => ({}));
                                    console.error('Delete error:', errorData);
                                    toastHelpers.deleteError(toast, errorData.error || 'Erreur inconnue');
                                  }
                                } catch (error) {
                                  console.error('Delete request failed:', error);
                                  toastHelpers.networkError(toast);
                                }
                              }}
                            >
                              Supprimer Événement
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {participatedEvents.length === 0 ? (
                <div className="text-blue-400">Vous ne participez à aucun événement.</div>
              ) : (
                <div className="flex flex-col gap-6 w-full">
                  {participatedEvents.map(event => (
                    <div key={event.id} className="bg-white/80 rounded-xl shadow-lg px-6 py-8 flex flex-col gap-2">
                      <div className="font-bold text-blue-700 text-lg">{event.name}</div>
                      {event.description && <div className="text-blue-600 text-base mb-1">{event.description}</div>}
                      <div className="text-xs text-blue-500">
                        Inscriptions : {new Date(event.applyStart).toLocaleString()} - {new Date(event.applyEnd).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Créé le : {new Date(event.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      {ConfirmDialogComponent}
    </>
  );
}
