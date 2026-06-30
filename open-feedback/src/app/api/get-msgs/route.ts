import { getServerSession } from "next-auth";
import dbConnect from "@/src/lib/db";
import UserModel from "@/src/models/User";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "@/src/models/User";
import mongoose from "mongoose";

export async function GET(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user
    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Not Authenticated"
            },
            {
                status: 401
            }
        )
    }
    const userId = new mongoose.Types.ObjectId(user._id)

    try {
        const user = await UserModel.aggregate([
            {
                $match: {
                    _id: userId
                }
            },
            {
                $unwind: "$message"
            },
            {
                $sort: {
                    "message.createdAt": -1
                }
            },
            {
                $group: {
                    _id: "$_id",
                    message: { $push: "$message" }
                }
            }
        ])
        if (!user || user.length === 0) {
            return Response.json(
                {
                    success: true,
                    message: "No messages found",
                    messages: []
                },
                {
                    status: 200
                }
            )
        }
        return Response.json(
            {
                success: true,
                message: "Messages fetched successfully",
                messages: user[0].message || []
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.log("Error fetching messages", error)
        return Response.json(
            {
                success: false,
                message: "Error fetching messages"
            },
            {
                status: 500
            }
        )
    }
}