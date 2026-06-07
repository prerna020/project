import { useEffect, useRef, useState } from "react";
import type { Message } from "../App";

interface Props {
  roomId: string;
  username: string;
  messages: Message[];
  activeUsers: string[];
  onSend: (text: string) => void;
  onLeave: () => void;
  accent: string;
  avatarGradient: string; // Serves as avatar background color
  avatarIcon: string;     // Serves as avatar emblem
}

const EMBLEMS = ["👤", "⚡", "☕", "💻", "✨", "🪐", "🔥", "🛠️", "⚙️", "🔒"];
const AVATAR_COLORS = ["#10b981", "#0d9488", "#4f46e5", "#b45309", "#3f3f46", "#dc2626", "#0891b2"];

// Web Audio API Synthesizer for retro UI sound effects
const playSound = (type: "send" | "receive" | "click" | "join", enabled: boolean) => {
  if (!enabled) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (type === "click") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.008, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } else if (type === "send") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } else if (type === "receive") {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      const gain2 = audioCtx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(700, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.04);
      gain2.gain.setValueAtTime(0.01, audioCtx.currentTime + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.08);
      osc2.start(audioCtx.currentTime + 0.04);
      osc2.stop(audioCtx.currentTime + 0.16);
    } else if (type === "join") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(550, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    }
  } catch (error) {
    console.warn("Audio Context blocked:", error);
  }
};

const QUICK_EMOJIS = ["👍", "❤️", "🔥", "😂", "😮", "🙌", "💡", "💯"];

const Chat = ({ roomId, username, messages, activeUsers, onSend, onLeave, avatarGradient, avatarIcon }: Props) => {
  const [text, setText] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesCount = useRef(messages.length);

  // Generate consistent color/emblem for participants
  const getAvatarForUser = (name: string) => {
    if (name === username) {
      return { color: avatarGradient, emblem: avatarIcon };
    }
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIdx = Math.abs(hash) % AVATAR_COLORS.length;
    const emblemIdx = Math.abs(hash) % EMBLEMS.length;
    return {
      color: AVATAR_COLORS[colorIdx],
      emblem: EMBLEMS[emblemIdx],
    };
  };

  // Auto scroll logic (isolated to container)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNewMessage = messages.length > prevMessagesCount.current;
    if (isNewMessage) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        if (lastMessage.username === username) {
          playSound("send", soundEnabled);
          container.scrollTop = container.scrollHeight;
        } else {
          playSound("receive", soundEnabled);
          const threshold = 150;
          const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
          if (isNearBottom) {
            container.scrollTop = container.scrollHeight;
          }
        }
      }
    } else if (prevMessagesCount.current === 0 && messages.length > 0) {
      container.scrollTop = container.scrollHeight;
    }

    prevMessagesCount.current = messages.length;
  }, [messages, username, soundEnabled]);

  // Initial trigger scroll and chime on mount
  useEffect(() => {
    playSound("join", soundEnabled);
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  const handleEmojiClick = (emoji: string) => {
    playSound("click", soundEnabled);
    setText((prev) => prev + emoji);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch {
      return "";
    }
  };

  return (
    <div className="w-screen h-screen bg-[#07080a] text-zinc-100 flex p-4 gap-4 overflow-hidden relative select-none font-sans">
      
      {/* Dynamic Sidebar */}
      <div
        className={`fixed md:relative z-40 top-4 bottom-4 left-4 md:left-auto md:top-0 md:bottom-0 w-72 bg-[#0b0d10] border border-[#181c24] rounded-lg flex flex-col justify-between p-5 transition-all duration-200 shrink-0 ${
          showMobileSidebar ? "translate-x-0" : "-translate-x-[110%] md:translate-x-0"
        }`}
      >
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#181c24] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold tracking-wider text-xs font-mono-custom text-zinc-400 uppercase">
                NEXUS // CONSOLE
              </span>
            </div>
            <button
              onClick={() => {
                playSound("click", soundEnabled);
                setShowMobileSidebar(false);
              }}
              className="md:hidden text-zinc-500 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Node Details */}
          <div className="bg-[#0e1115] p-3 rounded.5 border border-[#1d2433] space-y-2">
            <div>
              <span className="text-[9px] font-mono-custom text-zinc-500 block uppercase">NODE ROOM KEY</span>
              <span className="font-semibold text-zinc-300 font-mono-custom text-xs">
                #{roomId}
              </span>
            </div>
            <div className="flex items-center gap-2.5 pt-2 border-t border-[#1d2433]">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm border border-white/5"
                style={{ backgroundColor: avatarGradient }}
              >
                {avatarIcon}
              </div>
              <div className="overflow-hidden">
                <span className="text-[9px] font-mono-custom text-zinc-500 block uppercase">ALIAS</span>
                <span className="font-semibold block truncate text-zinc-200 text-xs">{username}</span>
              </div>
            </div>
          </div>

          {/* Online presence roster */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono-custom text-zinc-500 block uppercase tracking-wider">
              ONLINE ROSTER ({activeUsers.length})
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {activeUsers.map((member) => {
                const isSelf = member === username;
                const memberAvatar = getAvatarForUser(member);
                return (
                  <div
                    key={member}
                    className={`flex items-center justify-between p-2 rounded bg-zinc-950/40 border border-[#12161f] transition-all`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 text-white"
                        style={{ backgroundColor: memberAvatar.color }}
                      >
                        {memberAvatar.emblem}
                      </div>
                      <span className="text-xs truncate text-zinc-400 font-medium">{member}</span>
                    </div>
                    {isSelf && (
                      <span className="text-[8px] font-mono-custom bg-emerald-950/50 text-emerald-400 border border-emerald-500/20 px-1 rounded uppercase">
                        Self
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2.5">
            <span className="text-[9px] font-mono-custom text-zinc-500 block uppercase tracking-wider">
              CONTROLS
            </span>
            <div className="bg-[#0d0f13] p-3 rounded border border-[#1d2433] flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-medium font-mono-custom uppercase">SYNTH AUDIO</span>
              <button
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  playSound("click", next);
                }}
                className={`w-9 h-5 rounded-full cursor-pointer relative transition-colors duration-200 ${
                  soundEnabled ? "bg-emerald-600" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black transition-transform duration-200 ${
                    soundEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Disconnect */}
        <button
          onClick={() => {
            playSound("click", soundEnabled);
            onLeave();
          }}
          className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 hover:border-red-500/20 text-xs font-semibold tracking-wider font-mono-custom transition-all cursor-pointer uppercase rounded"
        >
          DISCONNECT
        </button>
      </div>

      {/* Main Chat Console Panel */}
      <div className="flex-1 bg-[#0b0d10] border border-[#181c24] rounded-lg flex flex-col overflow-hidden relative">
        
        {/* Top Header Console Bar */}
        <div className="h-14 px-5 border-b border-[#181c24] flex items-center justify-between shrink-0 bg-[#0d0f13]">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                playSound("click", soundEnabled);
                setShowMobileSidebar(true);
              }}
              className="md:hidden text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-xs font-mono-custom font-bold text-zinc-300 uppercase">
              ROOM // {roomId}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono-custom text-zinc-500 uppercase">
              LOGS: {messages.length} TRANSMISSIONS
            </span>
          </div>
        </div>

        {/* Message Log Viewport */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5 custom-scrollbar bg-[#08090c]"
        >
          {messages.length === 0 ? (
            <div className="m-auto text-center space-y-2 opacity-35 max-w-xs pointer-events-none font-mono-custom text-[11px]">
              <div className="text-xl">🗃️</div>
              <p className="uppercase tracking-widest text-zinc-400 font-bold">NODE LOG IS VACANT</p>
              <p className="text-zinc-500 leading-relaxed">
                Awaiting telemetry logs on this room frequency channel.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isSelf = msg.username === username;
              const senderAvatar = getAvatarForUser(msg.username);
              const messageTime = formatTime(msg.timestamp);

              const isLastMessage = i === messages.length - 1;
              const animationClass = isLastMessage ? "animate-fade" : "";

              return (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 max-w-[85%] md:max-w-[70%] ${
                    isSelf ? "self-end flex-row-reverse" : "self-start"
                  } ${animationClass}`}
                >
                  {/* Sender Avatar */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs shadow border border-white/5 shrink-0 select-none text-white font-sans"
                    style={{ backgroundColor: senderAvatar.color }}
                    title={msg.username}
                  >
                    {senderAvatar.emblem}
                  </div>

                  {/* Message Bubble Container */}
                  <div className="space-y-1">
                    {!isSelf && (
                      <span className="text-[10px] font-mono-custom font-bold text-zinc-500 pl-1 block uppercase">
                        {msg.username}
                      </span>
                    )}

                    <div
                      className={`px-3 py-2 rounded text-xs md:text-sm leading-relaxed relative ${
                        isSelf
                          ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-100 rounded-tr-none"
                          : "bg-[#0d0f13] border border-[#181c24] text-zinc-200 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>

                    {messageTime && (
                      <span
                        className={`text-[9px] font-mono-custom text-zinc-600 block px-1 ${
                          isSelf ? "text-right" : "text-left"
                        }`}
                      >
                        {messageTime}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Control Area */}
        <div className="p-4 border-t border-[#181c24] bg-[#0d0f13] space-y-3 shrink-0">
          
          {/* Emojis Tray */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar">
            <span className="text-[9px] font-mono-custom text-zinc-500 uppercase pr-2 shrink-0 select-none">
              QUICK TRACE:
            </span>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="text-xs p-1 rounded hover:bg-zinc-800 active:scale-90 cursor-pointer transition-all shrink-0"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Text Input Row */}
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              placeholder="Type transmission payload..."
              className="flex-1 p-2 rounded text-xs glass-input font-medium"
            />
            <button
              onClick={handleSend}
              className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold font-mono-custom cursor-pointer transition-colors uppercase"
            >
              Send
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div
          onClick={() => {
            playSound("click", soundEnabled);
            setShowMobileSidebar(false);
          }}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}
    </div>
  );
};

export default Chat;