import mongoose, { Schema } from "mongoose";

const albumSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    musics:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Music",
        required: true
    }
})

export const Album = mongoose.model("Album", albumSchema )