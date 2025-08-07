'use client'

export default function TestFonts() {
  return (
    <div className="min-h-screen p-8 bg-gradient-blue">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white mb-8">Test des Polices TournaMind</h1>
        
        <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 border border-white/30">
          <h2 className="text-2xl font-bold text-white mb-4">Police par défaut (Geist Sans)</h2>
          <p className="text-white text-lg">
            Cette phrase utilise la police par défaut du système. 
            Elle devrait apparaître avec Geist Sans si tout fonctionne correctement.
          </p>
          <p className="text-white/80 text-sm mt-2">
            Font-family: var(--font-geist-sans)
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 border border-white/30">
          <h2 className="text-2xl font-bold text-white mb-4 font-rubik">Police Rubik</h2>
          <p className="text-white text-lg font-rubik">
            Cette phrase utilise la police Rubik personnalisée. 
            Elle devrait avoir un style différent et plus arrondi.
          </p>
          <p className="text-white/80 text-sm mt-2">
            Font-family: var(--font-rubik)
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 border border-white/30">
          <h2 className="text-2xl font-bold text-white mb-4 font-mono">Police Mono (Geist Mono)</h2>
          <p className="text-white text-lg font-mono">
            Cette phrase utilise la police monospace Geist Mono.
            Elle devrait avoir une largeur fixe pour chaque caractère.
          </p>
          <p className="text-white/80 text-sm mt-2">
            Font-family: var(--font-geist-mono)
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 border border-white/30">
          <h2 className="text-2xl font-bold text-white mb-4">Debug Info</h2>
          <div className="text-white text-sm space-y-2">
            <div>Tailwind: v3.4.17</div>
            <div>Next.js: 15.3.5</div>
            <div>PostCSS: Configuré avec autoprefixer</div>
          </div>
        </div>
      </div>
    </div>
  )
}
