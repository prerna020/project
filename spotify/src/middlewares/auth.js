import { User } from "../models/user.model.js"
import jwt from 'jsonwebtoken'

export const verifyJwt = async(req,res, next) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            return res.status(400).json({
                message: "unauthorized"
            })
        }
       
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    
        const user = await User.findById(decodedToken?.userId).select("-password")
    
        if (!user) {
           return res.status(404).json({
                message: "user not found"
           })
        }
        if(user.role === 'listener'){
            return res.status(400).json({message: "User can't access"})
        }
    
        req.user = user;
        next()
    } catch (error) {
        res.status(400).json({
            message: "invalid credentials"
        })
    }
       
}