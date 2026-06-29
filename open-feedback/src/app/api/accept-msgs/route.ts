import { getServerSession } from "next-auth";
import dbConnect from "@/src/lib/db";
import UserModel from "@/src/models/User";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "@/src/models/User";

export async function POST(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user
    if (!session || !!session.user) {
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
    const { acceptMessages } = await request.json()
    const userId = user._id;

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, { isAcceptingMessage: acceptMessages }, { new: true })

        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Failed to update user status"
                },
                {
                    status: 400
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: "Message acceptance status updated successfully",
                user: updatedUser
            },
            {
                status: 200
            }
        )

    } catch (error) {
        console.log("Error updating message acceptance status", error)
        return Response.json(
            {
                success: false,
                message: "Error updating message acceptance status"
            },
            {
                status: 500
            }
        )
    }
}


export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions)
    const user: User = session?.user;

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

    const userId = user._id;
    const foundUser = await UserModel.findById(userId)
    try {
        if (!foundUser) {
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

        return Response.json(
            {
                success: true,
                message: "Message acceptance status",
                isAcceptingMessage: foundUser.isAcceptingMessage
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.log("Error getting message acceptance status", error)
        return Response.json(
            {
                success: false,
                message: "Error getting message acceptance status"
            },
            {
                status: 500
            }
        )
    }
}