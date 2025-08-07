"use client"
import React, { useEffect, useState } from "react";
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
      <main className="event-page min-h-screen bg-gradient-blue px-4 flex items-center justify-center pt-32">
        <div className="flex flex-col items-center w-full">
          <header className="mb-10 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-blue-700 mb-2 drop-shadow-sm">TournaMind Event Dashboard</h1>
            <p className="text-lg md:text-xl text-blue-500 font-medium">AI-Powered Tournament OS for Real-World Events</p>
          </header>

          <section className="w-full bg-white/80 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Current Events</h2>
            {loading ? (
              <div className="text-blue-500">Loading events...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : events.length === 0 ? (
              <div className="text-blue-400">No events found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
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
                      className="feature-card p-5 bg-gray-50 border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-all flex flex-col gap-4 relative items-center min-h-[200px] w-full cursor-pointer"
                      style={{ minWidth: 0 }}
                      onClick={e => {
                        // Prevent navigation if clicking on a button inside the card
                        if ((e.target as HTMLElement).tagName === 'BUTTON') return;
                        window.location.href = `/events/${event.id}`;
                      }}
                    >
                      <div className="feature-icon bg-blue-500/80 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4m8-16v2a4 4 0 01-4 4H6a4 4 0 01-4-4V5m16 0V3a1 1 0 00-1-1H5a1 1 0 00-1 1v2m16 0a2 2 0 01-2 2m2-2a2 2 0 00-2-2" /></svg>
                      </div>
                      <div className="flex items-center gap-2 w-full justify-center">
                        <div className="font-bold text-blue-700 text-2xl text-center flex-1">{event.name}</div>
                      </div>
                      {event.description && (
                        <div className="text-blue-600 text-lg text-center mb-1 w-full">{event.description}</div>
                      )}
                      <div className="text-sm text-blue-500 text-center w-full">
                        Registration: {new Date(event.applyStart).toLocaleString()}<br/>-<br/>{new Date(event.applyEnd).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-2 text-center w-full">Created: {new Date(event.createdAt).toLocaleString()}</div>
                      {/* Apply button logic restored */}
                      {(!registrationOpen || maxReached) ? (
                        <div className="mt-4 px-6 py-2 rounded-lg bg-gray-300 text-gray-500 font-semibold text-base cursor-not-allowed select-none">
                          Registration closed
                        </div>
                      ) : (
                        <>
                          <button
                            className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-base"
                            onClick={e => {
                              e.stopPropagation();
                              handleApply(event.id);
                            }}
                            disabled={Boolean(applyLoading === event.id || appliedEventIds.has(event.id) || alreadyParticipant)}
                          >
                            {alreadyParticipant
                              ? "Applied"
                              : appliedEventIds.has(event.id)
                              ? "Applied"
                              : applyLoading === event.id
                              ? "Applying..."
                              : "Apply"}
                          </button>
                          {isOwner && (
                            <button
                              className="mt-2 px-4 py-1 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                              onClick={async e => {
                                e.stopPropagation();
                                setCloseLoading(event.id);
                                try {
                                  const res = await fetch(`/api/events/${event.id}/close-apply`, { method: 'POST' });
                                  if (!res.ok) throw new Error('Failed to close registration');
                                  // Refetch events to update UI
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
                              {closeLoading === event.id ? 'Closing...' : 'Close Registration'}
                            </button>
                          )}
                          {applyError && applyLoading === null && !appliedEventIds.has(event.id) && !alreadyParticipant && (
                            <div className="text-red-500 text-xs mt-1">{applyError}</div>
                          )}
                        </>
                      )}
                      <div className="mt-2 px-6 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold text-base select-none text-center">View Details</div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <footer className="text-center text-sm text-blue-500 py-4">
            <small className="block">
              Accessible on low-end devices &middot; Works offline &middot; Community-first
            </small>
          </footer>
        </div>
      </main>
    </>
  );
};

export default EventPage;