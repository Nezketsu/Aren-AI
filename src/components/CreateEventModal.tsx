"use client"

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/app/account/useUser";


export function CreateEventModal(props: { onEventCreated?: () => void }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    applyStart: "",
    applyEnd: "",
    tags: "",
    maxParticipants: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "maxParticipants" ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!user?.id) {
        throw new Error("User not authenticated. Please log in.");
      }
      // Convert tags to array, trim whitespace, remove empty
      const tagsArray = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      // Token logic: restrict maxParticipants
      const tokenBalance = user?.tokenBalance ?? 0;
      const maxAllowed = 20; // TODO: Replace with user-based logic
      if (form.maxParticipants > maxAllowed) {
        throw new Error(tokenBalance > 0
          ? "You can only create events with up to 100 participants per token."
          : "You need a token to create events with more than 10 participants.");
      }
      // Ensure applyStart/applyEnd are ISO strings
      const payload = {
        name: form.name,
        description: form.description,
        applyStart: form.applyStart ? new Date(form.applyStart).toISOString() : null,
        applyEnd: form.applyEnd ? new Date(form.applyEnd).toISOString() : null,
        tags: tagsArray,
        ownerId: user.id,
        maxParticipants: form.maxParticipants,
      };
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create event");
      }
      setOpen(false);
      setForm({ name: "", description: "", applyStart: "", applyEnd: "", tags: "", maxParticipants: 10 });
      if (props.onEventCreated) props.onEventCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button className="bg-white/20 border border-white/40 text-white w-full md:w-auto" onClick={() => setOpen(true)}>
        Create Event
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} className="fixed z-[200] inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" aria-hidden="true" onClick={() => setOpen(false)} />
        <div className="relative z-10 w-full max-w-md mx-auto">
          <Dialog.Panel className="rounded-3xl shadow-2xl border border-white/40 bg-gradient-to-br from-white/80 to-blue-100/80 backdrop-blur-2xl p-8 pt-10 flex flex-col items-center glassmorphic-modal relative animate-fadeIn">
            <button
              type="button"
              className="absolute top-4 right-4 text-blue-900 hover:text-blue-600 focus:outline-none text-2xl font-bold"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-blue-900 mb-4 mt-2">Create a new event</h2>
            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
              <input
                name="name"
                placeholder="Event name"
                value={form.name}
                onChange={handleChange}
                required
                className="border border-blue-200 rounded-lg p-2 text-gray-600 bg-white/90 focus:ring-2 focus:ring-blue-400 outline-none transition"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="border border-blue-200 rounded-lg p-2 text-gray-600 bg-white/90 focus:ring-2 focus:ring-blue-400 outline-none transition min-h-[80px]"
              />
              <div className="flex gap-2">
                <div className="flex flex-col w-1/2">
                  <input
                    name="applyStart"
                    type="datetime-local"
                    value={form.applyStart}
                    onChange={handleChange}
                    required
                    className="border border-blue-200 rounded-lg p-2 text-gray-600 bg-white/90 focus:ring-2 focus:ring-blue-400 outline-none transition"
                    placeholder="Apply start"
                  />
                  <span className="text-xs text-gray-500 mt-1">When registration opens</span>
                </div>
                <div className="flex flex-col w-1/2">
                  <input
                    name="applyEnd"
                    type="datetime-local"
                    value={form.applyEnd}
                    onChange={handleChange}
                    required
                    className="border border-blue-200 rounded-lg p-2 text-gray-600 bg-white/90 focus:ring-2 focus:ring-blue-400 outline-none transition"
                    placeholder="Apply end"
                  />
                  <span className="text-xs text-gray-500 mt-1">When registration closes</span>
                </div>
              </div>
              <input
                name="tags"
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={handleChange}
                className="border border-blue-200 rounded-lg p-2 text-gray-600 bg-white/90 focus:ring-2 focus:ring-blue-400 outline-none transition"
              />
              <div className="flex flex-col">
                <input
                  name="maxParticipants"
                  type="number"
                  min={1}
                  max={user?.tokenBalance > 0 ? 100 : 10}
                  value={form.maxParticipants}
                  onChange={handleChange}
                  required
                  className="border border-blue-200 rounded-lg p-2 text-gray-600 bg-white/90 focus:ring-2 focus:ring-blue-400 outline-none transition"
                  placeholder="Max participants"
                />
                <span className="text-xs text-gray-500 mt-1">
                  {user?.tokenBalance > 0
                    ? "You can create events for up to 100 participants per token."
                    : "You can create events for up to 10 participants. Get a token for more."}
                </span>
              </div>
              {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
              <div className="flex gap-2 mt-4">
                <div className="flex flex-col gap-2 w-full">
                  <Button type="submit" disabled={loading} className="bg-blue-600 text-white w-full rounded-lg shadow-md hover:bg-blue-700 transition">
                    {loading ? "Creating..." : "Create Event"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full rounded-lg" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
