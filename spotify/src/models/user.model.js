import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username:{
        type: String,
        unique: true,
        required: true
    }, 
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String, 
        enum: ['user', 'artist'],
        default: 'user',
        required: true
    }
})

export const User = mongoose.model("User", userSchema )