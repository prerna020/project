import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    socket: WebSocket, 
    room: String,
    username: string;
}

let allSockts: User[] = []

wss.on("connection", function (socket) {
    
    socket.on("message", (message) => {
       
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
                
                if (user.room === currentUserRoom) {
                    const outgoing = JSON.stringify({
                        username: sender.username,
                        message: parsedmsg.payload.message,
                        timestamp: new Date().toISOString(),
                    });

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