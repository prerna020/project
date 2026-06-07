import { useEffect, useRef, useState } from "react";
import type { Message } from "../App";

interface Props {
  roomId: string;
  username: string;
  messages: Message[];
  onSend: (text: string) => void;
  onLeave: () => void;
  accent: string;
  avatarGradient: string;
  avatarIcon: string;
}

const EMBLEMS = ["⚡", "👾", "🪐", "🔮", "🔥", "💫", "🛡️", "👑", "🚀", "🛸"];

const playSound = (type: "send" | "receive" | "click" | "join", enabled: boolean) => {
  if (!enabled) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (type === "click") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === "send") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(500, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === "receive") {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      const gain2 = audioCtx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.05);
      gain2.gain.setValueAtTime(0.015, audioCtx.currentTime + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.1);
      osc2.start(audioCtx.currentTime + 0.05);
      osc2.stop(audioCtx.currentTime + 0.2);
    } else if (type === "join") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(250, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(650, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    }
  } catch (error) {
    console.warn("Audio Context blocked:", error);
  }
};
const THEMES = [
  { id: "indigo", name: "Cyber Indigo", rgb: "99, 102, 241", glow: "rgba(99, 102, 241, 0.2)" },
  { id: "cyan", name: "Glitch Cyan", rgb: "6, 182, 212", glow: "rgba(6, 182, 212, 0.2)" },
  { id: "rose", name: "Neon Rose", rgb: "244, 63, 94", glow: "rgba(244, 63, 94, 0.2)" },
  { id: "emerald", name: "Matrix Green", rgb: "16, 185, 129", glow: "rgba(16, 185, 129, 0.2)" },
  { id: "amber", name: "Solar Amber", rgb: "245, 158, 11", glow: "rgba(245, 158, 11, 0.2)" },
];

const QUICK_EMOJIS = ["👍", "❤️", "🔥", "😂", "😮", "🙌", "💡", "💯"];


const Chat = ({ roomId, username, messages, onSend, onLeave, accent, avatarGradient, avatarIcon }: Props) => {
  const [text, setText] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(accent);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Ref for local scrollTop manipulation
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Message tracker to check for sound chimes on fresh messages
  const prevMessagesCount = useRef(messages.length);

  // Consistent Avatar generation for users in the chat
  const getAvatarForUser = (name: string) => {
    if (name === username) {
      return { gradient: avatarGradient, emblem: avatarIcon };
    }
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = Math.abs((hash + 65) % 360);
    const emblem = EMBLEMS[Math.abs(hash) % EMBLEMS.length];
    return {
      gradient: `linear-gradient(135deg, hsl(${hue1}, 75%, 60%), hsl(${hue2}, 75%, 50%))`,
      emblem: emblem,
    };
  };

  // Sync theme changes in real time
  useEffect(() => {
    const themeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];
    document.documentElement.style.setProperty("--accent", themeObj.rgb);
    document.documentElement.style.setProperty("--accent-glow", themeObj.glow);
  }, [currentTheme]);

  // Audio triggering and Scroll management on new messages
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNewMessage = messages.length > prevMessagesCount.current;
    if (isNewMessage) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        if (lastMessage.username === username) {
          playSound("send", soundEnabled);
          // Force scroll to bottom instantly when self submits a message
          container.scrollTop = container.scrollHeight;
        } else {
          playSound("receive", soundEnabled);
          // Auto scroll for others only if user is already near the bottom
          const threshold = 150;
          const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
          if (isNearBottom) {
            container.scrollTop = container.scrollHeight;
          }
        }
      }
    } else if (prevMessagesCount.current === 0 && messages.length > 0) {
      // Instant snap scroll to bottom on initial message load (prevents sliding/jumping layout)
      container.scrollTop = container.scrollHeight;
    }

    prevMessagesCount.current = messages.length;
  }, [messages, username, soundEnabled]);

  // Play joining sound effect on mount
  useEffect(() => {
    playSound("join", soundEnabled);
    // Safety check: ensure scroll is correct on initial load
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 100);
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

  // Extract unique active members in the chat room based on past messages
  const activeMembers = Array.from(new Set([username, ...messages.map((m) => m.username)]));

  const currentThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div
      className="w-screen h-screen text-white flex p-4 gap-4 overflow-hidden relative select-none font-sans"
      style={{
        background: `radial-gradient(circle at 10% 20%, rgba(${currentThemeObj.rgb}, 0.08) 0%, rgba(3, 3, 8, 1) 90%), radial-gradient(circle at 90% 80%, rgba(${currentThemeObj.rgb}, 0.05) 0%, rgba(3, 3, 8, 1) 90%)`
      }}
    >
      {/* Sidebar Console (Desktop: fixed, Mobile: sliding drawer) */}
      <div
        className={`fixed md:relative z-40 top-4 bottom-4 left-4 md:left-auto md:top-0 md:bottom-0 w-80 glass-panel rounded-2xl flex flex-col justify-between p-6 transition-all duration-300 shrink-0 ${
          showMobileSidebar ? "translate-x-0" : "-translate-x-[110%] md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold tracking-widest text-sm text-zinc-300 font-title uppercase">
                Nexus Console
              </span>
            </div>
            {/* Close Mobile Sidebar */}
            <button
              onClick={() => {
                playSound("click", soundEnabled);
                setShowMobileSidebar(false);
              }}
              className="md:hidden text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Current Node Details */}
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-2.5">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Active Node ID</span>
              <span className="font-bold font-title text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                #{roomId}
              </span>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-white/5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-md border border-white/5"
                style={{ background: avatarGradient }}
              >
                {avatarIcon}
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Client Persona</span>
                <span className="font-semibold block truncate text-zinc-200">{username}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Users List */}
          <div className="space-y-3">
            <span className="text-[10px] text-zinc-500 block uppercase font-semibold tracking-wider">
              Discovered Nodes ({activeMembers.length})
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {activeMembers.map((member) => {
                const isSelf = member === username;
                const memberAvatar = getAvatarForUser(member);
                return (
                  <div
                    key={member}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                      isSelf ? "bg-white/[0.04] border-white/10" : "bg-transparent border-transparent hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-sm shadow border border-white/5"
                        style={{ background: memberAvatar.gradient }}
                      >
                        {memberAvatar.emblem}
                      </div>
                      <span className="text-sm truncate text-zinc-300 font-medium">{member}</span>
                    </div>
                    {isSelf && (
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase font-bold">
                        Self
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls Console */}
          <div className="space-y-4">
            <span className="text-[10px] text-zinc-500 block uppercase font-semibold tracking-wider">
              Control Center
            </span>
            <div className="space-y-3 bg-white/[0.01] p-3.5 rounded-xl border border-white/5">
              {/* Sound toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">UI Audio Synthesizer</span>
                <button
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    playSound("click", next);
                  }}
                  className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-300 ${
                    soundEnabled ? "bg-indigo-500" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                      soundEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Accent Picker */}
              <div className="flex flex-col gap-2 pt-2.5 border-t border-white/5">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase">Console Accent</span>
                <div className="flex gap-2">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setCurrentTheme(theme.id);
                        playSound("click", soundEnabled);
                      }}
                      className={`w-5 h-5 rounded-full cursor-pointer transition-all border ${
                        currentTheme === theme.id ? "border-white scale-110" : "border-white/10 hover:scale-105"
                      }`}
                      style={{ backgroundColor: `rgb(${theme.rgb})` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Room Button */}
        <button
          onClick={() => {
            playSound("click", soundEnabled);
            onLeave();
          }}
          className="w-full py-3.5 mt-4 rounded-xl cursor-pointer bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 text-sm font-bold tracking-wider transition-all duration-300 active:scale-95 shrink-0"
        >
          DISCONNECT NODE
        </button>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative border border-white/5">
        
        {/* Top Header Console Bar */}
        <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Trigger */}
            <button
              onClick={() => {
                playSound("click", soundEnabled);
                setShowMobileSidebar(true);
              }}
              className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded cursor-pointer shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="overflow-hidden">
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Active Node</span>
              <span className="font-bold text-zinc-200 truncate block text-sm md:text-base">#{roomId}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Log Volume</span>
            <span className="text-xs text-zinc-400 font-medium">
              {messages.length} transmission{messages.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Message Log Output Console */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="m-auto text-center space-y-2 opacity-40 max-w-sm pointer-events-none">
              <div className="w-12 h-12 rounded-full border border-white/10 m-auto flex items-center justify-center text-xl animate-float">
                💬
              </div>
              <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Log is empty</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Send a message to initialize telemetry logs on the channel server.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isSelf = msg.username === username;
              const senderAvatar = getAvatarForUser(msg.username);
              const messageTime = formatTime(msg.timestamp);

              // Apply animation only to the single latest message as it arrives
              const isLastMessage = i === messages.length - 1;
              const animationClass = isLastMessage ? "animate-msg-fade" : "";

              return (
                <div
                  key={i}
                  className={`flex items-end gap-3 max-w-[85%] md:max-w-[70%] ${
                    isSelf ? "self-end flex-row-reverse" : "self-start"
                  } ${animationClass}`}
                >
                  {/* Sender Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow border border-white/5 shrink-0 select-none"
                    style={{ background: senderAvatar.gradient }}
                    title={msg.username}
                  >
                    {senderAvatar.emblem}
                  </div>

                  {/* Message Bubble Container */}
                  <div className="space-y-1">
                    {/* User handle name for received messages */}
                    {!isSelf && (
                      <span className="text-[10px] font-semibold text-zinc-500 pl-1 block">
                        {msg.username}
                      </span>
                    )}

                    <div
                      className={`px-4 py-2.5 rounded-2xl text-[13px] md:text-sm font-medium leading-relaxed relative ${
                        isSelf
                          ? "rounded-tr-sm text-black"
                          : "rounded-tl-sm bg-white/[0.04] border border-white/5 text-zinc-100"
                      }`}
                      style={{
                        backgroundColor: isSelf ? `rgb(${currentThemeObj.rgb})` : undefined,
                        boxShadow: isSelf ? `0 4px 15px rgba(${currentThemeObj.rgb}, 0.15)` : "none",
                      }}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>

                    {/* Timestamp */}
                    {messageTime && (
                      <span
                        className={`text-[9px] text-zinc-600 block px-1 ${
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

        {/* Input Console Control Area */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] space-y-3.5 shrink-0">
          
          {/* Emojis Quick Tray */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase pr-2 shrink-0 select-none">
              Fast Reactions
            </span>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="text-base p-1.5 rounded-lg hover:bg-white/10 active:scale-90 cursor-pointer transition-all shrink-0"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Text Input Row */}
          <div className="flex gap-3">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              placeholder="Inject telemetry transmission..."
              className="flex-1 p-3.5 rounded-xl text-sm glass-input font-medium"
            />
            <button
              onClick={() => {
                playSound("click", soundEnabled);
                handleSend();
              }}
              className="px-6 py-3.5 rounded-xl cursor-pointer font-bold text-sm tracking-wider text-black transition-all duration-300 font-title active:scale-95 hover:shadow-md shrink-0"
              style={{
                backgroundColor: `rgb(${currentThemeObj.rgb})`,
                boxShadow: `0 4px 20px rgba(${currentThemeObj.rgb}, 0.2)`,
              }}
            >
              SEND
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
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}
    </div>
  );
};

export default Chat;