import express, { urlencoded } from 'express'
import userRouter from './routes/user.route.js';
import musicRouter from './routes/music.route.js'
import cookieParser from 'cookie-parser'

const app = express();
app.use(cookieParser())
app.use(express.json({limit:"16kb"}));

app.use(urlencoded({extended:true, limit:"16kb"}))

app.use("/api/v1/users/",userRouter);
app.use("/api/v1/music/",musicRouter);


export {app}