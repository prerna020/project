import mongoose, {Schema, Document, SubdocsToPOJOs, mongo} from "mongoose";

export interface Message extends Document{
    content: string;
    createdAt: Date
}

const MessageSchema : Schema<Message> = new Schema({
    content :{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    }
})

export interface User extends Document{
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isAcceptingMessage: boolean;
    isVerified: boolean,
    message: Message[]
}

const UserSchema : Schema<User> = new Schema({
    username :{
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        match : [/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi , "please enter valid email address"]
    },
    password :{
        type: String,
        required: [true, "Password is required"]
    },
    verifyCode :{
        type: String,
        required: [true, "Verify code is required"]
    },
    verifyCodeExpiry :{
        type: Date,
        required: [true, "Expiry code is required"]
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    isAcceptingMessage:{
        type: Boolean,
        default: true
    },
    message: [MessageSchema]
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema)

export default UserModel;