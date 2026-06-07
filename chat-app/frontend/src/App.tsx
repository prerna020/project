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
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  
  // Customization States
  const [accent, setAccent] = useState("emerald");
  const [avatarGradient, setAvatarGradient] = useState("#10b981");
  const [avatarIcon, setAvatarIcon] = useState("👤");
  
  const wsRef = useRef<WebSocket | null>(null);

  const handleJoin = (
    room: string,
    user: string,
    selectedAccent: string,
    selectedGradient: string,
    selectedIcon: string
  ) => {
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
      
      // Save identity & theme configs
      setRoomId(room);
      setUsername(user);
      setAccent(selectedAccent);
      setAvatarGradient(selectedGradient);
      setAvatarIcon(selectedIcon);
      setJoined(true);
    };

    ws.onerror = () => {
      alert("Could not connect to server. Is the backend running on port 8080?");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat") {
        setMessages((prev) => [...prev, {
          username: data.username,
          message: data.message,
          timestamp: data.timestamp
        }]);
      } else if (data.type === "presence") {
        setActiveUsers(data.users);
      }
    };

    ws.onclose = () => {
      setJoined(false);
      setActiveUsers([]);
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
    setActiveUsers([]);
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
      activeUsers={activeUsers}
      onSend={handleSend}
      onLeave={handleLeave}
      accent={accent}
      avatarGradient={avatarGradient}
      avatarIcon={avatarIcon}
    />
  ) : (
    <Landing onJoin={handleJoin} />
  );
}