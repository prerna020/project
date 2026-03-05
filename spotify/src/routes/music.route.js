import { Router } from "express";
import { authUser } from "../middlewares/auth.js";
import { getAllmusic, getAllalbums, getAlbumById } from "../controllers/music.controller.js";

const router = Router()


router.route('/allMusic').get(authUser, getAllmusic )
router.route('/allAlbums').get(authUser, getAllalbums)
router.route('/album/:albumId').get(authUser, getAlbumById)

 
export default router