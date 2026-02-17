import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.js";
import { createAlbum, createMusic, getAllmusic } from "../controllers/music.controller.js";
import multer from "multer";  

const upload = multer({
    storage: multer.memoryStorage()
})


const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/upload').post(verifyJwt, upload.single("music") ,createMusic )
router.route('/album').post(verifyJwt, createAlbum )
router.route('/music').get(verifyJwt, getAllmusic )

 
export default router