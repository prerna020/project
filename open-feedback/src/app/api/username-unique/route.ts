import dbConnect from "@/src/lib/db";
import UserModel from "@/src/models/User";
import {z} from "zod"
import { usernameValidation } from "@/src/schemas/signUp";

const usernameQuerySchema = z.object({
    username : usernameValidation
})

export async function GET(request: Request){

    // if(request.method != 'GET'){
    //     return Response.json({
    //         success: false,
    //         message: "Invalid request method"
    //     }, 
    //     {
    //         status: 405
    //     }
    //     )
    // }

    await dbConnect()

    try{
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }
        const result = usernameQuerySchema.safeParse(queryParam)

        console.log(result) // contains lot of info

        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors.length>0 ? usernameErrors.join(", "): "Invalid parameters"
            }, {
                status: 400
            }
            )
        }

        const {username} = result.data

        const existingVerifiedUser = await UserModel.findOne({username, isVerified: true})

        if(existingVerifiedUser){
            return Response.json({
                success: false,
                message: "verified username already exists"
            }, {
                status: 400
            })
        }

        return Response.json(
            {
                success: true,
                message: "username is available"
            }, 
            {
                status: 200
            }
        )



    }catch(error){
        console.log("Error occured while checking username unique ",error)
        return Response.json({
            success: false,
            message: "Error while checking username unique"
        }, 
        {
            status: 500
        }
        )
    }

}