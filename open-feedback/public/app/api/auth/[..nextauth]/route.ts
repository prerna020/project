import {NextAuthOptions} from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import dbConnect from '@/public/lib/db';
import UserModel from '@/public/models/User';

export const authOptions: NextAuthOptions= {
    providers:[
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",

            credentials: {
            username: { label: "Username", type: "text"},
            password: { label: "Password", type: "password" }
            },
            async authorize(credentials : any) : Promise<any> {
                await dbConnect()
                try {
                    const user = await UserModel.findOne({
                        $or:[
                            {email: credentials.identifier},
                            {username: credentials.identifier}
                        ]
                    })

                    if (!user){
                        throw new Error("No user found with this username or email")
                    }

                    if(!user.isVerified){
                        throw new Error("Please verify your account first")
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

                    if (!isPasswordCorrect){
                        throw new Error("Invalid password")
                    }
                    return user
                } catch (error) {
                    return null
                }                
            }
        })
    ],
    callbacks: {
        async jwt({token, user}){
            return token
        },
        async session({session, token}){
            return session
        }
    },
    session: {
        strategy : "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}