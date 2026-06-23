import dbConnect from "@/src/lib/db";
import UserModel from "@/src/models/User";
import { Message } from "@/src/models/User";

export async function POST(request: Request){
    await dbConnect()

    const {username, content} = await request.json()
    // const decodedUsername = decodeURIComponent(username)

    try {
        const user = await UserModel.findOne({
            username
        })

        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            )
        }

        // is user acceptinf msg
        if(!user.isAcceptingMessage){
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting messages"
                },
                {
                    status: 400
                }
            )
        }

        const newMessage = {content,createdAt: new Date()}

        user.message.push(newMessage as Message)
        await user.save();

        return Response.json(
            {
                success: true,
                message: "Message sent successfully",
                user   
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.log("Error in sending message",error)
        return Response.json(
            {
                success: false,
                message: "Error in sending message"
            },
            {
                status: 500
            }
        )
    }
}