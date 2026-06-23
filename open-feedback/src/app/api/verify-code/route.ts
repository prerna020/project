import dbConnect from "@/src/lib/db";
import UserModel from "@/src/models/User";
import { success } from "zod";

export async function POST(request: Request){
    await dbConnect()

    try {
        const {username, code} = await request.json()
        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({
            username: decodedUsername,
            verifyCode: code
        })

        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "Invalid code or username"
                },
                { status: 400 }
            )
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()
        
        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true;
            await user.save()
            return Response.json(
                {
                    success: true,
                    message: "User verified successfully"
                },
                { status: 200 }
            )
        }else if(!isCodeNotExpired){
            return Response.json(
                {
                    success: false,
                    message: "Code has expired"
                },
                { status: 400 }
            )
        } else{
            return Response.json(
                {
                    success: false,
                    message: "Invalid code"
                },
                {
                    status: 400
                }
            )
        }

        
        
    } catch (error) {
        console.log("Error occured while verifying code ",error)
        return Response.json(
            {
                success: false,
                message: "Error while verifying code"
            }, 
            {
                status: 500
            }
        )
    }
}