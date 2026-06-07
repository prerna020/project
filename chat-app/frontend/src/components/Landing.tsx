import { useState } from "react";

interface LandingProps {
  onJoin: (
    roomId: string,
    username: string,
    accent: string,
    avatarGradient: string,
    avatarIcon: string
  ) => void;
}

// Flat, professional avatar backgrounds (earthy, neutral, slate)
const AVATAR_COLORS = [
  { id: "emerald", css: "#10b981" },
  { id: "teal", css: "#0d9488" },
  { id: "indigo", css: "#4f46e5" },
  { id: "sand", css: "#b45309" },
  { id: "charcoal", css: "#3f3f46" },
];

const EMBLEMS = ["👤", "⚡", "☕", "💻", "✨", "🪐", "🔥", "🛠️", "⚙️", "🔒"];

const Landing = ({ onJoin }: LandingProps) => {
  const [user, setUser] = useState("");
  const [roomId, setRoomId] = useState("");

  // Customization choices
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0].css);
  const [selectedEmblem, setSelectedEmblem] = useState("👤");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() && user.trim()) {
      onJoin(roomId.trim(), user.trim(), "emerald", selectedColor, selectedEmblem);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#07080a] text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">

      {/* Centered clean card */}
      <div className="w-full max-w-md bg-[#2C3947] border border-[#181c24] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden animate-fade">

        {/* Card Header */}
        <div className="p-6 border-b border-[#181c24] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-grey-500 flex items-center justify-center text-xs text-black font-bold font-mono-custom">
              💬
            </div>
            <span className="text-sm font-semibold tracking-wider font-mono-custom text-zinc-300">
              NEXUS Chat
            </span>
          </div>
          <span className="text-[10px] font-mono-custom text-zinc-500 uppercase tracking-widest">
            v1.2.0
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleJoin} className="p-6 space-y-6">

          {/* Section: Profile Assembly */}
          <div className="space-y-4">
            <span className="text-[15px] font-mono-custom text-zinc-300 uppercase tracking-wider block">
              PROFILE CONFIG
            </span>

            {/* Avatar Previewer */}
            <div className="flex items-center gap-4 bg-[#0d0f13] p-4 rounded-lg border border-[#181c24]">
              {/* Circle Avatar */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl shadow border border-white/5 shrink-0 text-white font-sans"
                style={{ backgroundColor: selectedColor }}
              >
                {selectedEmblem}
              </div>
              <div className="space-y-2 w-full overflow-hidden">
                <span className="text-[10px] font-mono-custom text-white-500 block">AVATAR PRESET</span>

                {/* Background choices */}
                <div className="flex gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color.id}
                      onClick={() => setSelectedColor(color.css)}
                      className={`w-4 h-4 rounded-full cursor-pointer border transition-transform ${selectedColor === color.css ? "border-white scale-110" : "border-transparent hover:scale-105"
                        }`}
                      style={{ backgroundColor: color.css }}
                    />
                  ))}
                </div>

                {/* Emblem choices */}
                <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
                  {EMBLEMS.map((e) => (
                    <button
                      type="button"
                      key={e}
                      onClick={() => setSelectedEmblem(e)}
                      className={`p-0.5 rounded hover:bg-zinc-800 cursor-pointer ${selectedEmblem === e ? "bg-zinc-800" : "opacity-50"
                        }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Credentials */}
          <div className="space-y-4">
            <span className="text-[15px] font-mono-custom text-zinc-300 uppercase tracking-wider block">
              CONNECTION PATH
            </span>

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-mono-custom text-zinc-400 block mb-1.5 uppercase">
                  User Handle
                </label>
                <input
                  type="text"
                  required
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="Enter your username"
                  maxLength={16}
                  className="w-full p-2.5 rounded text-sm glass-input font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono-custom text-zinc-400 block mb-1.5 uppercase">
                  Node Room Key
                </label>
                <input
                  type="text"
                  required
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. general, development"
                  maxLength={20}
                  className="w-full p-2.5 rounded text-sm glass-input font-medium"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold tracking-wider font-mono-custom transition-colors cursor-pointer uppercase mt-2"
          >
            Connect Node
          </button>
        </form>

      </div>
    </div>
  );
};

export default Landing;