import { User } from "../models/user.model.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const registerUser = async(req,res)=>{
    const {username,email, password, role = "listener"} = req.body;
    
    const alreadyExists = await User.findOne({
        $or: [{username, email}]
    })
    if(alreadyExists){
        console.error("user already exists")
    }
    const hashPassword = await bcrypt.hash(password, 10);
    // console.log("strated")
    const user = await User.create({
        username,
        email,
        password:hashPassword,
        role
    })
    // console.log("created!")
    const created = User.findById(user._id).select("-password")
    if(!created){
        return res.status(500).json({
            message: "error in creating user"
        })
    }
    const token = jwt.sign({
        userId : user._id,
        role : user.role
    }, process.env.JWT_SECRET,{expiresIn: '1d'})

    res.cookie("token", token);

    res.status(200).json({
        message :"user created successfully"
    })
}

const loginUser = async (req,res)=>{
   
    const { username, password, email,role } = req.body;

    if(!username && !email){
        return res.send(400).json({
            message: "user not found"
        })
    }
    const user = await User.findOne({
        $or: [{username} , {email}]
    })
    if(!user){
        return res.status(404).json({
            message: "User does not exist"
        })
    }
    const isPasswordValid = await bcrypt.compare(password,user.password)

    if (!isPasswordValid) {
        return res.status(404).json({
            message: "password incorrect"
        })
    }
    const loggedInUser = await User.findById(user._id).select("-password")



    const token = jwt.sign({
        userId: user._id,
        role: user.role
    }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: false
    });

    return res.status(200).json({
        message: "User logged in successfully",
        user: loggedInUser
    });
}

export { registerUser, loginUser }