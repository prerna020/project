import React, { useEffect, useRef, useState } from 'react'
import type { Message } from '../App';


interface Props {
  roomId: string;
  username: string;
  messages: Message[];
  onSend: (text: string) => void;
  onLeave: () => void;
}

const Chat = ({ roomId, username, messages, onSend, onLeave }: Props) => {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };
  
  return (
    <div className=' flex flex-col h-screen bg-black text-white'>
      <div className=' flex bg-zinc-400 w-full h-20 justify-between p-6'>
        <div className='font-bold text-2xl'>Room-Id: {roomId}, @{username}</div>
        <div>Connected</div>
        <button
          onClick={onLeave}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm"
        >
          Leave
        </button>
      </div>
      <div style={{ padding: "4px 16px", backgroundColor: "#18181b", fontSize: "12px", color: "#71717a", flexShrink: 0 }}>
        {messages.length} message{messages.length !== 1 ? "s" : ""}
      </div>
      
      

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.map((msg, i) => {
          const isValid = msg.username === username;
          return (
            <div key={i} className={`flex ${isValid ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                isValid ? "bg-blue-600" : "bg-zinc-700"
              }`}>
                {!isValid && (
                  <p className="text-xs text-zinc-400 mb-1">{msg.username}</p>
                )}
                <p>{msg.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} /> {/* ✅ scroll anchor */}
      </div>

      

    

    <div className="bg-zinc-900 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()} // enter to send
            placeholder="Message..."
            className="flex-1 p-3 rounded-2xl bg-zinc-700 text-white placeholder-zinc-400"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-2xl"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat