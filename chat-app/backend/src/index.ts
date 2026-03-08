import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080});

// interface - defines the shape of each connected user
interface User{
    socket: WebSocket, // WebSocket connection for that user - represents the live connection between the server and that client.
    room: String
}

let allSockts: User[] = [] 
// store all the sockets with their roomId
// socket parameter - client's unique connection
wss.on("connection", function(socket){
    // whenever socket connects it will recieve a msg from the server (sent by that specific client)
    socket.on("message", (message)=>{
        // pasre - Converts json string into an object. (The client sends JSON strings, so we parse them into JavaScript objects.)
        // @ts-ignore
        
        const parsedmsg = JSON.parse(message)
        if(parsedmsg.type == 'join'){
            console.log("User wants to join the room " + parsedmsg.payload.roomId)

            const existingUser = allSockts.find(user => user.socket === socket);

            if (existingUser) {
                // Update room instead of pushing new entry
                existingUser.room = parsedmsg.payload.roomId;
            } else {
                // First time joining
                allSockts.push({
                    socket,
                    room: parsedmsg.payload.roomId
                });
    }
            // console.log(parsedmsg);
            
        }
        if(parsedmsg.type == 'chat'){
            console.log("User wants to chat msg- " + parsedmsg.payload.message)
            let currentUserRoom = null
            for (let i = 0; i < allSockts.length; i++) {
                if(allSockts[i]?.socket == socket){
                    currentUserRoom = allSockts[i]?.room
                }
            }
            for (let i = 0; i < allSockts.length; i++) {
                if(allSockts[i]?.room == currentUserRoom){
                    allSockts[i]?.socket.send(parsedmsg.payload.message)
                }
            }
        }
    })
    socket.on("close", () => {
        allSockts = allSockts.filter(user => user.socket !== socket);
        console.log("User disconnected, remaining users:", allSockts.length);
    });

    /*
        "close" event fires automatically when the connection is broken.
        user closes the browser tab/ browser /User's internet goes down
        Client code calls socket.close()
        User navigates to another page
    */
})