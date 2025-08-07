"use client"
import React, { useEffect, useState } from "react";
import { useUser } from "@/app/account/useUser";
import { NavBar } from "@/components/navbar";

export default function MyEventsPage() {
  const { user, loading: userLoading } = useUser();
  const [createdEvents, setCreatedEvents] = useState<any[]>([]);
  const [participatedEvents, setParticipatedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/events?ownerId=${user.id}`).then(res => res.json()),
      fetch(`/api/participants?userId=${user.id}`).then(res => res.json()),
    ])
      .then(([created, participated]) => {
        setCreatedEvents(Array.isArray(created) ? created : []);
        // Remove duplicates: don't show events the user created in both lists
        setParticipatedEvents(Array.isArray(participated) ? participated.filter((e: any) => e.ownerId !== user.id) : []);
      })
      .catch(err => setError(err.message || "Failed to fetch events"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const [showCreated, setShowCreated] = useState(true);
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gradient-blue px-4 flex items-center justify-center pt-32">
        <div className="flex flex-col items-center w-full max-w-xl">
          <h1 className="text-2xl font-bold text-blue-700 mb-6">My Events</h1>
          <div className="flex gap-4 mb-8">
            <button
              className={`px-4 py-2 rounded-lg font-semibold shadow transition border-2 ${showCreated ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
              onClick={() => setShowCreated(true)}
            >
              Events I Created
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold shadow transition border-2 ${!showCreated ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
              onClick={() => setShowCreated(false)}
            >
              Events I Participate In
            </button>
          </div>
          {userLoading || loading ? (
            <div className="text-blue-500">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : showCreated ? (
            <>
              {createdEvents.length === 0 ? (
                <div className="text-blue-400 mb-6">You haven't created any events yet.</div>
              ) : (
                <div className="flex flex-col gap-6 w-full mb-8">
                  {createdEvents.map(event => {
                    const applyClosed = new Date(event.applyEnd) < new Date();
                    return (
                      <div key={event.id} className="bg-white/80 rounded-xl shadow-lg px-6 py-8 flex flex-col gap-2">
                        <div className="font-bold text-blue-700 text-lg">{event.name}</div>
                        {event.description && <div className="text-blue-600 text-base mb-1">{event.description}</div>}
                        <div className="text-xs text-blue-500">
                          Registration: {new Date(event.applyStart).toLocaleString()} - {new Date(event.applyEnd).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Created: {new Date(event.createdAt).toLocaleString()}</div>
                        <button
                          className="mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed w-fit self-end"
                          disabled={applyClosed}
                          onClick={async () => {
                            const res = await fetch(`/api/events/${event.id}/close-apply`, { method: 'POST' });
                            if (res.ok) {
                              setCreatedEvents(evts => evts.map(e => e.id === event.id ? { ...e, applyEnd: new Date().toISOString() } : e));
                            } else {
                              alert('Failed to close apply phase');
                            }
                          }}
                        >
                          Close Apply
                        </button>
                         {applyClosed && (
                           <button
                             className="mt-2 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition w-fit self-end"
                             onClick={async () => {
                               if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
                               const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
                               if (res.ok) {
                                 setCreatedEvents(evts => evts.filter(e => e.id !== event.id));
                               } else {
                                 alert('Failed to delete event');
                               }
                             }}
                           >
                             Delete Event
                           </button>
                         )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {participatedEvents.length === 0 ? (
                <div className="text-blue-400">You are not a participant in any events.</div>
              ) : (
                <div className="flex flex-col gap-6 w-full">
                  {participatedEvents.map(event => (
                    <div key={event.id} className="bg-white/80 rounded-xl shadow-lg px-6 py-8 flex flex-col gap-2">
                      <div className="font-bold text-blue-700 text-lg">{event.name}</div>
                      {event.description && <div className="text-blue-600 text-base mb-1">{event.description}</div>}
                      <div className="text-xs text-blue-500">
                        Registration: {new Date(event.applyStart).toLocaleString()} - {new Date(event.applyEnd).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Created: {new Date(event.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
