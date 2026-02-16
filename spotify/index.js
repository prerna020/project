import express from 'express'
// require('dotenv').config();
import 'dotenv/config';
import connectDB from './src/config/db.js';

import { app } from './src/app.js'

connectDB()
.then(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log(`Server running on port ${process.env.PORT}`)
    })
})
.catch((e)=>{
    console.error("error:",e);
})

