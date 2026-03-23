import { useEffect, useRef, useState } from "react";
import Landing from "./components/Landing";
import Chat from "./components/Chat";

export interface Message {
  username: string;
  message: string;
  timestamp: string;
}

export default function App() {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const handleJoin = (room: string, user: string) => {
    
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "join",
        payload: { roomId: room, username: user },
      }));
      setRoomId(room);
      setUsername(user);
      setJoined(true);
    };

    ws.onerror = () => {
      alert("Could not connect to server. Is the backend running on port 8080?");
    };

    ws.onmessage = (event) => {
     
      const data: Message = JSON.parse(event.data);
      
      
      setMessages((prev) => [...prev, data]);
    };

    ws.onclose = () => {
      setJoined(false);
    };
  };

  const handleSend = (text: string) => {
    wsRef.current?.send(JSON.stringify({
      type: "chat",
      payload: { message: text },
    }));
  };

  const handleLeave = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setMessages([]);
    setJoined(false);
  };

  useEffect(() => {
    return () => { wsRef.current?.close(); };
  }, []);

  return joined ? (
    <Chat
      roomId={roomId}
      username={username}
      messages={messages}
      onSend={handleSend}
      onLeave={handleLeave}
    />
  ) : (
    <Landing onJoin={handleJoin} />
  );
}