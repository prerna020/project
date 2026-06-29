import { getServerSession } from "next-auth";
import dbConnect from "@/src/lib/db";
import UserModel from "@/src/models/User";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "@/src/models/User";
import mongoose from "mongoose";

export async function DELETE(request: Request) {
    await dbConnect()

    try {
        const session = await getServerSession(authOptions)
        const user:User = session?.user
        if(!session || !user){
            return Response.json(
                {
                    success:false,
                    message:"Not Authenticated"
                },
                {
                    status:401
                }
            )
        }

        const {messageId} = await request.json()

        const userId = new mongoose.Types.ObjectId(user._id)

        const updatedUser = await UserModel.updateOne(
            {
                _id: userId
            },
            {
                $pull: {
                    messages: {
                        _id: new mongoose.Types.ObjectId(messageId)
                    }
                }
            }
        )

        if(!updatedUser){
            return Response.json(
                {
                    success:false,
                    message:"Failed to delete message"
                },
                {
                    status:500
                }
            )
        }

        return Response.json(
            {
                success:true,
                message:"Message deleted successfully"
            },
            {
                status:200
            }
        )
    } catch (error) {
        console.log("Error deleting message", error)
        return Response.json(
            {
                success:false,
                message:"Error deleting message"
            },
            {
                status:500
            }
        )
    }
}