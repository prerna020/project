import mongoose from "mongoose"
import { required } from "zod/mini"

const todoSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true, 
        trim: true, 
        minLength: 100
    },
    description: String,
    done: Boolean,
    userId: String
})

const userSchema = new mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String, 
        required: true,
        minLength: 6
    }
})

export const Todo = mongoose.models.Todo || mongoose.model("Todo", todoSchema)
export const User = mongoose.models.User || mongoose.model("Todo", userSchema)