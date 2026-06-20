import dbConnect from "@/public/lib/db";
import UserModel from "@/public/models/User";
import bcrypt from "bcryptjs";

export async function  POST(request :Request) {
    await dbConnect();
    try {
        const {username, email, password} = await request.json()
        const existingUserVerifiedByUsername = await UserModel.findOne({username, isVerified:true})
        if(existingUserVerifiedByUsername){
            return Response.json(
                {
                    success: false,
                    message: "User already exists"
                },
                {
                    status: 400
                }
            )
        }

        const verifyCode = Math.floor(100000 + Math.random()*900000).toString();
        const existingUserByEmail = await UserModel.findOne({email})

        if(existingUserByEmail){
            return Response.json(
                {
                    success: false,
                    message: "User already exists by email",
                }, 
                {
                    status: 400
                }
            )
        } else{
            const hashedPassword = await bcrypt.hash(password,10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours()+1)

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save();

            // send verification mail
        }

        

    } catch (error) {
        console.log("Error in registering user", error)
        return Response.json(
            {
                success: false,
                message: "Failed to register user"
            },
            {
                status: 500
            }
        )
    }
}