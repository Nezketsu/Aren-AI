"use client";
import React, { useState } from "react";
import { NavBar } from "@/components/navbar";
import { useUser } from "@/app/account/useUser";
import { useRouter } from "next/navigation";

const CreateEventPage: React.FC = () => {
  const { user, loading, authenticated } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    applyStart: "",
    applyEnd: "",
    maxParticipants: 10,
    prize: "",
    sport: "",
    mode: "",
    rules: "",
    requirements: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !authenticated) {
      router.push("/login");
    }
  }, [loading, authenticated, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          maxParticipants: parseInt(formData.maxParticipants.toString()),
          ownerId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      // Redirect to the created event
      router.push(`/events/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-solid-cream pt-16 flex items-center justify-center">
          <div className="text-gray-600">Chargement...</div>
        </div>
      </>
    );
  }

  if (!authenticated) {
    return null; // Will redirect to login
  }

  return (
    <>
      <NavBar />
  <main className="min-h-screen bg-solid-cream pt-16 text-gray-600 create-event-page">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-200/15 rounded-full blur-xl transform -translate-x-8 translate-y-8"></div>
            
            <div className="mb-8 relative">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Tournoi de Pétanque</span></h1>
              <p className="text-gray-700">Configurez votre tournoi avec tous les détails nécessaires pour les participants.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du Tournoi *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-600 transition-colors"
                    placeholder="Ex: Tournoi des Boules d'Or"
                  />
                </div>

                <div>
                  <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                    Type de Jeu
                  </label>
                  <input
                    type="text"
                    id="sport"
                    name="sport"
                    value={formData.sport}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Pétanque Triplettes, Doublettes, Tête-à-tête"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez votre tournoi, les règles spécifiques et ce que les participants doivent savoir"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Boulodrome, Parc Municipal, Place du Village..."
                  />
                </div>

                <div>
                  <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Maximum d'Équipes *
                  </label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    min="2"
                    max="20"
                    required
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {(user?.tokenBalance ?? 0) > 0 
                      ? "Jusqu'à 20 équipes autorisées avec vos jetons"
                      : "Jusqu'à 10 équipes pour les tournois gratuits"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="applyStart" className="block text-sm font-medium text-gray-700 mb-2">
                    Ouverture des Inscriptions *
                  </label>
                  <input
                    type="datetime-local"
                    id="applyStart"
                    name="applyStart"
                    required
                    value={formData.applyStart}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="applyEnd" className="block text-sm font-medium text-gray-700 mb-2">
                    Fermeture des Inscriptions *
                  </label>
                  <input
                    type="datetime-local"
                    id="applyEnd"
                    name="applyEnd"
                    required
                    value={formData.applyEnd}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Début du Tournoi
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fin du Tournoi
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="prize" className="block text-sm font-medium text-gray-700 mb-2">
                  Récompenses/Prix
                </label>
                <input
                  type="text"
                  id="prize"
                  name="prize"
                  value={formData.prize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 500€, Trophée, Jeu de boules, Repas d'après tournoi"
                />
              </div>

              <div>
                <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-2">
                  Règlement du Tournoi
                </label>
                <textarea
                  id="rules"
                  name="rules"
                  rows={3}
                  value={formData.rules}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Règles spécifiques : FIPJP, temps de jeu, nombre de mènes, etc."
                />
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Conditions de Participation
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Licence FFPJP requise, jeu de boules personnel, niveau minimum..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? "Création du Tournoi..." : "Créer le Tournoi"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-orange-300 text-orange-700 rounded-lg font-medium hover:bg-orange-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default CreateEventPage;