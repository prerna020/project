import { Router } from "express";
import { loginUser, logout, registerUser } from "../controllers/user.controller.js";
import { verifyJwt, authUser } from "../middlewares/auth.js";
import { createAlbum, createMusic, getAllmusic, getAllalbums, getAlbumById } from "../controllers/music.controller.js";
import multer from "multer";  

const upload = multer({
    storage: multer.memoryStorage()
})


const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/upload').post(verifyJwt, upload.single("music") ,createMusic )
router.route('/album').post(verifyJwt, createAlbum )
router.route('/music').get(authUser, getAllmusic )
router.route('/allAlbums').get(authUser, getAllalbums)
router.route('/album/:albumId').get(authUser, getAlbumById)
router.route('/logout').get(authUser, logout)


 
export default router