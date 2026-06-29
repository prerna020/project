import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
    if(connection.isConnected){
        console.log("Already connected to database")
        return
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "")
        connection.isConnected = db.connections[0].readyState
        // readystate : 0- disconnected, 1- connected, 2- connecting..., 3- disconnecting...

        console.log("DB connected");
        
    } catch (error) {
        console.log("Database connection failed", error);
        process.exit(1)
        
    }
    
}

export default dbConnect