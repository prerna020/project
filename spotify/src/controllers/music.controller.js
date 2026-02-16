import { Music } from "../models/music.model.js";
import { uploadFile } from "../utils/imagekit.js";

const createMusic = async (req,res) =>{
    try {
        const { title } = req.body
    
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const result = await uploadFile(
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
);

    
        const music = await Music.create({
            uri: result.url,
            title,
            artist: req.user._id
        })
        const createdMusic = await Music.findById(music._id)
        
        res.status(200).json({
            message: "music created",
            music:{
                id: music._id,
                uri: music.uri,
                title: music.title,
                artist: music.artist
            }
        })
    } catch (error) {
        console.error("Error in music", error)
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }

}
export {createMusic}