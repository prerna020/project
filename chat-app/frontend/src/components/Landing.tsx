import { useState, useEffect } from "react";

interface LandingProps {
  onJoin: (
    roomId: string,
    username: string,
    accent: string,
    avatarGradient: string,
    avatarIcon: string
  ) => void;
}


const Landing = ({ onJoin }: LandingProps) => {
  const [user, setUser] = useState("");
  const [roomId, setRoomId] = useState("");
  
  const [selectedTheme, setSelectedTheme] = useState("indigo");
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0].css);
  const [selectedEmblem, setSelectedEmblem] = useState("⚡");

  const [particles, setParticles] = useState<{ x: number; y: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 15 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
    }));
    setParticles(generated);
  }, []);

  // Sync selected theme to document variables
  useEffect(() => {
    const themeObj = THEMES.find((t) => t.id === selectedTheme) || THEMES[0];
    document.documentElement.style.setProperty("--accent", themeObj.rgb);
    document.documentElement.style.setProperty("--accent-glow", themeObj.glow);
  }, [selectedTheme]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() && user.trim()) {
      onJoin(roomId.trim(), user.trim(), selectedTheme, selectedGradient, selectedEmblem);
    }
  };

  const currentThemeObj = THEMES.find((t) => t.id === selectedTheme) || THEMES[0];

  return (
    <div className="relative w-screen h-screen bg-[#030308] text-white flex items-center justify-center overflow-hidden font-sans select-none">
      
      {/* Background Aurora Blobs */}
      <div className={`absolute w-[500px] h-[500px] rounded-full blur-[130px] opacity-25 -top-40 -left-40 animate-aurora-1 transition-colors duration-1000 ${currentThemeObj.bgBlob}`} />
      <div className={`absolute w-[500px] h-[500px] rounded-full blur-[130px] opacity-20 -bottom-40 -right-40 animate-aurora-2 transition-colors duration-1000 ${currentThemeObj.bgBlob}`} />

      {/* Floating Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-white opacity-[0.15]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `float ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Landing Container */}
      <div className="relative z-10 w-[90%] max-w-4xl grid grid-cols-1 md:grid-cols-2 glass-panel rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 animate-entry">
        
        {/* Left Side: Dynamic Portal Info & Logo */}
        <div className="p-8 md:p-12 flex flex-col justify-between bg-white/[0.01] border-b md:border-b-0 md:border-r border-white/5">
          <div className="flex items-center gap-3">
            {/* Glowing Custom SVG Logo */}
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-tr from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/30">
              <svg className="w-6 h-6 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-wider font-title bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60">
              NEXUS CHAT
            </span>
          </div>

          <div className="my-8 md:my-0 space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight font-title">
              Step Into The <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500" style={{ textShadow: `0 0 40px rgba(${currentThemeObj.rgb}, 0.2)` }}>
                Ambient Space
              </span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Create an encrypted room code or join an existing node space. Experience real-time communication backed by glassmorphic aesthetic chimes and fluid UI motion.
            </p>
          </div>

          {/* Quick theme accent switcher */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              Interface Sync Accent
            </span>
            <div className="flex gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  title={theme.name}
                  className={`relative w-8 h-8 rounded-full border cursor-pointer transition-all duration-300 ${
                    selectedTheme === theme.id
                      ? "scale-110 border-white"
                      : "border-white/10 opacity-60 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: `rgb(${theme.rgb})`,
                    boxShadow: selectedTheme === theme.id ? `0 0 15px rgb(${theme.rgb})` : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Identity & Room Onboarding Config */}
        <form onSubmit={handleJoin} className="p-8 md:p-12 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <h2 className="text-xl font-semibold font-title">Assemble Profile</h2>

            {/* Live Interactive Avatar Preview Customizer */}
            <div className="flex items-center gap-5 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div
                className="relative w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all duration-500 border border-white/10 shrink-0 select-none animate-float"
                style={{ background: selectedGradient }}
              >
                {selectedEmblem}
                <span className="absolute -bottom-1 -right-1 bg-zinc-900/90 text-white rounded-full border border-white/10 text-[10px] w-6 h-6 flex items-center justify-center font-bold">
                  {user.trim() ? user.trim().slice(0, 2).toUpperCase() : "?"}
                </span>
              </div>
              <div className="space-y-2 w-full overflow-hidden">
                <span className="text-xs text-zinc-500 block">Avatar Customization</span>
                {/* Gradients selector */}
                <div className="flex gap-2">
                  {GRADIENTS.map((g) => (
                    <button
                      type="button"
                      key={g.id}
                      onClick={() => setSelectedGradient(g.css)}
                      className={`w-5 h-5 rounded-full cursor-pointer transition-all border ${
                        selectedGradient === g.css ? "border-white scale-110" : "border-white/10 hover:scale-105"
                      }`}
                      style={{ background: g.css }}
                    />
                  ))}
                </div>
                {/* Emblems selector */}
                <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                  {EMBLEMS.map((e) => (
                    <button
                      type="button"
                      key={e}
                      onClick={() => setSelectedEmblem(e)}
                      className={`text-sm p-1 rounded hover:bg-white/10 cursor-pointer transition-all ${
                        selectedEmblem === e ? "bg-white/15 scale-110" : "opacity-60"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inputs Panel */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-2">
                  Handle Name
                </label>
                <input
                  type="text"
                  required
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="Enter alias"
                  maxLength={16}
                  className="w-full p-3.5 rounded-xl text-sm glass-input font-medium"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-2">
                  Room Key Code
                </label>
                <input
                  type="text"
                  required
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. general, matrix-99"
                  maxLength={20}
                  className="w-full p-3.5 rounded-xl text-sm glass-input font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl cursor-pointer font-bold tracking-wider text-black transition-all duration-300 font-title hover:shadow-lg active:scale-95 shrink-0"
            style={{
              backgroundColor: `rgb(${currentThemeObj.rgb})`,
              boxShadow: `0 8px 30px rgba(${currentThemeObj.rgb}, 0.25)`,
            }}
          >
            JOIN NEURAL SPACE
          </button>
        </form>

      </div>
    </div>
  );
};

export default Landing;