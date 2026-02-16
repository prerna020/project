import express, { urlencoded } from 'express'
import router from './routes/user.route.js';
import cookieParser from 'cookie-parser'
const app = express();
app.use(cookieParser())
app.use(express.json({limit:"16kb"}));

app.use(urlencoded({extended:true, limit:"16kb"}))

app.use("/api/v1/users/",router);


export {app}