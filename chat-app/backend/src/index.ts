import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

// interface - defines the shape of each connected user
interface User {
    socket: WebSocket, // WebSocket connection for that user - represents the live connection between the server and that client.
    room: String,
    username: string;
}

let allSockts: User[] = []
// store all the sockets with their roomId
// socket parameter - client's unique connection
wss.on("connection", function (socket) {
    // whenever socket connects it will recieve a msg from the server (sent by that specific client)
    socket.on("message", (message) => {
        // pasre - Converts json string into an object. (The client sends JSON strings, so we parse them into JavaScript objects.)
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
        }

        if (parsedmsg.type == 'chat') {
            // Find the sender user object from all sockets array to get their room
            const sender = allSockts.find((u) => u.socket === socket);
            if (!sender) return;

            console.log("User wants to chat msg- " + parsedmsg.payload.message)

            // Get the room that the current sender is present in
            const currentUserRoom = sender.room;

            // Loop through all connected sockets (users)
            for (const user of allSockts) {
                // Logic: If the socket's room matches the sender's room, we broadcast the message to them.
                // This ensures messages are only received by users inside the same room.
                if (user.room === currentUserRoom) {
                    // Prepare the message payload with sender's details and timestamp
                    const outgoing = JSON.stringify({
                        username: sender.username,
                        message: parsedmsg.payload.message,
                        timestamp: new Date().toISOString(),
                    });

                    // Actually send the stringified payload to the user's socket connection
                    user.socket.send(outgoing);
                }
            }
        }
    })
    socket.on("close", () => {
        allSockts = allSockts.filter(user => user.socket !== socket);
        console.log("User disconnected, remaining users:", allSockts.length);
    });

})