"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let allSockts = [];
// store all the sockets with their roomId
wss.on("connection", function (socket) {
    // whenever socket connects it will recieve a msg from the server
    socket.on("message", (message) => {
        // pasre - Converts json string into an object.
        // @ts-ignore
        const parsedmsg = JSON.parse(message);
        if (parsedmsg.type == 'join') {
            console.log("User wants to join the room " + parsedmsg.payload.roomId);
            const existingUser = allSockts.find(user => user.socket === socket);
            if (existingUser) {
                // Update room instead of pushing new entry
                existingUser.room = parsedmsg.payload.roomId;
            }
            else {
                // First time joining
                allSockts.push({
                    socket,
                    room: parsedmsg.payload.roomId
                });
            }
            // console.log(parsedmsg);
        }
        if (parsedmsg.type == 'chat') {
            console.log("User wants to chat msg- " + parsedmsg.payload.message);
            let currentUserRoom = null;
            for (let i = 0; i < allSockts.length; i++) {
                if (allSockts[i]?.socket == socket) {
                    currentUserRoom = allSockts[i]?.room;
                }
            }
            for (let i = 0; i < allSockts.length; i++) {
                if (allSockts[i]?.room == currentUserRoom) {
                    allSockts[i]?.socket.send(parsedmsg.payload.message);
                }
            }
        }
    });
});
//# sourceMappingURL=index.js.map