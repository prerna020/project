import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    uri:{
        type: String,
        unique: true,
        required: true
    }, 
    title:{
        type: String,
        required: true
    },
    artist:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

export const Music = mongoose.model("Music", userSchema )