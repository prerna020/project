import { Album } from "../models/album.model.js";
import { Music } from "../models/music.model.js";
import { uploadFile } from "../utils/imagekit.js";

const createMusic = async (req,res) =>{
    try {
        const { title } = req.body
        
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const result = await uploadFile(`data:${file.mimetype};base64,${file.buffer.toString("base64")}`);

    
        const music = await Music.create({
            uri: result.url,
            title,
            artist: req.user._id
        })
        // console.log(result.url)
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
        console.error("Error in creating Music", error)
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }

}

const createAlbum = async (req,res) =>{
    try {
        const { title , musics } = req.body;
    
        const album = await Album.create({
            title,
            artist: req.user._id,
            musics
        })
        const createdAlbum = await Album.findById(album._id);
        if(!createdAlbum){
            return res.status(500).json({
                message:"unable to create album"
            })
        }
        res.status(200).json({
            message: "music created",
            album:{
                id: album._id,
                title: album.title,
                artist: album.artist,
                musics: album.musics
            }
        })  
    } catch (error) {
        console.error(error);
        return res.status(404).json({
            message:"Error in creating or fetching album"
        })
        
    }
}

const getAllmusic = async (req,res) =>{
    try {
        const musics = await Music.find()
        res.status(200).json({
            message: "musics fetched",
            musics: musics
        })
    } catch (error) {
        console.error("Error in fetchinig Music", error)
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

export {createMusic, createAlbum , getAllmusic}