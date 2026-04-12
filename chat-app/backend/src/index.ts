import { WebSocket, WebSocketServer } from "ws";
import mongoose from "mongoose";

// 1. Setup MongoDB Connection logic
// Connects to the local MongoDB database 'chat-app' where all data will be persisted.
mongoose.connect("mongodb://127.0.0.1:27017/chat-app")
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((err) => console.error("Failed to connect to MongoDB", err));

// 2. Define Message Schema
// We store messages with their roomId so we can fetch room-specific history later.
const messageSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    username: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: String, required: true }
});

const Message = mongoose.model("Message", messageSchema);

const wss = new WebSocketServer({ port: 8080 });

interface User {
    socket: WebSocket, 
    room: String,
    username: string;
}

let allSockts: User[] = []

wss.on("connection", function (socket) {
    
    socket.on("message", async (message) => {
       
        const parsedmsg = JSON.parse(message.toString())
        if (parsedmsg.type == 'join') {
            console.log("User wants to join the room " + parsedmsg.payload.roomId)

            const existingUser = allSockts.find(user => user.socket === socket);

            if (existingUser) {
                // Update room instead of pushing new entry
                existingUser.room = parsedmsg.payload.roomId;
                // Update username in case it changed
                existingUser.username = parsedmsg.payload.username;
            } else {
                // First time joining
                allSockts.push({
                    socket,
                    room: parsedmsg.payload.roomId,
                    username: parsedmsg.payload.username,
                });
            }

            // 3. Fetch past messages from MongoDB for this specific room
            // We sort by _id ascending to get messages in chronological order.
            try {
                const pastMessages = await Message.find({ roomId: parsedmsg.payload.roomId }).sort({ _id: 1 });
                
                // Send each past message to the newly joined user sequentially
                // The frontend will treat these as incoming messages and automatically append them to the UI
                pastMessages.forEach(msg => {
                    const outgoing = JSON.stringify({
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
            // Find the sender user object from all sockets array to get their room
            const sender = allSockts.find((u) => u.socket === socket);
            if (!sender) return;

            console.log("User wants to chat msg- " + parsedmsg.payload.message)

            // Get the room that the current sender is present in
            const currentUserRoom = sender.room;

            // Generate a single timestamp for consistency
            const chatTimestamp = new Date().toISOString();

            // Loop through all connected sockets (users)
            for (const user of allSockts) {
                
                if (user.room === currentUserRoom) {
                    const outgoing = JSON.stringify({
                        username: sender.username,
                        message: parsedmsg.payload.message,
                        timestamp: chatTimestamp,
                    });

                    user.socket.send(outgoing);
                }
            }

            // 4. Save the incoming message to MongoDB for future retrieval
            // We include the roomId so it's tied to the room where it was sent.
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
    })
    socket.on("close", () => {
        allSockts = allSockts.filter(user => user.socket !== socket);
        console.log("User disconnected, remaining users:", allSockts.length);
    });

})