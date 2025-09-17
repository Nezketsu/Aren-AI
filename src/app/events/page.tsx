"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { NavBar } from "@/components/navbar";
import { useUser } from "@/app/account/useUser";

type Event = {
  id: string;
  name: string;
  description?: string;
  applyStart: string;
  applyEnd: string;
  ownerId: string;
  createdAt: string;
  participants: { userId: string }[];
  maxParticipants?: number;
};

const EventPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Poll for new events every 10 seconds
  useEffect(() => {
    let firstLoad = true;
    const fetchEvents = async () => {
      try {
        setError(null);
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error("Failed to fetch events");
        const json = await res.json();
        const data = Array.isArray(json) ? json : [];
        // On first load, just set events
        if (firstLoad) {
          setEvents(data);
          setLoading(false);
          firstLoad = false;
        } else {
          // Simply update events without new event tracking
          setEvents(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  // Apply logic
  const [applyLoading, setApplyLoading] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [appliedEventIds, setAppliedEventIds] = useState<Set<string>>(new Set());
  const { user } = useUser();
  const [closeLoading, setCloseLoading] = useState<string | null>(null);

  const handleApply = async (eventId: string) => {
    setApplyLoading(eventId);
    setApplyError(null);
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to apply");
      }
      setAppliedEventIds(prev => new Set([...prev, eventId]));
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Failed to apply");
    } finally {
      setApplyLoading(null);
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-solid-cream pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tournois de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Pétanque</span></h1>
            <p className="text-lg text-gray-700 mb-6">Trouvez et rejoignez les prochains tournois de pétanque</p>
            
            {user && (
              <div className="flex justify-center">
                <Link
                  href="/events/create"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer un Tournoi
                </Link>
              </div>
            )}
          </header>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100">
            {loading ? (
              <div className="p-8 text-center text-gray-600">Chargement des tournois...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : events.length === 0 ? (
              <div className="p-8 text-center text-gray-600">Aucun tournoi trouvé.</div>
            ) : (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tournois Disponibles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => {
                  const now = new Date();
                  const applyStart = new Date(event.applyStart);
                  const applyEnd = new Date(event.applyEnd);
                  const registrationOpen = now >= applyStart && now <= applyEnd;
                  const isOwner = user && user.id === event.ownerId;
                  const alreadyParticipant = user && event.participants.some(p => p.userId === user.id);
                  const maxReached = typeof event.maxParticipants === 'number' ? event.participants.length >= event.maxParticipants : false;
                  return (
                    <div
                      key={event.id}
                      className="bg-white/70 backdrop-blur-sm border border-orange-100 rounded-2xl p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300 cursor-pointer hover:transform hover:-translate-y-1"
                      onClick={e => {
                        if ((e.target as HTMLElement).tagName === 'BUTTON') return;
                        window.location.href = `/events/${event.id}`;
                      }}
                    >
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-600 mb-4">{event.description}</p>
                      )}
                      
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div>Inscription: {new Date(event.applyStart).toLocaleDateString()} - {new Date(event.applyEnd).toLocaleDateString()}</div>
                        <div>Participants: {event.participants.length}{event.maxParticipants ? `/${event.maxParticipants}` : ''}</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {(!registrationOpen || maxReached) ? (
                          <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-500 font-medium text-center">
                            Inscriptions Fermées
                          </div>
                        ) : (
                          <>
                            <button
                              className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={e => {
                                e.stopPropagation();
                                handleApply(event.id);
                              }}
                              disabled={Boolean(applyLoading === event.id || appliedEventIds.has(event.id) || alreadyParticipant)}
                            >
                              {alreadyParticipant
                                ? "Inscrit"
                                : appliedEventIds.has(event.id)
                                ? "Inscrit"
                                : applyLoading === event.id
                                ? "Inscription..."
                                : "S'inscrire"}
                            </button>
                            {isOwner && (
                              <button
                                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                                onClick={async e => {
                                  e.stopPropagation();
                                  setCloseLoading(event.id);
                                  try {
                                    const res = await fetch(`/api/events/${event.id}/close-apply`, { method: 'POST' });
                                    if (!res.ok) throw new Error('Failed to close registration');
                                    const updated = await res.json();
                                    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, applyEnd: updated.applyEnd } : e));
                                  } catch {
                                    alert('Failed to close registration');
                                  } finally {
                                    setCloseLoading(null);
                                  }
                                }}
                                disabled={closeLoading === event.id}
                              >
                                {closeLoading === event.id ? 'Fermeture...' : 'Fermer Inscriptions'}
                              </button>
                            )}
                          </>
                        )}
                        <Link
                          href={`/events/${event.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-2 rounded-lg border border-orange-500 text-orange-600 font-medium hover:bg-orange-50 transition-colors text-center"
                          aria-label={`Voir les détails de ${event.name}`}
                        >
                          Voir Détails
                        </Link>
                        {applyError && applyLoading === null && !appliedEventIds.has(event.id) && !alreadyParticipant && (
                          <div className="text-red-500 text-sm mt-2">{applyError}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
};

export default EventPage;