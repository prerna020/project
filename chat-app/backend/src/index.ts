import { WebSocket, WebSocketServer } from "ws";
import mongoose from "mongoose";

// 1. Setup MongoDB Connection logic
mongoose.connect("mongodb://127.0.0.1:27017/chat-app")
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((err) => console.error("Failed to connect to MongoDB", err));

// 2. Define Message Schema
const messageSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    username: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: String, required: true }
});

const Message = mongoose.model("Message", messageSchema);

const wss = new WebSocketServer({ port: 8080 });

interface User {
    socket: WebSocket; 
    room: string;
    username: string;
}

let allSockts: User[] = [];

// Helper to broadcast active users list in a specific room
const broadcastPresence = (roomId: string) => {
    const activeUsers = allSockts
        .filter(user => user.room === roomId)
        .map(user => user.username);

    const payload = JSON.stringify({
        type: "presence",
        users: activeUsers
    });

    allSockts.forEach(user => {
        if (user.room === roomId) {
            user.socket.send(payload);
        }
    });
};

wss.on("connection", function (socket) {
    
    socket.on("message", async (message) => {
        const parsedmsg = JSON.parse(message.toString());

        if (parsedmsg.type == 'join') {
            console.log("User wants to join the room " + parsedmsg.payload.roomId);

            const existingUser = allSockts.find(user => user.socket === socket);

            if (existingUser) {
                existingUser.room = parsedmsg.payload.roomId;
                existingUser.username = parsedmsg.payload.username;
            } else {
                allSockts.push({
                    socket,
                    room: parsedmsg.payload.roomId,
                    username: parsedmsg.payload.username,
                });
            }

            // Broadcast active roster to this room
            broadcastPresence(parsedmsg.payload.roomId);

            // Fetch and send past messages
            try {
                const pastMessages = await Message.find({ roomId: parsedmsg.payload.roomId }).sort({ _id: 1 });
                
                pastMessages.forEach(msg => {
                    const outgoing = JSON.stringify({
                        type: "chat",
                        username: msg.username,
                        message: msg.message,
                        timestamp: msg.timestamp,
                    });
                    socket.send(outgoing);
                });
            } catch (error) {
                console.error("Error fetching past messages:", error);
            }
        }

        if (parsedmsg.type == 'chat') {
            const sender = allSockts.find((u) => u.socket === socket);
            if (!sender) return;

            console.log("User wants to chat msg- " + parsedmsg.payload.message);

            const currentUserRoom = sender.room;
            const chatTimestamp = new Date().toISOString();

            // Broadcast chat message to the room
            for (const user of allSockts) {
                if (user.room === currentUserRoom) {
                    const outgoing = JSON.stringify({
                        type: "chat",
                        username: sender.username,
                        message: parsedmsg.payload.message,
                        timestamp: chatTimestamp,
                    });

                    user.socket.send(outgoing);
                }
            }

            // Save message to database
            try {
                const newMsg = new Message({
                    roomId: currentUserRoom,
                    username: sender.username,
                    message: parsedmsg.payload.message,
                    timestamp: chatTimestamp
                });
                await newMsg.save();
                console.log("Message saved to DB successfully");
            } catch (error) {
                console.error("Error saving message to DB:", error);
            }
        }
    });

    socket.on("close", () => {
        const user = allSockts.find(u => u.socket === socket);
        const roomId = user?.room;

        allSockts = allSockts.filter(user => user.socket !== socket);
        console.log("User disconnected, remaining users:", allSockts.length);

        if (roomId) {
            broadcastPresence(roomId);
        }
    });

});